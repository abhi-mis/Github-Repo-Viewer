import { useState } from 'react';
import { Github, Eye, EyeOff, ArrowRight, Shield, Loader2 } from 'lucide-react';

interface LandingPageProps {
    onSubmit: (repoUrl: string, token: string) => void;
    loading: boolean;
    error: string | null;
}

export default function LandingPage({ onSubmit, loading, error }: LandingPageProps) {
    const [repoUrl, setRepoUrl] = useState('');
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (repoUrl.trim() && token.trim()) {
            onSubmit(repoUrl.trim(), token.trim());
        }
    };

    const isValid = repoUrl.trim().length > 0 && token.trim().length > 0;

    return (
        <div className="landing-container">
            <div className="landing-card">
                {/* Logo & Title */}
                <div className="landing-logo">
                    <Github size={40} strokeWidth={1.5} />
                </div>
                <h1 className="landing-title">GitHub Repo Viewer</h1>
                <p className="landing-subtitle">
                    Browse repositories, explore branches, and view code with syntax highlighting
                </p>

                {/* Error */}
                {error && (
                    <div className="error-banner" style={{ marginBottom: '1.25rem', margin: '0 0 1.25rem 0' }}>
                        <svg className="error-banner-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2.343 13.657A8 8 0 1113.657 2.343 8 8 0 012.343 13.657zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z" />
                        </svg>
                        <span className="error-banner-text">{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="repoUrl" className="form-label">
                            Repository URL
                        </label>
                        <input
                            type="text"
                            id="repoUrl"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/owner/repository"
                            className="form-input"
                            disabled={loading}
                            autoComplete="url"
                            spellCheck={false}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="token" className="form-label">
                            Personal Access Token
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showToken ? 'text' : 'password'}
                                id="token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                className="form-input"
                                style={{ paddingRight: '2.5rem' }}
                                disabled={loading}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                style={{
                                    position: 'absolute',
                                    right: '0.625rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--gh-fg-subtle)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    transition: 'color var(--transition-fast)',
                                }}
                                tabIndex={-1}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gh-fg-muted)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gh-fg-subtle)')}
                                aria-label={showToken ? 'Hide token' : 'Show token'}
                            >
                                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="form-hint">
                            <Shield size={12} />
                            Your token is never stored — only used for this session
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isValid}
                        className="btn btn-primary btn-full"
                        style={{ marginTop: '0.5rem', height: '42px' }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin-custom" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                Open Repository
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Footer hint */}
            <p style={{
                marginTop: '1.5rem',
                fontSize: '0.75rem',
                color: 'var(--gh-fg-subtle)',
                textAlign: 'center',
                zIndex: 1,
            }}>
                Works with public and private repositories
            </p>
        </div>
    );
}
