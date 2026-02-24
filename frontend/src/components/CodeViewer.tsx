import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, FileCode, Loader2 } from 'lucide-react';
import { detectLanguage } from '../services/githubService';

interface CodeViewerProps {
  fileName: string;
  filePath: string;
  content: string;
  loading?: boolean;
}

export default function CodeViewer({ fileName, filePath, content, loading }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const language = detectLanguage(fileName);
  const lineCount = content ? content.split('\n').length : 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build breadcrumb segments from file path
  const pathSegments = filePath ? filePath.split('/') : [];

  if (loading) {
    return (
      <div className="content-area">
        <div className="content-header">
          <div className="content-header-left">
            <FileCode size={16} style={{ color: 'var(--gh-fg-muted)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--gh-fg-muted)' }}>Loading...</span>
          </div>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <Loader2
            size={28}
            className="animate-spin-custom"
            style={{ color: 'var(--gh-accent)' }}
          />
          <span className="loading-text">Loading file content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      {/* File Header */}
      <div className="content-header">
        <div className="content-header-left">
          <FileCode size={16} style={{ color: 'var(--gh-fg-muted)' }} />
          <div className="file-path-breadcrumb">
            {pathSegments.map((segment, index) => (
              <span key={index}>
                {index > 0 && <span className="file-path-sep"> / </span>}
                {index === pathSegments.length - 1 ? (
                  <span className="file-path-current">{segment}</span>
                ) : (
                  <span className="file-path-segment">{segment}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="content-header-right">
          <span className="line-count">{lineCount} lines</span>
          <span className="lang-badge">{language}</span>
          <button onClick={handleCopy} className="btn btn-ghost btn-sm" title="Copy file contents">
            {copied ? (
              <>
                <Check size={14} style={{ color: 'var(--gh-success)' }} />
                <span style={{ color: 'var(--gh-success)', fontSize: '0.8125rem' }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span style={{ fontSize: '0.8125rem' }}>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="content-body">
        <Editor
          language={language}
          value={content}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            renderLineHighlight: 'line',
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            padding: { top: 12, bottom: 12 },
            guides: {
              indentation: true,
              bracketPairs: true,
            },
            bracketPairColorization: {
              enabled: true,
            },
          }}
          loading={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: 'var(--gh-bg-canvas)',
            }}>
              <Loader2
                size={24}
                className="animate-spin-custom"
                style={{ color: 'var(--gh-accent)' }}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
