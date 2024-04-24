import NodeRenderer from '@/ui/nodes/NodeRenderer';

// Mapping all node types to the NodeRenderer component
export const nodeTypes = {
  note: NodeRenderer,
  task: NodeRenderer,
  custom: NodeRenderer,
  code: NodeRenderer,
  draw: NodeRenderer
};
