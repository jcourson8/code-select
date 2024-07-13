import { createSignal, createEffect } from 'solid-js';
import { FileItem } from './useFileSelector';
import { generateOutput } from '../utils/formatUtils';

export function useOutputGenerator(
  items: () => FileItem[],
  selectedItems: () => Record<string, boolean>,
  outputVisibleItems: () => Record<string, boolean>,
  expandedFolders: () => Record<string, boolean>
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
    const output = await generateOutput(
      format,
      items,
      selectedItems,
      outputVisibleItems,
      expandedFolders
    );
    navigator.clipboard.writeText(output).then(() => {
      setCopyStatus(`Copied to clipboard as ${format.toUpperCase()}!`);
      setTimeout(() => setCopyStatus(''), 2000);
      setIsCopyLoading(false);
    });
  };

  createEffect(() => {
    setIsLoading(true);
    generateOutput(
      outputFormat(),
      items,
      selectedItems,
      outputVisibleItems,
      expandedFolders
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