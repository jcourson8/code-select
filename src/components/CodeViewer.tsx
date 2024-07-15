// src/components/CodeViewer.tsx
import { Show } from 'solid-js';
import Prism from 'prismjs';
import { highlightCode } from '../utils/languageConfig';

interface CodeViewerProps {
  selectedFile: () => string | null;
  fileContent: () => string;
  currentLanguage: () => string;
}

const CodeViewer = (props: CodeViewerProps) => {
  return (
    <Show
      when={props.selectedFile()}
      fallback={
        <div class="p-4">
          <code class="text-dark-textMuted">
            Select a file to view its content
          </code>
        </div>
      }
    >
      <pre class={`language-${props.currentLanguage()}`}>
        <code
          innerHTML={highlightCode(props.fileContent(), props.currentLanguage())}
        />
      </pre>
    </Show>
  );
};

export default CodeViewer;