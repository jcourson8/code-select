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
      return fileName.endsWith(pattern.slice(1));
    }
    return path.includes(pattern);
  });
};

export const parseFileStructure = (files: FileList): FileItem[] => {
  const result: FileItem[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const parts = file.webkitRelativePath.split("/");
    let path = "";
    parts.forEach((part, index) => {
      path += (index > 0 ? "/" : "") + part;
      if (!result.find((item) => item.path === path)) {
        const excluded = isExcluded(path);
        result.push({
          name: part,
          path,
          type: index === parts.length - 1 ? "file" : "folder",
          level: index,
          excluded: excluded,
          fileRef: file,
        });
      }
    });
  }
  return result.sort((a, b) => a.path.localeCompare(b.path));
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