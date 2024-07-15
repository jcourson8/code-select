import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';

interface LanguageConfig {
  extension: string;
  language: string;
}

const languageConfig: LanguageConfig[] = [
  { extension: 'js', language: 'javascript' },
  { extension: 'py', language: 'python' },
  { extension: 'java', language: 'java' },
  { extension: 'md', language: 'markdown' },
  { extension: 'jsx', language: 'jsx' },
  { extension: 'ts', language: 'typescript' },
  { extension: 'tsx', language: 'tsx' },
  { extension: 'html', language: 'markup' },
  { extension: 'css', language: 'css' },
  { extension: 'toml', language: 'toml' },
  { extension: 'yaml', language: 'yaml' },
  { extension: 'json', language: 'json' },
];

const extensionToLanguage: Record<string, string> = Object.fromEntries(
  languageConfig.map(({ extension, language }) => [extension, language])
);

export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

export const getLanguageFromFilename = (filename: string): string => {
  const extension = getFileExtension(filename);
  return extensionToLanguage[extension] || 'plaintext';
};

export const highlightCode = (code: string, language: string): string => {
  if (Prism.languages[language]) {
    return Prism.highlight(code, Prism.languages[language], language);
  }
  return code;
};

export const highlightMarkdown = (content: string): string => {
  return content.replace(
    /(```(\w+)?\n)([\s\S]*?)(```)/g,
    (match, opening, language, code, closing) => {
      const highlightedCode = highlightCode(code, language || 'plaintext');
      return `${opening}${highlightedCode}${closing}`;
    }
  );
};
