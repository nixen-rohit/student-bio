import { useEffect, useState } from 'react';
import { MindmapCanvas } from './components/MindmapCanvas';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { NodeEditor } from './components/NodeEditor';
import { MindmapNode, CanvasNode, ViewTransform } from './types';
import { buildNodeTree, calculateNodePositions } from './utils/layout';

function App() {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [rawNodes, setRawNodes] = useState<MindmapNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<MindmapNode | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    loadNodesFromJSON();
    updateCanvasSize();

    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (rawNodes.length > 0) {
      recalculateLayout();
    }
  }, [rawNodes, canvasSize]);

  const updateCanvasSize = () => {
    const sidebar = 384;
    setCanvasSize({
      width: window.innerWidth - sidebar,
      height: window.innerHeight - 72,
    });
  };

  const loadNodesFromJSON = async () => {
    try {
      const response = await fetch('/mindmap-data.json');
      const data = await response.json();
      setRawNodes(data);
    } catch (error) {
      console.error('Error loading mindmap data:', error);
    }
  };

  const recalculateLayout = () => {
    const tree = buildNodeTree(rawNodes);
    const positioned = calculateNodePositions(tree, canvasSize.width, canvasSize.height);
    setNodes(positioned);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleExpandAll = () => {
    const updated = rawNodes.map(node => ({
      ...node,
      is_collapsed: false,
    }));
    setRawNodes(updated);
  };

  const handleCollapseAll = () => {
    const updated = rawNodes.map(node => ({
      ...node,
      is_collapsed: node.level === 0 ? false : true,
    }));
    setRawNodes(updated);
  };

  const handleDrillDown = () => {
    if (!selectedNodeId) return;

    const updated = rawNodes.map(node => {
      if (node.id === selectedNodeId) {
        return { ...node, is_collapsed: false };
      }
      if (node.parent_id === selectedNodeId) {
        return { ...node, is_collapsed: false };
      }
      return { ...node, is_collapsed: true };
    });
    setRawNodes(updated);
  };

  const handleDrillUp = () => {
    const selectedNode = rawNodes.find(n => n.id === selectedNodeId);
    if (!selectedNode?.parent_id) return;

    const updated = rawNodes.map(node => {
      if (node.id === selectedNode.parent_id) {
        return { ...node, is_collapsed: false };
      }
      return node;
    });
    setRawNodes(updated);
    setSelectedNodeId(selectedNode.parent_id);
  };

  const handleFitView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const handleAddNode = () => {
    setEditingNode(null);
    setIsEditorOpen(true);
  };

  const handleEditNode = (node: MindmapNode) => {
    setEditingNode(node);
    setIsEditorOpen(true);
  };

  const handleSaveNode = (node: MindmapNode) => {
    if (editingNode) {
      const updated = rawNodes.map(n =>
        n.id === editingNode.id
          ? {
              ...n,
              title: node.title,
              summary: node.summary,
              description: node.description,
              color: node.color,
              size: node.size,
            }
          : n
      );
      setRawNodes(updated);
    } else {
      const maxOrderResult = rawNodes.reduce((max, n) => {
        if (n.parent_id === node.parent_id) {
          return Math.max(max, n.order_index);
        }
        return max;
      }, -1);

      const parentLevel = node.parent_id
        ? rawNodes.find(n => n.id === node.parent_id)?.level || 0
        : -1;

      const newNode: MindmapNode = {
        id: generateId(),
        title: node.title,
        summary: node.summary,
        description: node.description,
        color: node.color,
        size: node.size,
        parent_id: node.parent_id,
        level: parentLevel + 1,
        order_index: maxOrderResult + 1,
        is_collapsed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setRawNodes([...rawNodes, newNode]);
    }

    setIsEditorOpen(false);
    setEditingNode(null);
  };

  const generateId = (): string => {
    return 'node-' + Math.random().toString(36).substr(2, 9);
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(rawNodes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedNode = rawNodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onDrillDown={handleDrillDown}
        onDrillUp={handleDrillUp}
        onFitView={handleFitView}
        onAddNode={handleAddNode}
        onDownload={handleDownload}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-gray-800 relative">
          <MindmapCanvas
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            hoveredNodeId={hoveredNodeId}
            onNodeClick={handleNodeClick}
            onNodeHover={setHoveredNodeId}
            transform={transform}
            onTransformChange={setTransform}
          />
        </div>

        <Sidebar selectedNode={selectedNode} onEdit={handleEditNode} />
      </div>

      <NodeEditor
        node={editingNode}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNode}
        parentNodes={rawNodes}
      />
    </div>
  );
}

export default App;
