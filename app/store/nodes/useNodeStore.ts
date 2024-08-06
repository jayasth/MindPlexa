import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { addNode, updateNode, removeNode } from './nodeActions';
import {
  setNodes,
  setInitialState,
  toggleEditMode,
  setSelectedNodes
} from './nodeStateManagement';
import { addChildNode, createChildNodeFromDrag } from './nodeChildOperations';
import { onNodesChange } from './nodeChangeHandling';
import type { Node, XYPosition } from 'reactflow';
import { uploadSVGToBucket } from '@/utils/canvas/nodeSpecificDataService';

export interface NodeState {
  nodes: Node[];
  nodeInternals: Map<string, Node>;
  addNode: (node: Node, canvasId: string) => Promise<void>;
  updateNode: (
    id: string,
    data: Partial<Node>,
    canvasId: string
  ) => Promise<void>;
  removeNode: (id: string, canvasId: string) => Promise<void>;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  setInitialState: (nodes: Node[]) => void;
  toggleEditMode: (nodeId: string) => void;
  setSelectedNodes: (selectedIds: string[]) => void;
  addChildNode: (
    parentNode: Node,
    position: XYPosition,
    type: string,
    canvasId: string
  ) => Promise<void>;
  createChildNodeFromDrag: (
    parentNode: Node,
    position: XYPosition,
    nodeType: string,
    canvasId: string
  ) => Promise<void>;
  onNodesChange: (changes: any, canvasId: string) => Promise<void>;
  updateDrawNodeData: (
    id: string,
    drawingData: string,
    canvasId: string
  ) => Promise<void>;
}

const useNodeStore = create<NodeState>()(
  devtools((set, get) => ({
    nodes: [],
    nodeInternals: new Map(),
    addNode: (node, canvasId) => addNode(set, node, canvasId),
    updateNode: (id, data, canvasId) =>
      updateNode(set, get, id, data, canvasId),
    removeNode: (id, canvasId) => removeNode(set, get, id, canvasId),
    setNodes: (updater) => setNodes(set, updater),
    setInitialState: (nodes) => setInitialState(set, get, nodes),
    toggleEditMode: (nodeId) => toggleEditMode(set, nodeId),
    setSelectedNodes: (selectedIds) => setSelectedNodes(set, selectedIds),
    addChildNode: (parentNode, position, type, canvasId) =>
      addChildNode(set, get, parentNode, position, type, canvasId),
    createChildNodeFromDrag: (parentNode, position, nodeType, canvasId) =>
      createChildNodeFromDrag(
        set,
        get,
        parentNode,
        position,
        nodeType,
        canvasId
      ),
    onNodesChange: (changes, canvasId) =>
      onNodesChange(set, get, changes, canvasId),
    updateDrawNodeData: async (id, drawingData, canvasId) => {
      const svgPath = await uploadSVGToBucket(id, drawingData);
      if (svgPath) {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    drawingFileUrl: svgPath
                  }
                }
              : node
          )
        }));
        await updateNode(
          set,
          get,
          id,
          { data: { drawing_file_url: svgPath } },
          canvasId
        );
      }
    }
  }))
);

export default useNodeStore;
