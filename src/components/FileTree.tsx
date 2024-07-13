import { For, Show } from 'solid-js';
import FileItem from './FileItem';
import { FileItem as FileItemType } from '../hooks/useFileSelector';

interface FileTreeProps {
  items: FileItemType[];
  selectedFile: () => string | null;
  selectedItems: () => Record<string, boolean>;
  outputVisibleItems: () => Record<string, boolean>;
  expandedFolders: () => Record<string, boolean>;
  onSelectFile: (item: FileItemType, e: MouseEvent) => void;
  onToggleFolder: (item: FileItemType, e: MouseEvent) => void;
  onToggleSelection: (item: FileItemType) => void;
  onToggleOutputVisibility: (item: FileItemType) => void;
  isVisuallyVisible: (item: FileItemType) => boolean;
}

const FileTree = (props: FileTreeProps) => {
  return (
    <div class="flex-grow overflow-auto">
      <For each={props.items}>
        {(item) => (
          <Show when={props.isVisuallyVisible(item)}>
            <FileItem
              item={item}
              selectedFile={props.selectedFile}
              selectedItems={props.selectedItems}
              outputVisibleItems={props.outputVisibleItems}
              expandedFolders={props.expandedFolders}
              onSelectFile={props.onSelectFile}
              onToggleFolder={props.onToggleFolder}
              onToggleSelection={props.onToggleSelection}
              onToggleOutputVisibility={props.onToggleOutputVisibility}
            />
          </Show>
        )}
      </For>
    </div>
  );
};

export default FileTree;