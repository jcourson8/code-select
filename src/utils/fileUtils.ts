import { FileItem } from '../hooks/useFileSelector';

const excludedPatterns: string[] = [
  ".DS_Store",
  "node_modules",
  "bin",
  "*.exe",
  "*.dll",
  "*.so",
  "*.dylib",
];

export const isExcluded = (path: string): boolean => {
  const fileName = path.split("/").pop()!;
  return excludedPatterns.some((pattern) => {
    if (pattern.startsWith("*")) {
      // Exclude based on file extension patterns like *.exe, *.dll
      return fileName.endsWith(pattern.slice(1));
    }
    // Exclude directories like node_modules or bin, if any part of the path contains these
    return path.includes(pattern);
  });
};

export const parseFileStructure = (files: FileList): FileItem[] => {
  const result: FileItem[] = [];
  const excludedFolders: Set<string> = new Set(); // Track excluded folders

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const parts = file.webkitRelativePath.split("/");
    let path = "";
    let shouldExclude = false;

    // Check the path of each part and exclude entire folder chains
    parts.forEach((part, index) => {
      path += (index > 0 ? "/" : "") + part;

      // Check if the path is part of an already excluded folder
      if (Array.from(excludedFolders).some(folder => path.startsWith(folder))) {
        shouldExclude = true;
        return;
      }

      // Check if the current path should be excluded based on patterns
      if (isExcluded(path)) {
        if (index < parts.length - 1) {
          // If it's a folder being excluded, mark the entire folder
          excludedFolders.add(path);
        }
        shouldExclude = true;
        return;
      }

      // Only push non-excluded items to the result
      if (!shouldExclude && !result.find((item) => item.path === path)) {
        result.push({
          name: part,
          path,
          type: index === parts.length - 1 ? "file" : "folder",
          level: index,
          excluded: false, // It's already been checked for exclusion above
          fileRef: file,
        });
      }
    });
  }

  // Sort and return the result while ignoring excluded files and folders
  return result
    .filter(item => !item.excluded)
    .sort((a, b) => a.path.localeCompare(b.path));
};

export const getItemContent = async (item: FileItem): Promise<string> => {
  if (item.fileRef) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(item.fileRef!);
    });
  }
  return `Content of ${item.path}`;
};

export const isLargeFile = (file: File): boolean => {
  return file.size > 1024 * 1024; // Consider files larger than 1MB as large
};

export const isVisuallyVisible = (item: FileItem, expandedFolders: () => Record<string, boolean>): boolean => {
  if (item.level === 0) return true;
  const pathParts = item.path.split("/");
  let currentPath = "";
  for (let i = 0; i < pathParts.length - 1; i++) {
    currentPath += (i > 0 ? "/" : "") + pathParts[i];
    if (!expandedFolders()[currentPath]) return false;
  }
  return true;
};
