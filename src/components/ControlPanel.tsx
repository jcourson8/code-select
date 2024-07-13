import { FiCopy } from 'solid-icons/fi';
import mdSvg from '../assets/md.svg';
import xmlSvg from '../assets/xml.svg';
import { Accessor } from 'solid-js';

interface ControlPanelProps {
  outputFormat: Accessor<'MD' | 'XML'>;
  onCopy: (format: 'MD' | 'XML') => void;
  onToggleOutputFormat: () => void;
  isCopyLoading: Accessor<boolean>;
}

const ControlPanel = (props: ControlPanelProps) => {
  return (
    <div class="flex-shrink-0 p-2 border-t border-dark-border flex justify-between items-center">
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
  );
};

export default ControlPanel;