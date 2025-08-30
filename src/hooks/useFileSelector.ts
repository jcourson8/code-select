import { createSignal, createEffect } from 'solid-js';
import { getItemContent, parseFileStructure } from '../utils/fileUtils';
import { getLanguageFromFilename } from '../utils/languageConfig';


export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  level: number;
  excluded: boolean;
  fileRef?: File;
}

export function useFileSelector() {
  const [items, setItems] = createSignal<FileItem[]>([]);
  const [selectedItems, setSelectedItems] = createSignal<Record<string, boolean>>({});
  const [outputVisibleItems, setOutputVisibleItems] = createSignal<Record<string, boolean>>({});
  const [expandedFolders, setExpandedFolders] = createSignal<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = createSignal<string | null>(null);
  const [fileContent, setFileContent] = createSignal<string>('');
  const [currentLanguage, setCurrentLanguage] = createSignal<string>('javascript');
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [sandboxFileReader, setSandboxFileReader] = createSignal<((path: string) => Promise<string>) | null>(null);

  const handleFileUpload = (files: FileList) => {
    const parsedItems = parseFileStructure(files);
    setItems(parsedItems);
    const initialExpanded: Record<string, boolean> = {};
    const initialOutputVisible: Record<string, boolean> = {};
    const initialSelected: Record<string, boolean> = {};
    parsedItems.forEach((item) => {
      if (item.type === 'folder') initialExpanded[item.path] = false;
      initialOutputVisible[item.path] = !item.excluded;
      initialSelected[item.path] = false;
    });
    setExpandedFolders(initialExpanded);
    setOutputVisibleItems(initialOutputVisible);
    setSelectedItems(initialSelected);
    setSandboxFileReader(null); // Clear sandbox reader for local files
  };

  const setItemsFromSandbox = (fileItems: FileItem[], fileReader: (path: string) => Promise<string>) => {
    setItems(fileItems);
    setSandboxFileReader(() => fileReader);
    
    const initialExpanded: Record<string, boolean> = {};
    const initialOutputVisible: Record<string, boolean> = {};
    const initialSelected: Record<string, boolean> = {};
    fileItems.forEach((item) => {
      if (item.type === 'folder') initialExpanded[item.path] = false;
      initialOutputVisible[item.path] = !item.excluded;
      initialSelected[item.path] = false;
    });
    setExpandedFolders(initialExpanded);
    setOutputVisibleItems(initialOutputVisible);
    setSelectedItems(initialSelected);
    
    // Clear currently selected file when switching to sandbox
    setSelectedFile(null);
    setFileContent('');
    setCurrentLanguage('plaintext');
  };

  const toggleFolder = (item: FileItem, e: MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'folder') {
      setExpandedFolders((prev) => ({
        ...prev,
        [item.path]: !prev[item.path],
      }));
    }
  };

  const selectFile = async (item: FileItem | null) => {
    if (item && item.type === 'file') {
      setSelectedFile(item.path);
      setIsLoading(true);
      
      try {
        let content = '';
        const reader = sandboxFileReader();
        
        if (reader) {
          // Reading from sandbox
          content = await reader(item.path);
        } else {
          // Reading from local file
          content = await getItemContent(item);
        }
        
        setFileContent(content);
        setCurrentLanguage(getLanguageFromFilename(item.name));
      } catch (error) {
        console.error('Error reading file:', error);
        setFileContent('Error reading file');
        setCurrentLanguage('plaintext');
      }
      
      setIsLoading(false);
    } else {
      setSelectedFile(null);
      setFileContent('');
      setCurrentLanguage('plaintext');
    }
  };

  const toggleSelection = (item: FileItem) => {
    setSelectedItems((prev) => {
      const newSelected = { ...prev, [item.path]: !prev[item.path] };
      if (item.type === 'folder') {
        const children = items().filter((child) =>
          child.path.startsWith(item.path + '/')
        );
        children.forEach((child) => {
          newSelected[child.path] = newSelected[item.path];
        });
      }
      return newSelected;
    });
  };

  const toggleOutputVisibility = (item: FileItem) => {
    setOutputVisibleItems((prev) => ({
      ...prev,
      [item.path]: !prev[item.path],
    }));
  };

  const expandAll = () => {
    setExpandedFolders((prev) => {
      const newExpanded = { ...prev };
      items().forEach((item) => {
        if (item.type === 'folder') {
          newExpanded[item.path] = true;
        }
      });
      return newExpanded;
    });
  };

  const expandAllSubfolders = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newExpanded = { ...prev };
      // First expand the target folder itself
      newExpanded[folderPath] = true;
      // Then expand all its subfolders
      items().forEach((item) => {
        if (item.type === 'folder' && item.path.startsWith(folderPath + '/')) {
          newExpanded[item.path] = true;
        }
      });
      return newExpanded;
    });
  };

  createEffect(() => {
    if (selectedFile()) {
      setCurrentLanguage(getLanguageFromFilename(selectedFile()!));
    }
  });

  return {
    items,
    selectedItems,
    outputVisibleItems,
    expandedFolders,
    selectedFile,
    fileContent,
    currentLanguage,
    isLoading,
    handleFileUpload,
    toggleFolder,
    selectFile,
    toggleSelection,
    toggleOutputVisibility,
    expandAll,
    expandAllSubfolders,
    setItemsFromSandbox,
    sandboxFileReader,
  };
}

