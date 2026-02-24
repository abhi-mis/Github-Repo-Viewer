import { useState, useMemo } from 'react';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';
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
    return Object.values(obj).map((node) => ({
      name: node.name,
      path: node.path,
      type: node.type,
      children: node.children ? convertToArray(node.children) : undefined,
    })).sort((a, b) => {
      if (a.type === 'tree' && b.type === 'blob') return -1;
      if (a.type === 'blob' && b.type === 'tree') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  return convertToArray(root);
}

interface TreeNodeProps {
  node: FileNode;
  level: number;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

function TreeNode({ node, level, onFileSelect, selectedFile }: TreeNodeProps) {
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
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {node.type === 'tree' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0 text-yellow-600" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0 text-yellow-600" />
            )}
          </>
        ) : (
          <>
            <div className="w-4" />
            <File className="w-4 h-4 flex-shrink-0 text-gray-500" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {node.type === 'tree' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
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

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Files</h3>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {fileTree.map((node) => (
          <TreeNode
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
