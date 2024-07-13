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

  const selectFile = async (item: FileItem, e: MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'file') {
      setSelectedFile(item.path);
      setIsLoading(true);
      const content = await getItemContent(item);
      setFileContent(content);
      setIsLoading(false);
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
  };
}