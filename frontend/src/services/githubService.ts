const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/github';

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

export interface TreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface TreeResponse {
  sha: string;
  url: string;
  tree: TreeItem[];
  truncated: boolean;
}

export interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  content: string;
  encoding: string;
  type: string;
}

export interface RepoMetadata {
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  private: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  html_url: string;
}

export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(githubUrlPattern);

  if (match) {
    return {
      owner: match[1],
      repo: match[2].replace('.git', ''),
    };
  }

  return null;
};

export const getBranches = async (
  owner: string,
  repo: string,
  token: string
): Promise<Branch[]> => {
  const url = `${API_BASE}/branches?owner=${owner}&repo=${repo}`;

  const response = await fetch(url, {
    headers: {
      'X-GitHub-Token': token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch branches');
  }

  return response.json();
};

export const deleteBranch = async (
  owner: string,
  repo: string,
  branch: string,
  token: string
): Promise<void> => {
  const url = `${API_BASE}/branches?owner=${owner}&repo=${repo}&branch=${branch}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-GitHub-Token': token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete branch');
  }
};

export const getRepoTree = async (
  owner: string,
  repo: string,
  branch: string,
  token: string
): Promise<TreeResponse> => {
  const url = `${API_BASE}/tree?owner=${owner}&repo=${repo}&branch=${branch}`;

  const response = await fetch(url, {
    headers: {
      'X-GitHub-Token': token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch repository tree');
  }

  return response.json();
};

export const getFileContent = async (
  owner: string,
  repo: string,
  path: string,
  branch: string,
  token: string
): Promise<FileContent> => {
  const encodedPath = encodeURIComponent(path);
  const url = `${API_BASE}/file?owner=${owner}&repo=${repo}&path=${encodedPath}&branch=${branch}`;

  const response = await fetch(url, {
    headers: {
      'X-GitHub-Token': token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch file content');
  }

  const data = await response.json();

  if (data.encoding === 'base64') {
    data.content = atob(data.content);
  }

  return data;
};

export const detectLanguage = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();

  const languageMap: { [key: string]: string } = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
    r: 'r',
    dart: 'dart',
    vue: 'vue',
  };

  return languageMap[extension || ''] || 'plaintext';
};

export const getRepoMetadata = async (
  owner: string,
  repo: string,
  token: string
): Promise<RepoMetadata> => {
  const url = `${API_BASE}/repo?owner=${owner}&repo=${repo}`;

  const response = await fetch(url, {
    headers: {
      'X-GitHub-Token': token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch repository metadata');
  }

  return response.json();
};
