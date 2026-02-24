import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, FileCode } from 'lucide-react';
import { detectLanguage } from '../services/githubService';

interface CodeViewerProps {
  fileName: string;
  content: string;
  loading?: boolean;
}

export default function CodeViewer({ fileName, content, loading }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const language = detectLanguage(fileName);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">{fileName}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div style={{ height: 'calc(100vh - 300px)' }}>
        <Editor
          language={language}
          value={content}
          theme="vs-light"
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
