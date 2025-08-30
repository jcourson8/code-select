import { createSignal, createEffect } from 'solid-js';
import { FileItem } from './useFileSelector';
import { generateOutput } from '../utils/formatUtils';

export function useOutputGenerator(
  items: () => FileItem[],
  selectedItems: () => Record<string, boolean>,
  outputVisibleItems: () => Record<string, boolean>,
  expandedFolders: () => Record<string, boolean>,
  fileReader?: () => ((path: string) => Promise<string>) | null
) {
  const [outputFormat, setOutputFormat] = createSignal<'MD' | 'XML'>('MD');
  const [generatedOutput, setGeneratedOutput] = createSignal<string>('');
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [copyStatus, setCopyStatus] = createSignal<string>('');
  const [isCopyLoading, setIsCopyLoading] = createSignal<boolean>(false);

  const toggleOutputFormat = () => {
    setOutputFormat((prev) => (prev === 'MD' ? 'XML' : 'MD'));
  };

  const copyToClipboard = async (format: 'MD' | 'XML') => {
    setIsCopyLoading(true);
    const reader = fileReader?.();
    const output = await generateOutput(
      format,
      () => items(),
      () => selectedItems(),
      () => outputVisibleItems(),
      () => expandedFolders(),
      reader
    );
    navigator.clipboard.writeText(output).then(() => {
      setCopyStatus(`Copied to clipboard as ${format.toUpperCase()}!`);
      setTimeout(() => setCopyStatus(''), 2000);
      setIsCopyLoading(false);
    });
  };

  createEffect(() => {
    // Access all reactive dependencies to ensure tracking
    const currentItems = items();
    const currentSelected = selectedItems();
    const currentVisible = outputVisibleItems();
    const currentExpanded = expandedFolders();
    const currentFormat = outputFormat();
    const reader = fileReader?.();
    

    
    setIsLoading(true);
    generateOutput(
      currentFormat,
      () => currentItems,
      () => currentSelected,
      () => currentVisible,
      () => currentExpanded,
      reader
    ).then((output) => {
      setGeneratedOutput(output);
      setIsLoading(false);
    });
  });

  return {
    outputFormat,
    generatedOutput,
    isLoading,
    copyStatus,
    isCopyLoading,
    toggleOutputFormat,
    copyToClipboard,
  };
}