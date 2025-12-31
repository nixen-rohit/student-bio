export interface MindmapNode {
  id: string;
  title: string;
  summary: string;
  description: string;
  parent_id: string | null;
  level: number;
  color: string;
  size: 'small' | 'medium' | 'large';
  order_index: number;
  is_collapsed: boolean;
  created_at: string;
  updated_at: string;
  x?: number;
  y?: number;
  children?: MindmapNode[];
}

export interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasNode extends MindmapNode {
  radius: number;
  visible: boolean;
}
