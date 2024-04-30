import { Node, XYPosition } from 'reactflow';
import type { Json, Tables } from '@/types_db';
import type {
  NoteNode,
  TaskNode,
  CustomNode,
  CodeNode,
  DrawNode
} from '@/ui/canvasEditor/nodeTypes';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';

type BaseNode = Tables<'base_nodes'>;

interface JsonPosition {
  x: number;
  y: number;
  [key: string]: Json | number | undefined;
}

const setPosition = (x: number, y: number): JsonPosition => {
  return { x, y };
};

export const createNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
  position: { x: number; y: number },
  callback: (newNode: Node<any>) => void
) => {
  const positionAsXYPosition = setPosition(position.x, position.y);

  const defaultProperties = {
    draggable: true,
    connectable: true,
    width: 200,
    height: 300,
    title: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`
  };

  const baseProperties: Partial<BaseNode> & {
    id: string;
    position: XYPosition;
  } = {
    id: `${nodeType}-${Date.now()}`,
    type: nodeType,
    position: positionAsXYPosition,
    ...defaultProperties
  };

  const specificNode = {
    ...baseProperties,
    ...getNodeSpecificProperties(nodeType)
  };

  const newNode: Node<any> = {
    ...specificNode,
    data: specificNode,
    id: baseProperties.id,
    position: positionAsXYPosition
  };

  console.log('Adding new node:', newNode);
  callback(newNode);
};
