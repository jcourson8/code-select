import { getItemContent, isVisuallyVisible } from './fileUtils';
import { FileItem } from '../hooks/useFileSelector';
import { Accessor } from 'solid-js';

const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
};

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop() || "";
};

export const generateOutput = async (
  format: 'MD' | 'XML',
  items: Accessor<FileItem[]>,
  selectedItems: Accessor<Record<string, boolean>>,
  outputVisibleItems: Accessor<Record<string, boolean>>,
  expandedFolders: Accessor<Record<string, boolean>>
): Promise<string> => {
  let output = "";
  const processItem = async (item: FileItem, indent = ""): Promise<void> => {
    if (isVisuallyVisible(item, expandedFolders) && outputVisibleItems()[item.path]) {
      if (format === "MD") {
        output += `${indent}- ${item.name}\n`;

        if (selectedItems()[item.path] && item.type === "file") {
          const content = await getItemContent(item);
          const extension = getFileExtension(item.name);
          output += `${indent}  \`\`\`${extension}\n${content}\n${indent}  \`\`\`\n`;
        }
      } else if (format === "XML") {
        const tag = item.type === "folder" ? "folder" : "file";
        output += `${indent}<${tag} name="${escapeXml(item.name)}">\n`;

        if (selectedItems()[item.path] && item.type === "file") {
          const content = await getItemContent(item);
          output += `${indent}  <content><![CDATA[${content}]]></content>\n`;
        }
      }

      if (item.type === "folder" && expandedFolders()[item.path]) {
        const children = items().filter(
          (child) =>
            child.path.startsWith(item.path + "/") &&
            child.path.split("/").length === item.path.split("/").length + 1
        );
        for (const child of children) {
          await processItem(
            child,
            indent + (format === "MD" ? "  " : "    ")
          );
        }
      }

      if (format === "XML" && item.type === "folder") {
        output += `${indent}</folder>\n`;
      } else if (format === "XML" && item.type === "file") {
        output += `${indent}</file>\n`;
      }
    }
  };

  if (format === "XML") {
    output = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  }

  for (const item of items()) {
    if (item.level === 0) {
      await processItem(item, format === "XML" ? "    " : "");
    }
  }

  if (format === "XML") {
    output += "</root>";
  }

  return output;
};