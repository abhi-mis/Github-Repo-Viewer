import { useState, useMemo } from 'react';
import { ChevronRight, FolderClosed, File as FileIcon } from 'lucide-react';
import { TreeItem } from '../services/githubService';

interface FileNode {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  children?: FileNode[];
}

interface FileExplorerProps {
  tree: TreeItem[];
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

interface FileNodeMap {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  children?: { [key: string]: FileNodeMap };
}

function buildFileTree(items: TreeItem[]): FileNode[] {
  const root: { [key: string]: FileNodeMap } = {};

  items.forEach((item) => {
    const parts = item.path.split('/');
    let current: { [key: string]: FileNodeMap } = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join('/');

      if (!current[part]) {
        current[part] = {
          name: part,
          path: path,
          type: isLast ? item.type : 'tree',
          children: isLast && item.type === 'blob' ? undefined : {},
        };
      }

      if (!isLast && current[part].children) {
        current = current[part].children!;
      }
    });
  });

  const convertToArray = (obj: { [key: string]: FileNodeMap }): FileNode[] => {
    return Object.values(obj)
      .map((node) => ({
        name: node.name,
        path: node.path,
        type: node.type,
        children: node.children ? convertToArray(node.children) : undefined,
      }))
      .sort((a, b) => {
        if (a.type === 'tree' && b.type === 'blob') return -1;
        if (a.type === 'blob' && b.type === 'tree') return 1;
        return a.name.localeCompare(b.name);
      });
  };

  return convertToArray(root);
}

// Get file icon color based on extension
function getFileIconColor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const colorMap: { [key: string]: string } = {
    ts: '#3178c6',
    tsx: '#3178c6',
    js: '#f1e05a',
    jsx: '#f1e05a',
    py: '#3572A5',
    java: '#b07219',
    css: '#563d7c',
    scss: '#c6538c',
    html: '#e34c26',
    json: '#8bc34a',
    md: '#083fa1',
    yml: '#cb171e',
    yaml: '#cb171e',
    go: '#00ADD8',
    rs: '#dea584',
    rb: '#CC342D',
    php: '#4F5D95',
    swift: '#F05138',
    kt: '#A97BFF',
    dart: '#00B4AB',
    vue: '#41b883',
    svg: '#ffb13b',
    sh: '#89e051',
    bash: '#89e051',
    sql: '#e38c00',
    xml: '#0060ac',
    toml: '#9c4221',
    lock: '#6e7681',
    gitignore: '#6e7681',
    env: '#6e7681',
  };
  return colorMap[ext || ''] || 'var(--gh-fg-muted)';
}

interface TreeNodeComponentProps {
  node: FileNode;
  level: number;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

function TreeNodeComponent({ node, level, onFileSelect, selectedFile }: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const handleClick = () => {
    if (node.type === 'tree') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.path);
    }
  };

  const isSelected = selectedFile === node.path;

  return (
    <div>
      <button
        onClick={handleClick}
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        title={node.path}
      >
        {node.type === 'tree' ? (
          <span className={`tree-node-chevron ${isExpanded ? 'expanded' : ''}`}>
            <ChevronRight size={14} />
          </span>
        ) : (
          <span style={{ width: '16px', flexShrink: 0 }} />
        )}

        {node.type === 'tree' ? (
          <FolderClosed size={16} className="tree-node-icon folder" />
        ) : (
          <FileIcon
            size={16}
            className="tree-node-icon file"
            style={{ color: getFileIconColor(node.name) }}
          />
        )}

        <span className="tree-node-name">{node.name}</span>
      </button>

      {node.type === 'tree' && isExpanded && node.children && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ tree, onFileSelect, selectedFile }: FileExplorerProps) {
  const fileTree = useMemo(() => buildFileTree(tree), [tree]);

  const fileCount = tree.filter((i) => i.type === 'blob').length;
  const folderCount = tree.filter((i) => i.type === 'tree').length;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">
          <FolderClosed size={14} />
          Files
        </span>
        <span style={{
          fontSize: '0.6875rem',
          color: 'var(--gh-fg-subtle)',
        }}>
          {fileCount} files · {folderCount} folders
        </span>
      </div>
      <div className="sidebar-tree">
        {fileTree.map((node) => (
          <TreeNodeComponent
            key={node.path}
            node={node}
            level={0}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    </div>
  );
}
