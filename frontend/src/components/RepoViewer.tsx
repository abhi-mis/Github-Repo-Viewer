import { useState } from 'react';
import {
    Github,
    LogOut,
    FileCode,
    Loader2,
    Files,
    Star,
    GitFork,
    Eye,
    GitBranch,
} from 'lucide-react';
import BranchSelector from './BranchSelector.tsx';
import FileExplorer from './FileExplorer.tsx';
import CodeViewer from './CodeViewer.tsx';
import BranchesModal from './BranchesModal.tsx';
import {
    getFileContent,
    Branch,
    TreeItem,
    RepoMetadata,
} from '../services/githubService';
import { RepoInfo } from '../App';

interface RepoViewerProps {
    repoInfo: RepoInfo;
    repoMetadata: RepoMetadata;
    token: string;
    branches: Branch[];
    selectedBranch: string;
    tree: TreeItem[];
    loading: boolean;
    error: string | null;
    onBranchChange: (branch: string) => void;
    onDisconnect: () => void;
    onError: (error: string | null) => void;
}

export default function RepoViewer({
    repoInfo,
    repoMetadata,
    token,
    branches,
    selectedBranch,
    tree,
    loading,
    error,
    onBranchChange,
    onDisconnect,
    onError,
}: RepoViewerProps) {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [fileLoading, setFileLoading] = useState(false);
    const [isBranchesModalOpen, setIsBranchesModalOpen] = useState(false);

    const handleFileSelect = async (path: string) => {
        setSelectedFile(path);
        setFileLoading(true);
        onError(null);

        try {
            const content = await getFileContent(
                repoInfo.owner,
                repoInfo.repo,
                path,
                selectedBranch,
                token
            );
            setFileContent(content.content);
            setFileName(content.name);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to load file content');
            setFileContent('');
            setFileName('');
        } finally {
            setFileLoading(false);
        }
    };

    // Format numbers like GitHub (1k, 2.5k, etc)
    const formatCount = (count: number) => {
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'k';
        }
        return count.toString();
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* ===== Header ===== */}
            <header className="app-header">
                <div className="header-left">
                    {/* Logo */}
                    <div className="header-logo">
                        <Github size={32} strokeWidth={1.5} />
                    </div>

                    <div className="header-divider" />

                    {/* Repo Breadcrumb */}
                    <div className="repo-breadcrumb">
                        {repoMetadata?.owner?.avatar_url && (
                            <img
                                src={repoMetadata.owner.avatar_url}
                                alt={repoInfo.owner}
                                style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 4 }}
                            />
                        )}
                        <span className="repo-breadcrumb-owner">{repoInfo.owner}</span>
                        <span className="repo-breadcrumb-sep">/</span>
                        <span className="repo-breadcrumb-name">{repoInfo.repo}</span>
                        <span style={{
                            fontSize: '0.75rem',
                            border: '1px solid var(--gh-border-default)',
                            borderRadius: 99,
                            padding: '1px 8px',
                            marginLeft: 8,
                            color: 'var(--gh-fg-muted)',
                            fontWeight: 500
                        }}>
                            {repoMetadata?.private ? 'Private' : 'Public'}
                        </span>
                    </div>
                </div>

                <div className="header-right">
                    {/* Repo Stats */}
                    <div className="repo-stats" style={{ display: 'flex', gap: 12, marginRight: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--gh-fg-muted)' }}>
                            <Eye size={16} />
                            <span>{formatCount(repoMetadata?.watchers_count || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--gh-fg-muted)' }}>
                            <Star size={16} />
                            <span>{formatCount(repoMetadata?.stargazers_count || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--gh-fg-muted)' }}>
                            <GitFork size={16} />
                            <span>{formatCount(repoMetadata?.forks_count || 0)}</span>
                        </div>
                    </div>

                    {/* Branch Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BranchSelector
                            branches={branches}
                            selectedBranch={selectedBranch}
                            onBranchChange={onBranchChange}
                            onViewAll={() => setIsBranchesModalOpen(true)}
                        />
                        <button
                            onClick={() => setIsBranchesModalOpen(true)}
                            className="btn btn-ghost btn-sm"
                            style={{ gap: '0.375rem', color: 'var(--gh-fg-muted)', fontWeight: 600 }}
                        >
                            <GitBranch size={16} />
                            <span>{branches.length} <span style={{ fontWeight: 400 }}>Branches</span></span>
                        </button>
                    </div>

                    {/* Disconnect Button */}
                    <button
                        onClick={onDisconnect}
                        className="btn btn-ghost btn-sm"
                        title="Disconnect and return to login"
                        style={{ marginLeft: 8 }}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    <svg className="error-banner-icon" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2.343 13.657A8 8 0 1113.657 2.343 8 8 0 012.343 13.657zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z" />
                    </svg>
                    <span className="error-banner-text">{error}</span>
                </div>
            )}

            {/* Loading overlay for branch switching */}
            {loading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 1.5rem',
                    background: 'var(--gh-accent-subtle)',
                    borderBottom: '1px solid var(--gh-border-default)',
                    fontSize: '0.8125rem',
                    color: 'var(--gh-accent)',
                }}>
                    <Loader2 size={14} className="animate-spin-custom" />
                    Loading branch...
                </div>
            )}

            {/* ===== Main Content ===== */}
            <div className="main-layout">
                {/* Sidebar - File Explorer */}
                {tree.length > 0 && (
                    <FileExplorer
                        tree={tree}
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                    />
                )}

                {/* Content Area */}
                {selectedFile ? (
                    <CodeViewer
                        fileName={fileName}
                        filePath={selectedFile}
                        content={fileContent}
                        loading={fileLoading}
                    />
                ) : (
                    <div className="content-area">
                        <div className="empty-state">
                            {tree.length > 0 ? (
                                <>
                                    <FileCode size={64} className="empty-state-icon" />
                                    <h3 className="empty-state-title">No file selected</h3>
                                    <p className="empty-state-desc">
                                        Select a file from the explorer to view its contents
                                    </p>
                                </>
                            ) : loading ? (
                                <>
                                    <Loader2 size={40} className="animate-spin-custom" style={{ color: 'var(--gh-accent)', marginBottom: '1rem' }} />
                                    <h3 className="empty-state-title">Loading repository...</h3>
                                    <p className="empty-state-desc">Fetching file tree from GitHub</p>
                                </>
                            ) : (
                                <>
                                    <Files size={64} className="empty-state-icon" />
                                    <h3 className="empty-state-title">No files found</h3>
                                    <p className="empty-state-desc">
                                        This branch appears to be empty
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Branches Modal */}
            {isBranchesModalOpen && (
                <BranchesModal
                    branches={branches}
                    selectedBranch={selectedBranch}
                    onClose={() => setIsBranchesModalOpen(false)}
                    onSelect={onBranchChange}
                />
            )}
        </div>
    );
}
