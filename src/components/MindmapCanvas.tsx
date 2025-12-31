import { useEffect, useRef, useState } from 'react';
import { CanvasNode, ViewTransform } from '../types';
import { getVisibleNodes, findNodeAtPosition } from '../utils/layout';

interface MindmapCanvasProps {
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  transform: ViewTransform;
  onTransformChange: (transform: ViewTransform) => void;
}

export function MindmapCanvas({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  onNodeClick,
  onNodeHover,
  transform,
  onTransformChange,
}: MindmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    const visibleNodes = getVisibleNodes(nodes);

    drawConnections(ctx, visibleNodes);
    drawNodes(ctx, visibleNodes, selectedNodeId, hoveredNodeId);

    ctx.restore();
  }, [nodes, selectedNodeId, hoveredNodeId, transform]);

  const drawConnections = (ctx: CanvasRenderingContext2D, visibleNodes: CanvasNode[]) => {
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;

    visibleNodes.forEach(node => {
      if (node.parent_id) {
        const parent = visibleNodes.find(n => n.id === node.parent_id);
        if (parent && parent.x !== undefined && parent.y !== undefined && node.x !== undefined && node.y !== undefined) {
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        }
      }
    });
  };

  const drawNodes = (
    ctx: CanvasRenderingContext2D,
    visibleNodes: CanvasNode[],
    selectedId: string | null,
    hoveredId: string | null
  ) => {
    visibleNodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) return;

      const isSelected = node.id === selectedId;
      const isHovered = node.id === hoveredId;

      if (isSelected) {
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (isHovered) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 20;
      }

      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = darkenColor(node.color, 20);
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#1F2937';
      ctx.font = `bold ${Math.max(12, node.radius / 4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      wrapText(ctx, node.title, node.x, node.y, node.radius * 1.6, node.radius / 5);
    });
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + index * lineHeight);
    });
  };

  const darkenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = findNodeAtPosition(nodes, x, y, transform);

    if (clickedNode) {
      onNodeClick(clickedNode.id);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      onTransformChange({
        ...transform,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      const hoveredNode = findNodeAtPosition(nodes, x, y, transform);

      if (hoveredNode) {
        onNodeHover(hoveredNode.id);
        setTooltip({
          text: hoveredNode.summary || hoveredNode.title,
          x: e.clientX,
          y: e.clientY,
        });
      } else {
        onNodeHover(null);
        setTooltip(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    onNodeHover(null);
    setTooltip(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, transform.scale * delta));

    const scaleRatio = newScale / transform.scale;

    onTransformChange({
      scale: newScale,
      x: mouseX - (mouseX - transform.x) * scaleRatio,
      y: mouseY - (mouseY - transform.y) * scaleRatio,
    });
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />

      {tooltip && (
        <div
          className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs shadow-lg pointer-events-none z-10"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
