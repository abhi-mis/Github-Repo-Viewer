import { useState } from 'react';
import { Github } from 'lucide-react';

interface RepoInputFormProps {
  onSubmit: (repoUrl: string, token: string) => void;
  loading: boolean;
}

export default function RepoInputForm({ onSubmit, loading }: RepoInputFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim() && token.trim()) {
      onSubmit(repoUrl.trim(), token.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <Github className="w-8 h-8 text-gray-800" />
        <h1 className="text-2xl font-bold text-gray-800">GitHub Repo Viewer</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="text"
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Personal Access Token (PAT)
          </label>
          <input
            type="password"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Your token is never stored and only used for API requests
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !repoUrl.trim() || !token.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Loading Repository...' : 'Load Repository'}
        </button>
      </form>
    </div>
  );
}
