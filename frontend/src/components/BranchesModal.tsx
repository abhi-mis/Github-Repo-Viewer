import { useState, useRef, useEffect } from 'react';
import { X, Search, GitBranch, Check } from 'lucide-react';
import { Branch } from '../services/githubService';

interface BranchesModalProps {
    branches: Branch[];
    selectedBranch: string;
    onClose: () => void;
    onSelect: (branchName: string) => void;
}

export default function BranchesModal({ branches, selectedBranch, onClose, onSelect }: BranchesModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchRef.current) {
            searchRef.current.focus();
        }
    }, []);

    const filteredBranches = branches.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                <button
                                    key={branch.name}
                                    className={`branch-item ${selectedBranch === branch.name ? 'active' : ''}`}
                                    onClick={() => {
                                        onSelect(branch.name);
                                        onClose();
                                    }}
                                    style={{ padding: '12px 24px', width: '100%' }}
                                >
                                    <span className="branch-item-check" style={{ width: 24 }}>
                                        {selectedBranch === branch.name ? <Check size={18} /> : <div style={{ width: 18 }} />}
                                    </span>
                                    <GitBranch size={16} style={{ marginRight: 8, color: 'var(--gh-fg-muted)' }} />
                                    <span className="branch-item-name" style={{ fontSize: '14px' }}>{branch.name}</span>
                                </button>
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
