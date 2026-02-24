import { useState } from 'react';
import LandingPage from './components/LandingPage.tsx';
import RepoViewer from './components/RepoViewer.tsx';
import {
  parseRepoUrl,
  getBranches,
  getRepoTree,
  getRepoMetadata,
  Branch,
  TreeItem,
  RepoMetadata,
} from './services/githubService';

export interface RepoInfo {
  owner: string;
  repo: string;
}

function App() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [token, setToken] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [repoMetadata, setRepoMetadata] = useState<RepoMetadata | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleRepoSubmit = async (repoUrl: string, githubToken: string) => {
    setError(null);
    setLoading(true);

    try {
      const parsed = parseRepoUrl(repoUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub repository URL. Use format: https://github.com/owner/repo');
      }

      setRepoInfo(parsed);
      setToken(githubToken);

      // Fetch branches and repo metadata concurrently
      const [fetchedBranches, fetchedMetadata] = await Promise.all([
        getBranches(parsed.owner, parsed.repo, githubToken),
        getRepoMetadata(parsed.owner, parsed.repo, githubToken)
      ]);

      setBranches(fetchedBranches);
      setRepoMetadata(fetchedMetadata);

      if (fetchedBranches.length > 0) {
        const defaultBranch =
          fetchedBranches.find((b) => b.name === 'main') ||
          fetchedBranches.find((b) => b.name === 'master') ||
          fetchedBranches[0];
        setSelectedBranch(defaultBranch.name);
        await loadTree(parsed.owner, parsed.repo, defaultBranch.name, githubToken);
      }

      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repository');
      setBranches([]);
      setTree([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTree = async (owner: string, repo: string, branch: string, githubToken: string) => {
    try {
      const treeData = await getRepoTree(owner, repo, branch, githubToken);
      setTree(treeData.tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repository tree');
      setTree([]);
    }
  };

  const handleBranchChange = async (branch: string) => {
    if (!repoInfo) return;
    setSelectedBranch(branch);
    setLoading(true);
    setError(null);

    try {
      await loadTree(repoInfo.owner, repoInfo.repo, branch, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branch');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setRepoInfo(null);
    setToken('');
    setBranches([]);
    setRepoMetadata(null);
    setSelectedBranch('');
    setTree([]);
    setError(null);
  };

  if (!isConnected) {
    return (
      <LandingPage
        onSubmit={handleRepoSubmit}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <RepoViewer
      repoInfo={repoInfo!}
      repoMetadata={repoMetadata!}
      token={token}
      branches={branches}
      selectedBranch={selectedBranch}
      tree={tree}
      loading={loading}
      error={error}
      onBranchChange={handleBranchChange}
      onDisconnect={handleDisconnect}
      onError={setError}
    />
  );
}

export default App;
