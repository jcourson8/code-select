import { createSignal } from 'solid-js';
import { FileItem } from './useFileSelector';

interface RepoCloneState {
  isCloning: boolean;
  error: string | null;
  repoData: any | null;
}

interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

interface GitHubApiResponse {
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export function useGitHubRepo() {
  const [cloneState, setCloneState] = createSignal<RepoCloneState>({
    isCloning: false,
    error: null,
    repoData: null
  });

  const cloneRepository = async (repoUrl: string): Promise<FileItem[]> => {
    setCloneState({
      isCloning: true,
      error: null,
      repoData: null
    });

    try {
      // Validate and parse GitHub URL
      const repoInfo = parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        throw new Error('Please enter a valid GitHub repository URL');
      }

      // Get repository tree from GitHub API
      const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/HEAD?recursive=1`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or is private');
        } else if (response.status === 403) {
          throw new Error('API rate limit exceeded. Try again later.');
        }
        throw new Error(`Failed to fetch repository: ${response.statusText}`);
      }

      const data: GitHubApiResponse = await response.json();
      
      if (data.truncated) {
        throw new Error('Repository is too large. Try with a smaller repository.');
      }

      // Store repo info for file fetching
      setCloneState(prev => ({ 
        ...prev, 
        repoData: repoInfo
      }));

      // Convert GitHub tree to FileItem structure
      const fileItems = convertGitHubTreeToFileItems(data.tree, repoInfo.repo);

      setCloneState(prev => ({
        ...prev,
        isCloning: false,
        error: null
      }));

      return fileItems;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setCloneState({
        isCloning: false,
        error: errorMessage,
        repoData: null
      });
      throw error;
    }
  };

  const readFileFromRepo = async (filePath: string): Promise<string> => {
    const repoData = cloneState().repoData;
    if (!repoData) {
      throw new Error('No repository data available');
    }

    try {
      // Remove repo name prefix from file path for API call
      const actualFilePath = filePath.startsWith(`${repoData.repo}/`) 
        ? filePath.substring(`${repoData.repo}/`.length)
        : filePath;

      console.log('Reading file:', { filePath, actualFilePath, repoData });

      // Fetch file content from GitHub API
      const apiUrl = `https://api.github.com/repos/${repoData.owner}/${repoData.repo}/contents/${actualFilePath}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error('GitHub API error:', response.status, response.statusText);
        throw new Error(`Failed to read file: ${actualFilePath} (${response.status})`);
      }

      const data = await response.json();
      
      // GitHub returns base64 encoded content
      if (data.encoding === 'base64' && data.content) {
        return atob(data.content.replace(/\s/g, ''));
      }
      
      return '';
    } catch (error) {
      console.error('Error reading file from GitHub:', error);
      return `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const cleanup = async () => {
    setCloneState(prev => ({ ...prev, repoData: null }));
  };

  return {
    cloneState,
    cloneRepository,
    readFileFromSandbox: readFileFromRepo, // Keep same interface
    cleanup
  };
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length < 2) return null;
    
    return {
      owner: pathParts[0],
      repo: pathParts[1].replace(/\.git$/, '') // Remove .git suffix if present
    };
  } catch {
    return null;
  }
}

function convertGitHubTreeToFileItems(tree: GitHubTreeItem[], repoName: string): FileItem[] {
  const items: FileItem[] = [];
  const directories = new Set<string>();

  // Add root folder with repo name
  items.push({
    name: repoName,
    path: repoName,
    type: 'folder',
    level: 0,
    excluded: false
  });
  directories.add(repoName);

  // Process files first and collect directories
  for (const item of tree) {
    if (item.type === 'blob') { // File
      const pathParts = item.path.split('/');
      
      // Add all parent directories (with repo name prefix)
      for (let i = 0; i < pathParts.length - 1; i++) {
        const dirPath = `${repoName}/${pathParts.slice(0, i + 1).join('/')}`;
        if (!directories.has(dirPath)) {
          directories.add(dirPath);
          items.push({
            name: pathParts[i],
            path: dirPath,
            type: 'folder',
            level: i + 1, // +1 because repo root is level 0
            excluded: isDefaultExcluded(pathParts.slice(0, i + 1).join('/'), 'folder')
          });
        }
      }

      // Add the file (with repo name prefix)
      const filePath = `${repoName}/${item.path}`;
      items.push({
        name: pathParts[pathParts.length - 1],
        path: filePath,
        type: 'file',
        level: pathParts.length, // +1 because repo root is level 0, but files are one more level
        excluded: isDefaultExcluded(item.path, 'file')
      });
    }
  }

  // Sort items by path for consistent ordering
  return items.sort((a, b) => a.path.localeCompare(b.path));
}

function isDefaultExcluded(path: string, type: 'file' | 'folder'): boolean {
  const excludedDirs = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '.cache',
    'public',
    'assets'
  ];
  
  const excludedFileExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.mp4', '.mp3', '.wav', '.avi',
    '.zip', '.tar', '.gz',
    '.exe', '.dll', '.so',
    '.lock'
  ];

  if (type === 'folder') {
    const folderName = path.split('/').pop() || '';
    return excludedDirs.includes(folderName) || folderName.startsWith('.');
  } else {
    const fileName = path.split('/').pop() || '';
    const hasExcludedExtension = excludedFileExtensions.some(ext => 
      fileName.toLowerCase().endsWith(ext)
    );
    return hasExcludedExtension || fileName.startsWith('.') || fileName === 'package-lock.json';
  }
}
