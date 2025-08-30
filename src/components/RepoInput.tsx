import { createSignal, Show } from 'solid-js';

interface RepoInputProps {
  onCloneRepo: (repoUrl: string) => Promise<void>;
  isCloning: boolean;
  error: string | null;
}

const RepoInput = (props: RepoInputProps) => {
  const [repoUrl, setRepoUrl] = createSignal('');

  const validateUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'github.com' && urlObj.pathname.includes('/');
    } catch {
      return false;
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && validateUrl(repoUrl()) && !props.isCloning) {
      props.onCloneRepo(repoUrl());
    }
  };

  return (
    <>
      <div class="flex-shrink-0 p-2 hover:bg-dark-buttonHover transition-colors flex justify-between items-center">
        <input
          type="url"
          value={repoUrl()}
          onInput={(e) => setRepoUrl((e.target as HTMLInputElement).value)}
          onKeyPress={handleKeyPress}
          placeholder="Paste GitHub repository URL"
          disabled={props.isCloning}
          class="flex-1 ml-2 bg-transparent text-dark-text placeholder-gray-500 outline-none disabled:opacity-50 cursor-text"
        />
        <Show when={props.isCloning}>
          <div class="text-dark-accent text-xs">Loading...</div>
        </Show>
      </div>
      <Show when={props.error}>
        <div class="bg-red-900/20 border-t border-red-500/30 px-3 py-2">
          <p class="text-xs text-red-400">{props.error}</p>
        </div>
      </Show>
    </>
  );
};

export default RepoInput;
