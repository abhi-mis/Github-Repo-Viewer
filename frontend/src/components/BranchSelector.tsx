import { GitBranch } from 'lucide-react';
import { Branch } from '../services/githubService';

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
}

export default function BranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
}: BranchSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-md shadow-sm border border-gray-200">
      <GitBranch className="w-5 h-5 text-gray-600" />
      <label htmlFor="branch" className="text-sm font-medium text-gray-700">
        Branch:
      </label>
      <select
        id="branch"
        value={selectedBranch}
        onChange={(e) => onBranchChange(e.target.value)}
        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
      >
        {branches.map((branch) => (
          <option key={branch.name} value={branch.name}>
            {branch.name}
          </option>
        ))}
      </select>
    </div>
  );
}
