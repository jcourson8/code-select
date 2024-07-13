import { Show } from 'solid-js';
import { Highlight } from 'solid-highlight';

interface CodeViewerProps {
  selectedFile: () => string | null;
  fileContent: () => string;
  currentLanguage: () => string;
}

const CodeViewer = (props:CodeViewerProps) => {
  return (
    <Show
      when={props.selectedFile()}
      fallback={
        <div class="p-2">
          <code class="text-dark-textMuted">
            Select a file to view its content
          </code>
        </div>
      }
    >
      <Highlight language={props.currentLanguage()} class="h-full">
        {props.fileContent()}
      </Highlight>
    </Show>
  );
};

export default CodeViewer;