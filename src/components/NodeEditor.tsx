import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MindmapNode } from '../types';

interface NodeEditorProps {
  node: MindmapNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: MindmapNode) => void;
  parentNodes?: MindmapNode[];
}

export function NodeEditor({ node, isOpen, onClose, onSave, parentNodes = [] }: NodeEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    color: '#86EFAC',
    size: 'medium' as 'small' | 'medium' | 'large',
    parent_id: null as string | null,
  });

  useEffect(() => {
    if (node) {
      setFormData({
        title: node.title,
        summary: node.summary,
        description: node.description,
        color: node.color,
        size: node.size,
        parent_id: node.parent_id,
      });
    } else {
      setFormData({
        title: '',
        summary: '',
        description: '',
        color: '#86EFAC',
        size: 'medium',
        parent_id: null,
      });
    }
  }, [node]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (node) {
      onSave({ ...node, ...formData });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {node ? 'Edit Node' : 'Add Node'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Size
              </label>
              <select
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value as 'small' | 'medium' | 'large' })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {!node && parentNodes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parent Node
              </label>
              <select
                value={formData.parent_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, parent_id: e.target.value || null })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Root (No Parent)</option>
                {parentNodes.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
