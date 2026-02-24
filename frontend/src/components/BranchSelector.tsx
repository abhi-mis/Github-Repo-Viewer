import { useState, useRef, useEffect } from 'react';
import { GitBranch, ChevronDown, Check, Search } from 'lucide-react';
import { Branch } from '../services/githubService';

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  onViewAll: () => void;
}

export default function BranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
  onViewAll,
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (branchName: string) => {
    onBranchChange(branchName);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Determine what might be the "default" branch
  const defaultBranchName =
    branches.find((b) => b.name === 'main')?.name ||
    branches.find((b) => b.name === 'master')?.name ||
    branches[0]?.name;

  return (
    <div className="branch-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="branch-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id="branch-selector-btn"
      >
        <GitBranch size={14} className="branch-btn-icon" />
        <span className="branch-btn-name">{selectedBranch}</span>
        <ChevronDown size={14} className={`branch-btn-caret ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Invisible overlay to close dropdown */}
          <div
            className="branch-dropdown-overlay"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
          />

          {/* Dropdown Panel */}
          <div className="branch-dropdown-panel" role="listbox" aria-labelledby="branch-selector-btn">
            <div className="branch-dropdown-header">
              Switch branches
            </div>

            <div className="branch-search">
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--gh-fg-subtle)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Find a branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '1.75rem' }}
                />
              </div>
            </div>

            <div className="branch-list">
              {filteredBranches.length === 0 ? (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.8125rem',
                  color: 'var(--gh-fg-subtle)',
                }}>
                  No branches found
                </div>
              ) : (
                filteredBranches.map((branch) => (
                  <button
                    key={branch.name}
                    className={`branch-item ${selectedBranch === branch.name ? 'active' : ''}`}
                    onClick={() => handleSelect(branch.name)}
                    role="option"
                    aria-selected={selectedBranch === branch.name}
                  >
                    <span className="branch-item-check">
                      {selectedBranch === branch.name ? <Check size={16} /> : null}
                    </span>
                    <span className="branch-item-name">{branch.name}</span>
                    {branch.name === defaultBranchName && (
                      <span className="branch-item-default">default</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Branch count footer */}
            <div style={{
              padding: '0.5rem 0.75rem',
              borderTop: '1px solid var(--gh-border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
              color: 'var(--gh-fg-subtle)',
            }}>
              <span>{branches.length} branch{branches.length !== 1 ? 'es' : ''}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.6875rem', padding: '1px 6px', height: 'auto', color: 'var(--gh-accent)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onViewAll();
                }}
              >
                View all branches
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
