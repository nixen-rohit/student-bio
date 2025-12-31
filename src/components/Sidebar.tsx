import { Sun, Edit } from 'lucide-react';
import { MindmapNode } from '../types';

interface SidebarProps {
  selectedNode: MindmapNode | null;
  onEdit: (node: MindmapNode) => void;
}

export function Sidebar({ selectedNode, onEdit }: SidebarProps) {
  return (
    <div className="w-96 bg-gray-800 text-white flex flex-col h-full">
      <div className="p-6 bg-blue-400 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Architecture Documentation</h2>
          <p className="text-sm text-blue-100">Interactive component visualization</p>
        </div>
        <Sun className="text-yellow-300" size={32} />
      </div>

      <div className="px-6 py-3 bg-gray-900">
        <span className="text-gray-400 text-sm">Root</span>
      </div>

      {selectedNode ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-400">
              {selectedNode.title}
            </h3>
            <button
              onClick={() => onEdit(selectedNode)}
              className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <Edit size={16} />
              <span className="text-sm">Edit</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">SUMMARY:</h4>
              <p className="text-gray-200 leading-relaxed">{selectedNode.summary}</p>
            </div>

            {selectedNode.description && selectedNode.description !== selectedNode.summary && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">DESCRIPTION:</h4>
                <p className="text-gray-200 leading-relaxed">{selectedNode.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">METADATA:</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Level: {selectedNode.level}</p>
                <p>Color: {selectedNode.color}</p>
                <p>Size: {selectedNode.size}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Select a node to view details</p>
        </div>
      )}
    </div>
  );
}
