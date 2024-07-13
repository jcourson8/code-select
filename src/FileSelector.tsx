import { createSignal, Show } from "solid-js";
import OutputViewer from "./components/OutputViewer";
import FileTree from "./components/FileTree";
import CodeViewer from "./components/CodeViewer";
import ControlPanel from "./components/ControlPanel";
import { FileItem, useFileSelector } from "./hooks/useFileSelector";
import { useOutputGenerator } from "./hooks/useOutputGenerator";

declare module "solid-js" {
  namespace JSX {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
      webkitdirectory?: boolean;
      directory?: boolean;
    }
  }
}

const FileSelector = () => {
  const {
    items,
    selectedItems,
    outputVisibleItems,
    expandedFolders,
    selectedFile,
    fileContent,
    currentLanguage,
    isLoading: isFileLoading,
    handleFileUpload,
    toggleFolder,
    selectFile,
    toggleSelection,
    toggleOutputVisibility,
  } = useFileSelector();

  const {
    outputFormat,
    generatedOutput,
    isLoading: isOutputLoading,
    copyStatus,
    isCopyLoading,
    toggleOutputFormat,
    copyToClipboard,
  } = useOutputGenerator(
    items,
    selectedItems,
    outputVisibleItems,
    expandedFolders
  );

  const [viewMode, setViewMode] = createSignal<"code" | "output">("output");
  const [dividerPos, setDividerPos] = createSignal(33);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "code" ? "output" : "code"));
  };

  const isVisuallyVisible = (item: FileItem) => {
    if (item.level === 0) return true;
    const pathParts = item.path.split("/");
    let currentPath = "";
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath += (i > 0 ? "/" : "") + pathParts[i];
      if (!expandedFolders()[currentPath]) return false;
    }
    return true;
  };

  let dividerRef: HTMLDivElement | undefined;
  let leftPanelRef: HTMLDivElement | undefined;
  let rightPanelRef: HTMLDivElement | undefined;

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeftWidth = leftPanelRef!.offsetWidth;

    const doDrag = (e: MouseEvent) => {
      const newLeftWidth = startLeftWidth + e.clientX - startX;
      const containerWidth = (leftPanelRef!.parentNode as HTMLElement).offsetWidth;
      const newLeftWidthPercent = (newLeftWidth / containerWidth) * 100;
      if (newLeftWidthPercent >= 18 && newLeftWidthPercent <= 82) {
        setDividerPos(newLeftWidthPercent);
      }
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  return (
    <div class="h-screen flex flex-col bg-dark-background text-dark-text">
      <div class="flex-grow flex overflow-hidden">
        {/* Left Panel */}
        <div
          ref={leftPanelRef}
          class="flex-shrink-0 flex flex-col border-r border-dark-border overflow-hidden bg-dark-background"
          style={{ width: `${dividerPos()}%` }}
        >
          {/* Folder Selection */}
          <div class="flex-shrink-0 p-2 flex justify-between items-center">
            <label
              for="folder-upload"
              class="flex items-center cursor-pointer hover:bg-dark-buttonHover transition-colors p-2 rounded text-sm"
            >
              <span class="text-dark-text">Choose a folder</span>
              <input
                id="folder-upload"
                type="file"
                onChange={(e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                }}
                webkitdirectory
                directory
                multiple
                class="hidden"
              />
            </label>
            <button
              class="px-2 py-1 text-dark-text rounded hover:bg-dark-buttonHover text-xs border border-dark-border"
              onClick={toggleViewMode}
              title="Toggle view mode"
            >
              {viewMode() === "code" ? "Show Output" : "Show Code"}
            </button>
          </div>

          {/* File Tree */}
          <FileTree
            items={items()}
            selectedFile={selectedFile}
            selectedItems={selectedItems}
            outputVisibleItems={outputVisibleItems}
            expandedFolders={expandedFolders}
            onSelectFile={selectFile}
            onToggleFolder={toggleFolder}
            onToggleSelection={toggleSelection}
            onToggleOutputVisibility={toggleOutputVisibility}
            isVisuallyVisible={isVisuallyVisible}
          />

          {/* Control Panel */}
          <ControlPanel
            outputFormat={outputFormat}
            onCopy={copyToClipboard}
            onToggleOutputFormat={toggleOutputFormat}
            isCopyLoading={isCopyLoading}
          />
        </div>

        {/* Divider */}
        <div
          ref={dividerRef}
          class="w-1 bg-dark-border cursor-col-resize hover:bg-dark-accent transition-colors flex-shrink-0"
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel */}
        <div
          ref={rightPanelRef}
          class="flex-grow flex flex-col overflow-hidden bg-dark-background"
        >
          <div class="flex-grow overflow-auto bg-dark-background text-xs p-2">
            <Show
              when={!isFileLoading() && !isOutputLoading()}
              fallback={
                <div class="flex items-center justify-center h-full">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dark-text"></div>
                </div>
              }
            >
              <Show
                when={viewMode() === "code"}
                fallback={
                  <OutputViewer
                    outputFormat={outputFormat}
                    generatedOutput={generatedOutput}
                  />
                }
              >
                <CodeViewer
                  selectedFile={selectedFile}
                  fileContent={fileContent}
                  currentLanguage={currentLanguage}
                />
              </Show>
            </Show>
          </div>
        </div>
      </div>
      <Show when={copyStatus()}>
        <div class="absolute bottom-4 right-4 bg-dark-surface text-dark-text px-4 py-2 rounded shadow-lg">
          {copyStatus()}
        </div>
      </Show>
    </div>
  );
};

export default FileSelector;