import { useState, useRef, useEffect } from 'react';
import { X, Search, GitBranch, Trash2, Loader2 } from 'lucide-react';
import { Branch } from '../services/githubService';

interface BranchesModalProps {
    branches: Branch[];
    selectedBranch: string;
    onClose: () => void;
    onSelect: (branchName: string) => void;
    onDelete: (branchName: string) => Promise<void>;
}

export default function BranchesModal({
    branches,
    selectedBranch,
    onClose,
    onSelect,
    onDelete
}: BranchesModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingBranch, setDeletingBranch] = useState<string | null>(null);
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        searchRef.current?.focus();
    }, []);

    const filteredBranches = branches.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAllSelected =
        filteredBranches.length > 0 &&
        filteredBranches.every((b) => selectedBranches.includes(b.name));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedBranches([]);
        } else {
            setSelectedBranches(
                filteredBranches
                    .map((b) => b.name)
                    .filter((name) => name !== selectedBranch) // avoid current branch
            );
        }
    };

    const toggleSelect = (branchName: string) => {
        setSelectedBranches((prev) =>
            prev.includes(branchName)
                ? prev.filter((b) => b !== branchName)
                : [...prev, branchName]
        );
    };

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

    const handleBulkDelete = async () => {
        if (selectedBranches.length === 0) return;

        const confirmDelete = window.confirm(
            `Delete ${selectedBranches.length} branches?`
        );
        if (!confirmDelete) return;

        setBulkDeleting(true);
        try {
            await Promise.all(selectedBranches.map(onDelete));
            setSelectedBranches([]);
        } catch (err) {
            console.error('Bulk delete failed:', err);
        } finally {
            setBulkDeleting(false);
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

                {/* Search + Actions */}
                <div style={{ borderBottom: '1px solid var(--gh-border-default)', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--gh-fg-subtle)',
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

                        <button className="btn btn-sm" onClick={toggleSelectAll}>
                            {isAllSelected ? 'Unselect All' : 'Select All'}
                        </button>

                        <button
                            className="btn btn-danger btn-sm"
                            disabled={selectedBranches.length === 0 || bulkDeleting}
                            onClick={handleBulkDelete}
                        >
                            {bulkDeleting ? (
                                <Loader2 size={14} className="animate-spin-custom" />
                            ) : (
                                `Delete (${selectedBranches.length})`
                            )}
                        </button>
                    </div>
                </div>

                {/* Branch List */}
                <div className="modal-body" style={{ padding: 0 }}>
                    <div className="branch-list">
                        {filteredBranches.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                No branches matched your search
                            </div>
                        ) : (
                            filteredBranches.map((branch) => (
                                <div
                                    key={branch.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderBottom: '1px solid var(--gh-border-default)',
                                    }}
                                >
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        disabled={branch.name === selectedBranch}
                                        checked={selectedBranches.includes(branch.name)}
                                        onChange={() => toggleSelect(branch.name)}
                                        style={{ marginLeft: 12 }}
                                    />

                                    {/* Branch Button */}
                                    <button
                                        onClick={() => {
                                            onSelect(branch.name);
                                            onClose();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: 'none',
                                            background: 'transparent',
                                        }}
                                    >
                                        <GitBranch size={16} style={{ marginRight: 8 }} />
                                        {branch.name}
                                    </button>

                                    {/* Single Delete */}
                                    <div style={{ padding: '0 12px' }}>
                                        {deletingBranch === branch.name ? (
                                            <Loader2 size={16} className="animate-spin-custom" />
                                        ) : (
                                            branch.name !== selectedBranch && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(branch.name);
                                                    }}
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