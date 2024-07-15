import { FiChevronRight, FiFile } from 'solid-icons/fi';
import CustomCheckbox from './CustomCheckbox';
import { Accessor } from 'solid-js';
import { FileItem as FileItemType } from '../hooks/useFileSelector';
import VisibilityToggle from './VisibilityToggle';

interface FileItemProps {
  item: FileItemType;
  selectedFile: Accessor<string | null>;
  selectedItems: Accessor<Record<string, boolean>>;
  outputVisibleItems: Accessor<Record<string, boolean>>;
  expandedFolders: Accessor<Record<string, boolean>>;
  onSelectFile: () => void;
  onToggleFolder: (e: MouseEvent) => void;
  onToggleSelection: () => void;
  onToggleOutputVisibility: () => void;
}

const FileItem = (props: FileItemProps) => {
  return (
    <div
      class={`flex items-center cursor-pointer hover:bg-dark-buttonHover px-2 py-1 ${
        props.item.type === 'file' && props.selectedFile() === props.item.path
          ? `bg-dark-selected`
          : ''
      }`}
      style={`padding-left: ${props.item.level * 16 + 4}px`}
      onClick={(e) => {
        e.stopPropagation();
        if (props.item.type === 'file') {
          props.onSelectFile();
        } else {
          props.onToggleFolder(e);
        }
      }}
    >
      {props.item.type === 'folder' ? (
        <FiChevronRight
          size={16}
          class={`text-dark-text ${
            props.expandedFolders()[props.item.path] ? 'transform rotate-90' : ''
          }`}
        />
      ) : (
        <FiFile size={16} class="text-dark-text" />
      )}
      <span class="ml-2 flex-grow">{props.item.name}</span>
      <div class="flex-shrink-0 flex items-center">
        <CustomCheckbox
          checked={() => props.selectedItems()[props.item.path]}
          onChange={props.onToggleSelection}
        />
        <VisibilityToggle
          visible={() => props.outputVisibleItems()[props.item.path]}
          onChange={props.onToggleOutputVisibility}
        />
      </div>
    </div>
  );
};

export default FileItem;