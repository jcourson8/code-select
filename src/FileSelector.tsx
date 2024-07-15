import { createSignal, Match, Show, Switch } from "solid-js";
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

  const [dividerPos, setDividerPos] = createSignal(33);

  const [viewMode, setViewMode] = createSignal<"code" | "output">("output");

  const handleFileSelection = (item: FileItem) => {
    if (item.type === "file") {
      if (selectedFile() === item.path) {
        // If the same file is clicked again, deselect it
        selectFile(null);
        setViewMode("output");
      } else {
        // Select the new file and switch to code view
        selectFile(item);
        setViewMode("code");
      }
    }
  };

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
      const containerWidth = (leftPanelRef!.parentNode as HTMLElement)
        .offsetWidth;
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
    <div class="h-screen flex flex-col bg-dark-background text-dark-text text-sm">
      <div class="flex-grow flex overflow-hidden">
        {/* Left Panel */}
        <div
          ref={leftPanelRef}
          class="flex-shrink-0 flex flex-col border-r border-dark-border overflow-hidden bg-dark-background"
          style={{ width: `${dividerPos()}%` }}
        >
          {/* Folder Selection */}
          <div class="flex-shrink-0 p-2 hover:bg-dark-buttonHover cursor-pointer transition-colors flex justify-between items-center">
            <label for="folder-upload" class="flex items-center rounded">
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
          </div>

          {/* File Tree */}
          <FileTree
            items={items}
            selectedFile={selectedFile}
            selectedItems={selectedItems}
            outputVisibleItems={outputVisibleItems}
            expandedFolders={expandedFolders}
            onSelectFile={handleFileSelection}
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
          {/* View Toggle */}
          <div class="flex py-4 px-4 border-b border-dark-border">
            <button
              class={`px-4 py-2 rounded-l-md  border border-dark-border ${
                viewMode() === "code"
                  ? "bg-dark-border text-white"
                  : "bg-dark-background text-dark-text"
              }`}
              onClick={() => setViewMode("code")}
            >
              Code
            </button>
            <button
              class={`px-4 py-2 rounded-r-md border border-dark-border ${
                viewMode() === "output"
                  ? "bg-dark-border text-white"
                  : "bg-dark-background text-dark-text"
              }`}
              onClick={() => setViewMode("output")}
            >
              Output
            </button>
          </div>

          <div class="flex-grow overflow-auto bg-dark-background ">
            <Show
              when={!isFileLoading() && !isOutputLoading()}
              fallback={
                <div class="flex items-center justify-center h-full">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dark-text"></div>
                </div>
              }
            >
              <Switch>
                <Match when={viewMode() === "code"}>
                  <CodeViewer
                    selectedFile={selectedFile}
                    fileContent={fileContent}
                    currentLanguage={currentLanguage}
                  />
                </Match>
                <Match when={viewMode() === "output"}>
                  <OutputViewer
                    outputFormat={outputFormat}
                    generatedOutput={generatedOutput}
                  />
                </Match>
              </Switch>
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
