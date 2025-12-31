import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Plus,
  Download,
  Expand,
  Minimize
} from 'lucide-react';

interface ToolbarProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onDrillDown: () => void;
  onDrillUp: () => void;
  onFitView: () => void;
  onAddNode: () => void;
  onDownload: () => void;
}

export function Toolbar({
  onExpandAll,
  onCollapseAll,
  onDrillDown,
  onDrillUp,
  onFitView,
  onAddNode,
  onDownload,
}: ToolbarProps) {
  return (
    <div className="flex gap-2 p-4 bg-gray-800">
      <button
        onClick={onExpandAll}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        <Expand size={18} />
        Expand All
      </button>

      <button
        onClick={onCollapseAll}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
      >
        <Minimize size={18} />
        Collapse All
      </button>

      <button
        onClick={onDrillDown}
        className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
      >
        <ChevronDown size={18} />
        Drill Down
      </button>

      <button
        onClick={onDrillUp}
        className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
      >
        <ChevronUp size={18} />
        Drill Up
      </button>

      <button
        onClick={onFitView}
        className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
      >
        <Maximize2 size={18} />
        Fit View
      </button>

      <button
        onClick={onAddNode}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Plus size={18} />
        Add Node
      </button>

      <button
        onClick={onDownload}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
      >
        <Download size={18} />
        Download
      </button>
    </div>
  );
}
