import { useState } from 'react';
import RepoInputForm from './components/RepoInputForm';
import BranchSelector from './components/BranchSelector';
import FileExplorer from './components/FileExplorer';
import CodeViewer from './components/CodeViewer';
import {
  parseRepoUrl,
  getBranches,
  getRepoTree,
  getFileContent,
  Branch,
  TreeItem,
} from './services/githubService';
import { AlertCircle } from 'lucide-react';

function App() {
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);
  const [token, setToken] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRepoSubmit = async (repoUrl: string, githubToken: string) => {
    setError(null);
    setLoading(true);

    try {
      const parsed = parseRepoUrl(repoUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub repository URL');
      }

      setRepoInfo(parsed);
      setToken(githubToken);

      const fetchedBranches = await getBranches(parsed.owner, parsed.repo, githubToken);
      setBranches(fetchedBranches);

      if (fetchedBranches.length > 0) {
        const defaultBranch = fetchedBranches.find((b) => b.name === 'main') || fetchedBranches[0];
        setSelectedBranch(defaultBranch.name);
        await loadTree(parsed.owner, parsed.repo, defaultBranch.name, githubToken);
      }
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
      setSelectedFile(null);
      setFileContent('');
      setFileName('');
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

  const handleFileSelect = async (path: string) => {
    if (!repoInfo) return;
    setSelectedFile(path);
    setFileLoading(true);
    setError(null);

    try {
      const content = await getFileContent(repoInfo.owner, repoInfo.repo, path, selectedBranch, token);
      setFileContent(content.content);
      setFileName(content.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file content');
      setFileContent('');
      setFileName('');
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <RepoInputForm onSubmit={handleRepoSubmit} loading={loading} />

        {error && (
          <div className="mt-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {branches.length > 0 && (
          <div className="mt-8 max-w-7xl mx-auto">
            <div className="mb-4">
              <BranchSelector
                branches={branches}
                selectedBranch={selectedBranch}
                onBranchChange={handleBranchChange}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {tree.length > 0 && (
                  <FileExplorer tree={tree} onFileSelect={handleFileSelect} selectedFile={selectedFile} />
                )}
              </div>

              <div className="lg:col-span-2">
                {selectedFile && (
                  <CodeViewer fileName={fileName} content={fileContent} loading={fileLoading} />
                )}
                {!selectedFile && tree.length > 0 && (
                  <div className="bg-white rounded-md shadow-sm border border-gray-200 p-12 flex items-center justify-center">
                    <p className="text-gray-500 text-center">
                      Select a file from the explorer to view its contents
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && tree.length === 0 && (
          <div className="mt-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading repository...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
