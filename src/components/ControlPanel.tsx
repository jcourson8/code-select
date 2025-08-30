import { FiCopy, FiCode, FiFileText } from 'solid-icons/fi';
import { AiOutlineExpandAlt } from 'solid-icons/ai';
import mdSvg from '../assets/md.svg';
import xmlSvg from '../assets/xml.svg';
import { Accessor } from 'solid-js';

interface ControlPanelProps {
  outputFormat: Accessor<'MD' | 'XML'>;
  onCopy: (format: 'MD' | 'XML') => void;
  onToggleOutputFormat: () => void;
  isCopyLoading: Accessor<boolean>;
  onExpandAll: () => void;
  viewMode: Accessor<'code' | 'output'>;
  onToggleViewMode: () => void;
}

const ControlPanel = (props: ControlPanelProps) => {
  return (
    <div class="flex-shrink-0 p-2 border-t border-dark-border flex justify-between items-center">
      <div class="flex gap-2">
        <button
          onClick={() => props.onCopy(props.outputFormat())}
          class="p-1 text-dark-text rounded hover:bg-dark-buttonHover text-xs flex items-center border border-dark-border"
          title="Copy to clipboard"
          disabled={props.isCopyLoading()}
        >
          {props.isCopyLoading() ? (
            <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark-text"></div>
          ) : (
            <FiCopy size={18} class="text-dark-text" />
          )}
        </button>
        <button
          onClick={props.onExpandAll}
          class="p-1 text-dark-text rounded hover:bg-dark-buttonHover text-xs flex items-center border border-dark-border"
          title="Expand all folders"
        >
          <AiOutlineExpandAlt size={18} class="text-dark-text" />
        </button>
      </div>
      <div class="flex gap-2 items-center">
        {/* View Mode Toggle */}
                 <div class="flex border border-dark-border rounded">
           <button
             onClick={props.onToggleViewMode}
             class={`p-1 text-xs flex items-center rounded-l-[3px] ${
               props.viewMode() === 'code'
                 ? 'bg-gray-600 text-white'
                 : 'text-dark-text hover:bg-dark-buttonHover'
             }`}
             title="Code view"
           >
             <FiCode size={14} />
           </button>
           <button
             onClick={props.onToggleViewMode}
             class={`p-1 text-xs flex items-center rounded-r-[3px] ${
               props.viewMode() === 'output'
                 ? 'bg-gray-600 text-white'
                 : 'text-dark-text hover:bg-dark-buttonHover'
             }`}
             title="Output view"
           >
             <FiFileText size={14} />
           </button>
         </div>
        
        {/* Output Format Toggle */}
        <button
          onClick={props.onToggleOutputFormat}
          class="rounded text-xs flex items-center"
          title="Toggle output format"
        >
          <img
            src={props.outputFormat() === 'MD' ? mdSvg : xmlSvg}
            alt={props.outputFormat() === 'MD' ? 'Markdown' : 'XML'}
            class="h-5 invert"
          />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;