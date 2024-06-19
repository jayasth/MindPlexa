import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges
} from '@/ui/canvasEditor/utils/canvasUtils';
import {
  createNode,
  updateNode,
  deleteNode,
  createEdge,
  updateEdge,
  deleteEdge,
  fetchCanvas
} from '@/utils/canvas/canvasDatabaseOperations';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { nanoid } from 'nanoid';
import type { Node, Edge, XYPosition } from 'reactflow';
import {
  nodeDimensions,
  getNodeSpecificProperties
} from '@/ui/canvasEditor/utils/nodeProperties';
import {
  NoteNodeData,
  TaskNodeData,
  TableNodeData,
  CalendarNodeData,
  DrawNodeData
} from '@/ui/canvasEditor/utils/nodeDatatypes';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  domNode: HTMLDivElement | null;
  setDomNode: (node: HTMLDivElement | null) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition;
  nodeInternals: Map<string, Node>;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  setInitialState: (canvasId: string) => void;
  addChildNode: (parentNode: Node, position: XYPosition, type: string) => void;
  createChildNodeFromDrag: (
    parentNode: Node,
    position: XYPosition,
    type: string
  ) => void;
  showNodeSelectionMenu: boolean;
  setShowNodeSelectionMenu: (show: boolean) => void;
  menuPosition: XYPosition | null;
  setMenuPosition: (position: XYPosition | null) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  toggleEditMode: (nodeId: string) => void;
  setSelectedNodes: (selectedIds: string[]) => void;
}

const createStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return create(devtools(config));
};

export const useStore = createStore<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  domNode: null,
  setDomNode: (node) => {
    set({ domNode: node });
  },
  screenToFlowPosition: (position) => {
    return position;
  },
  nodeInternals: new Map(),
  showNodeSelectionMenu: false,
  menuPosition: null,
  setNodes: (updater) => {
    console.log('Store: Setting nodes with updater:', updater);
    set((state) => {
      const updatedNodes = updater(state.nodes);
      state.nodeInternals.clear();
      updatedNodes.forEach((node) => {
        state.nodeInternals.set(node.id, node);
        if (node.position) {
          console.log(
            `Store: Node ${node.id} position updated to`,
            node.position
          );
        }
      });
      return { nodes: updatedNodes };
    });
  },
  setEdges: (updater) => {
    console.log('Store: Setting edges with updater:', updater);
    set((state) => ({ edges: updater(state.edges) }));
  },
  addNode: async (node) => {
    console.log('Store: Adding node:', node);
    if (node.type === undefined) {
      console.error('Node type is undefined');
      return;
    }
    const nodeProps = getNodeSpecificProperties(node.type, false);
    const textColor =
      node.data && node.data.backgroundColor
        ? parseInt(node.data.backgroundColor.replace('#', ''), 16) >
          0xffffff / 2
          ? '#575757'
          : '#F4F4F4'
        : '#575757';
    const toolbarColor = textColor === '#575757' ? '#F4F4F4' : '#575757';
    const newNode = {
      ...node,
      ...nodeProps,
      style: {
        backgroundColor: (node.data && node.data.backgroundColor) || '#F4F4F4', // Default or specified background color
        color: textColor // Computed text color
      },
      data: {
        ...node.data,
        backgroundColor: (node.data && node.data.backgroundColor) || '#F4F4F4', // Default or specified background color
        textColor: textColor, // Computed text color
        toolbarColor: toolbarColor // Computed toolbar color
      }
    };

    switch (node.type) {
      case 'note':
        newNode.data = { ...newNode.data, ...(node.data as NoteNodeData) };
        break;
      case 'task':
        newNode.data = { ...newNode.data, ...(node.data as TaskNodeData) };
        break;
      case 'table':
        newNode.data = { ...newNode.data, ...(node.data as TableNodeData) };
        break;
      case 'calendar':
        newNode.data = { ...newNode.data, ...(node.data as CalendarNodeData) };
        break;
      case 'draw':
        newNode.data = { ...newNode.data, ...(node.data as DrawNodeData) };
        break;
      // Add more cases for other node types if needed
      default:
        break;
    }

    console.log('Store: New node with position and dimensions:', newNode);
    if (newNode.type === undefined) {
      console.error('Node type is undefined');
      return;
    }
    const { data: createdNode, error: createNodeError } = await createNode(
      newNode.type as 'note' | 'task' | 'table' | 'calendar' | 'draw',
      newNode.position,
      newNode.data
    );
    if (createNodeError) {
      console.error('Error creating node:', createNodeError);
      return;
    }
    set((state) => ({
      nodes: [...state.nodes, createdNode]
    }));
  },

  updateNode: async (id, data) => {
    set(async (state) => {
      const existingNodeIndex = state.nodes.findIndex((node) => node.id === id);
      if (existingNodeIndex !== -1) {
        const existingNode = state.nodes[existingNodeIndex];
        const updatedNode = {
          ...existingNode,
          ...data,
          position: data.position || existingNode.position,
          data: {
            ...existingNode.data,
            ...data.data,
            backgroundColor:
              data.data?.backgroundColor ||
              existingNode.data?.backgroundColor ||
              '#F4F4F4',
            textColor:
              data.data?.textColor || existingNode.data?.textColor || '#575757',
            tags: data.data?.tags || existingNode.data?.tags || [],
            attachedFiles:
              data.data?.attachedFiles || existingNode.data?.attachedFiles || []
          }
        };
        switch (existingNode.type) {
          case 'note':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as NoteNodeData)
            };
            break;
          case 'task':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as TaskNodeData)
            };
            break;
          case 'table':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as TableNodeData)
            };
            break;
          case 'calendar':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as CalendarNodeData)
            };
            break;
          case 'draw':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as DrawNodeData)
            };
            break;
          // Add more cases for other node types if needed
          default:
            break;
        }

        const { data: updatedNodeData, error: updateNodeError } =
          await updateNode(
            id,
            {
              position: JSON.stringify(updatedNode.position),
              width: updatedNode.width,
              height: updatedNode.height,
              color: updatedNode.data.backgroundColor
            },
            {
              title: updatedNode.data.title,
              background_color: updatedNode.data.backgroundColor,
              text_color: updatedNode.data.textColor,
              tags: updatedNode.data.tags,
              attached_files: updatedNode.data.attachedFiles,
              ...updatedNode.data.specificData
            },
            updatedNode.type
          );
        if (updateNodeError) {
          console.error('Error updating node:', updateNodeError);
          return;
        }
        const updatedNodes = [...state.nodes];
        updatedNodes[existingNodeIndex] = updatedNodeData;
        state.nodeInternals.set(id, updatedNodeData);
        return { nodes: updatedNodes };
      }
      return state;
    });
  },

  addEdge: async (edge) => {
    console.log('Store: Adding edge:', edge);
    const { data: createdEdge, error: createEdgeError } =
      await createEdge(edge);
    if (createEdgeError) {
      console.error('Error creating edge:', createEdgeError);
      return;
    }
    set((state) => ({
      edges: [...state.edges, createdEdge]
    }));
  },

  removeNode: async (id) => {
    console.log('Store: Removing node with id:', id);
    const { success, error: deleteNodeError } = await deleteNode(
      id,
      get().nodes.find((node) => node.id === id)?.type || 'note'
    );
    if (deleteNodeError) {
      console.error('Error deleting node:', deleteNodeError);
      return;
    }
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      )
    }));
  },

  removeEdge: async (id) => {
    console.log('Store: Removing edge with id:', id);
    const { success, error: deleteEdgeError } = await deleteEdge(id);
    if (deleteEdgeError) {
      console.error('Error deleting edge:', deleteEdgeError);
      return;
    }
    set((state) => {
      const updatedEdges = state.edges.filter((edge) => edge.id !== id);
      state.onEdgesChange([
        {
          type: 'remove',
          id: id
        }
      ]);
      return { edges: updatedEdges };
    });
  },

  updateEdge: async (id, data) => {
    console.log('Store: Updating edge with id:', id, 'and data:', data);
    const { data: updatedEdgeData, error: updateEdgeError } = await updateEdge(
      id,
      data
    );
    if (updateEdgeError) {
      console.error('Error updating edge:', updateEdgeError);
      return;
    }
    set((state) => {
      const updatedEdges = state.edges.map((edge) => {
        if (edge.id === id) {
          return updatedEdgeData;
        }
        return edge;
      });
      return { edges: updatedEdges };
    });
  },

  setInitialState: async (canvasId) => {
    console.log('Store: Setting initial state with canvasId:', canvasId);
    const { data: canvasData, error: fetchCanvasError } =
      await fetchCanvas(canvasId);
    if (fetchCanvasError) {
      console.error('Error fetching canvas:', fetchCanvasError);
      return;
    }
    set(() => ({
      nodes: canvasData.nodes,
      edges: canvasData.edges
    }));
  },

  addChildNode: (parentNode, position, type) => {
    console.log(
      'Store: Adding child node to parent node:',
      parentNode,
      'at position:',
      position,
      'with type:',
      type
    );
    set((state) => ({
      nodes: state.nodes.filter((node) => node.type !== 'selectionMenu')
    }));

    const newNode = {
      id: nanoid(),
      type: type,
      data: { label: 'New Node' },
      position,
      style: {
        backgroundColor: '#F4F4F4',
        color: '#575757'
      }
    };

    const newEdge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
      type: 'customEdge'
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, newEdge]
    }));
  },
  createChildNodeFromDrag: (parentNode, position, nodeType) => {
    console.log(
      'Store: Creating child node from drag for parent node:',
      parentNode,
      'at position:',
      position,
      'with type:',
      nodeType
    );
    const {
      domNode,
      screenToFlowPosition,
      nodes,
      addNode,
      setEdges,
      removeNode
    } = get();

    if (!domNode) {
      console.error('Store: DOM node is not available.');
      return;
    }

    const flowPosition = screenToFlowPosition(position);
    const childNodePosition = getChildNodePosition(
      flowPosition,
      parentNode,
      domNode,
      screenToFlowPosition
    );
    if (!childNodePosition) {
      console.error('Store: Failed to calculate child node position.');
      return;
    }

    const newNode = {
      id: `selectionMenu-${nanoid()}`,
      type: 'selectionMenu',
      position: childNodePosition,
      data: {
        onSelect: (selectedNodeType, selectedPosition) => {
          createNode(selectedNodeType, selectedPosition, (newNode) => {
            addNode(newNode);
            setEdges((edges) => [
              ...edges,
              {
                id: `e-${nanoid()}`,
                source: parentNode.id,
                target: newNode.id,
                type: 'customEdge'
              }
            ]);
          });
          removeNode(newNode.id);
        },
        onClose: () => removeNode(newNode.id),
        parentNode: parentNode,
        isTemporary: true
      },
      width: nodeDimensions['selectionMenu'].width,
      height: nodeDimensions['selectionMenu'].height
    };

    addNode(newNode);
    setEdges((edges) => [
      ...edges,
      {
        id: `e-${nanoid()}`,
        source: parentNode.id,
        target: newNode.id,
        type: 'customEdge'
      }
    ]);
  },
  setShowNodeSelectionMenu: (show) => {
    console.log('Store: Setting show node selection menu to:', show);
    set(() => ({ showNodeSelectionMenu: show }));
  },
  setMenuPosition: (position) => {
    console.log('Setting menu position to:', position);
    set(() => ({ menuPosition: position }));
  },
  onNodesChange: (changes) => {
    console.log('Store: Applying node changes:', changes);
    set((state) => {
      const updatedNodes = applyNodeChanges(changes, state.nodes);
      return { nodes: updatedNodes };
    });
  },
  onEdgesChange: (changes) => {
    console.log('Applying edge changes:', changes);
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges)
    }));
  },
  toggleEditMode: (nodeId: string) => {
    console.log(`Store: Toggling edit mode for node ${nodeId}`);
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          console.log(`Store: Before toggling, isEditing is ${node.isEditing}`);
          return { ...node, isEditing: !node.isEditing };
        }
        return node;
      })
    }));
  },
  setSelectedNodes: (selectedIds) => {
    console.log('Store: Setting selected nodes:', selectedIds);
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: selectedIds.includes(node.id)
      }))
    }));
  }
}));
