import { Accessor, Show, createMemo } from "solid-js";
import { highlightCode, highlightMarkdown } from "../utils/languageConfig";

interface OutputViewerProps {
  outputFormat: Accessor<"MD" | "XML">;
  generatedOutput: Accessor<string>;
}

const OutputViewer = (props: OutputViewerProps) => {
  const processedContent = createMemo(() => {
    const content = props.generatedOutput();
    if (props.outputFormat() === "MD") {
      return highlightMarkdown(content);
    }
    return highlightCode(content, props.outputFormat().toLowerCase());
  });

  return (
    <div class="p-4">
      <Show
        when={processedContent()}
        fallback={
          <code class="text-dark-textMuted">Select a folder to begin...</code>
        }
      >
        <pre>
          <code innerHTML={processedContent()} />
        </pre>
      </Show>
    </div>
  );
};

export default OutputViewer;
