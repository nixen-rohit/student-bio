import { MindmapNode, CanvasNode } from '../types';

const NODE_SIZES = {
  small: 50,
  medium: 80,
  large: 120,
};

export function calculateNodeRadius(size: 'small' | 'medium' | 'large'): number {
  return NODE_SIZES[size];
}

export function buildNodeTree(nodes: MindmapNode[]): MindmapNode | null {
  const nodeMap = new Map<string, MindmapNode>();

  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  let root: MindmapNode | null = null;

  nodeMap.forEach(node => {
    if (node.parent_id === null) {
      root = node;
    } else {
      const parent = nodeMap.get(node.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    }
  });

  if (root && root.children) {
    root.children.sort((a, b) => a.order_index - b.order_index);
    sortChildrenRecursively(root);
  }

  return root;
}

function sortChildrenRecursively(node: MindmapNode) {
  if (node.children) {
    node.children.sort((a, b) => a.order_index - b.order_index);
    node.children.forEach(child => sortChildrenRecursively(child));
  }
}

export function calculateNodePositions(
  root: MindmapNode | null,
  canvasWidth: number,
  canvasHeight: number
): CanvasNode[] {
  if (!root) return [];

  const nodes: CanvasNode[] = [];
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  function positionNode(
    node: MindmapNode,
    x: number,
    y: number,
    angle: number,
    radius: number,
    level: number
  ) {
    const nodeRadius = calculateNodeRadius(node.size);
    const visible = !isAnyParentCollapsed(node, nodes);

    nodes.push({
      ...node,
      x,
      y,
      radius: nodeRadius,
      visible,
    });

    if (node.children && node.children.length > 0 && !node.is_collapsed) {
      const childCount = node.children.length;
      const nextRadius = radius + 200;
      const angleSpan = level === 0 ? Math.PI * 2 : Math.PI / (1 + level * 0.5);
      const startAngle = angle - angleSpan / 2;

      node.children.forEach((child, index) => {
        const childAngle = startAngle + (angleSpan * (index + 1)) / (childCount + 1);
        const childX = x + Math.cos(childAngle) * nextRadius;
        const childY = y + Math.sin(childAngle) * nextRadius;

        positionNode(child, childX, childY, childAngle, nextRadius, level + 1);
      });
    }
  }

  positionNode(root, centerX, centerY, 0, 0, 0);

  return nodes;
}

function isAnyParentCollapsed(node: MindmapNode, allNodes: CanvasNode[]): boolean {
  if (!node.parent_id) return false;

  const parent = allNodes.find(n => n.id === node.parent_id);
  if (!parent) return false;

  if (parent.is_collapsed) return true;

  return isAnyParentCollapsed(parent, allNodes);
}

export function getVisibleNodes(nodes: CanvasNode[]): CanvasNode[] {
  return nodes.filter(node => node.visible);
}

export function findNodeAtPosition(
  nodes: CanvasNode[],
  x: number,
  y: number,
  transform: { x: number; y: number; scale: number }
): CanvasNode | null {
  const canvasX = (x - transform.x) / transform.scale;
  const canvasY = (y - transform.y) / transform.scale;

  const visibleNodes = getVisibleNodes(nodes);

  for (let i = visibleNodes.length - 1; i >= 0; i--) {
    const node = visibleNodes[i];
    const dx = canvasX - (node.x || 0);
    const dy = canvasY - (node.y || 0);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= node.radius) {
      return node;
    }
  }

  return null;
}
