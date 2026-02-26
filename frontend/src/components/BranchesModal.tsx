import { useState, useRef, useEffect } from 'react';
import { X, Search, GitBranch, Check, Trash2, Loader2 } from 'lucide-react';
import { Branch } from '../services/githubService';

interface BranchesModalProps {
    branches: Branch[];
    selectedBranch: string;
    onClose: () => void;
    onSelect: (branchName: string) => void;
    onDelete: (branchName: string) => Promise<void>;
}

export default function BranchesModal({ branches, selectedBranch, onClose, onSelect, onDelete }: BranchesModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingBranch, setDeletingBranch] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchRef.current) {
            searchRef.current.focus();
        }
    }, []);

    const filteredBranches = branches.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (branchName: string) => {
        setDeletingBranch(branchName);
        try {
            await onDelete(branchName);
        } catch (err) {
            console.error('Failed to delete branch:', err);
        } finally {
            setDeletingBranch(null);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">All Branches</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="branch-search" style={{ borderBottom: '1px solid var(--gh-border-default)', padding: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={16}
                            style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--gh-fg-subtle)',
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search branches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                <div className="modal-body" style={{ padding: 0 }}>
                    <div className="branch-list" style={{ maxHeight: 'none' }}>
                        {filteredBranches.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gh-fg-subtle)' }}>
                                No branches matched your search
                            </div>
                        ) : (
                            filteredBranches.map((branch) => (
                                <div
                                    key={branch.name}
                                    className={`branch-item-wrapper ${selectedBranch === branch.name ? 'active' : ''}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        borderBottom: '1px solid var(--gh-border-default)',
                                        background: selectedBranch === branch.name ? 'var(--gh-bg-secondary)' : 'transparent'
                                    }}
                                >
                                    <button
                                        className="branch-item"
                                        onClick={() => {
                                            onSelect(branch.name);
                                            onClose();
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: 'transparent',
                                            border: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer'
                                        }}
                                        disabled={deletingBranch === branch.name}
                                    >
                                        <span className="branch-item-check" style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                                            {selectedBranch === branch.name ? <Check size={18} color="var(--gh-accent)" /> : <div style={{ width: 18 }} />}
                                        </span>
                                        <GitBranch size={16} style={{ marginRight: 8, color: 'var(--gh-fg-muted)' }} />
                                        <span className="branch-item-name" style={{
                                            fontSize: '14px',
                                            fontWeight: selectedBranch === branch.name ? 600 : 400,
                                            color: selectedBranch === branch.name ? 'var(--gh-fg-default)' : 'var(--gh-fg-muted)'
                                        }}>
                                            {branch.name}
                                        </span>
                                    </button>

                                    {/* Action Area */}
                                    <div style={{ padding: '0 16px' }}>
                                        {deletingBranch === branch.name ? (
                                            <Loader2 size={16} className="animate-spin-custom" style={{ color: 'var(--gh-danger)' }} />
                                        ) : (
                                            selectedBranch !== branch.name && (
                                                <button
                                                    className="btn btn-ghost btn-sm delete-btn-hover"
                                                    style={{ color: 'var(--gh-fg-subtle)', padding: 4 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(branch.name);
                                                    }}
                                                    title="Delete branch"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
