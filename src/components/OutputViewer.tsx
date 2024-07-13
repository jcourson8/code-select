import { Highlight } from 'solid-highlight';
import { Accessor } from 'solid-js';

interface OutputViewerProps {
  outputFormat: Accessor<'MD' | 'XML'>;
  generatedOutput: Accessor<string>;
}

const OutputViewer = (props: OutputViewerProps) => {
  return (
    <Highlight
      language={props.outputFormat() === 'MD' ? 'markdown' : 'xml'}
    >
      {props.generatedOutput()}
    </Highlight>
  );
};

export default OutputViewer;