import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
// import 'prismjs/components/prism-cpp';
// import 'prismjs/components/prism-csharp';
// import 'prismjs/components/prism-go';
// import 'prismjs/components/prism-ruby';
// import 'prismjs/components/prism-php';
// import 'prismjs/components/prism-swift';
// import 'prismjs/components/prism-rust';
// import 'prismjs/components/prism-css';
// import 'prismjs/components/prism-xml-doc';
// import 'prismjs/components/prism-markup';
// import 'prismjs/components/prism-markdown';
// import 'prismjs/components/prism-json';
// import 'prismjs/components/prism-yaml';
// import 'prismjs/components/prism-toml';
// import 'prismjs/components/prism-bash';
// import 'prismjs/components/prism-sql';
// import 'prismjs/components/prism-graphql';
// import 'prismjs/components/prism-docker';

interface LanguageConfig {
  extension: string;
  language: string;
}

const languageConfig: LanguageConfig[] = [
  { extension: 'js', language: 'javascript' },
  { extension: 'py', language: 'python' },
  { extension: 'java', language: 'java' },
  { extension: 'cpp', language: 'cpp' },
  { extension: 'cs', language: 'csharp' },
  { extension: 'go', language: 'go' },
  { extension: 'rb', language: 'ruby' },
  { extension: 'php', language: 'php' },
  { extension: 'swift', language: 'swift' },
  { extension: 'rs', language: 'rust' },
  { extension: 'css', language: 'css' },
  { extension: 'xml', language: 'xml' },
  { extension: 'html', language: 'markup' },
  { extension: 'md', language: 'markdown' },
  { extension: 'json', language: 'json' },
  { extension: 'yml', language: 'yaml' },
  { extension: 'yaml', language: 'yaml' },
  { extension: 'toml', language: 'toml' },
  { extension: 'sh', language: 'bash' },
  { extension: 'sql', language: 'sql' },
  { extension: 'graphql', language: 'graphql' },
  { extension: 'dockerfile', language: 'docker' },
  { extension: 'jsx', language: 'jsx' },
  { extension: 'tsx', language: 'tsx' },
];

const extensionToLanguage: Record<string, string> = Object.fromEntries(
  languageConfig.map(({ extension, language }) => [extension, language])
);

const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

const getLanguageFromFilename = (filename: string): string => {
  const extension = getFileExtension(filename);
  return extensionToLanguage[extension] || 'plaintext';
};

const highlightCode = (code: string, language: string): string => {
  if (Prism.languages[language]) {
    return Prism.highlight(code, Prism.languages[language], language);
  }
  return code; // Fallback to plain text if language is not supported
};

export { getLanguageFromFilename, highlightCode };