import { FiChevronRight, FiFile, FiAlertTriangle } from 'solid-icons/fi';
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
  onSelectFile: (item: FileItemType, e: MouseEvent) => void;
  onToggleFolder: (item: FileItemType, e: MouseEvent) => void;
  onToggleSelection: (item: FileItemType) => void;
  onToggleOutputVisibility: (item: FileItemType) => void;
}

const FileItem = (props: FileItemProps) => {
  const isLargeFile = (file: File): boolean => file.size > 1024 * 1024;

  return (
    <div
      class={`flex items-center cursor-pointer hover:bg-dark-buttonHover px-2 py-1 ${
        props.item.type === 'file' && props.selectedFile() === props.item.path
          ? `bg-dark-selected`
          : ''
      } ${!props.outputVisibleItems()[props.item.path] ? 'opacity-50' : ''} ${
        props.item.excluded ? `text-dark-excluded` : ''
      } ${
        props.item.type === 'file' && props.item.fileRef && isLargeFile(props.item.fileRef)
          ? 'text-orange-400'
          : ''
      }`}
      style={`padding-left: ${props.item.level * 16 + 4}px`}
      onClick={(e: MouseEvent) =>
        props.item.type === 'file'
          ? props.onSelectFile(props.item, e)
          : props.onToggleFolder(props.item, e)
      }
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
      <span class="ml-2 flex-grow text-sm overflow-hidden text-ellipsis whitespace-nowrap">
        {props.item.name}
      </span>
      {props.item.type === 'file' && props.item.fileRef && isLargeFile(props.item.fileRef) && (
        <FiAlertTriangle
          size={16}
          class="text-orange-400 mr-1"
          title="Large file"
        />
      )}
      <div class="flex-shrink-0 flex items-center">
        <CustomCheckbox
          checked={() => props.selectedItems()[props.item.path]}
          onChange={() => props.onToggleSelection(props.item)}
        />
        <VisibilityToggle
          visible={() => props.outputVisibleItems()[props.item.path]}
          onChange={() => props.onToggleOutputVisibility(props.item)}
        />
      </div>
    </div>
  );
};

export default FileItem;