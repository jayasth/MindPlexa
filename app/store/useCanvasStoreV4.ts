import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { nanoid } from 'nanoid';
import type { Node, Edge, XYPosition } from 'reactflow';
import {
  nodeDimensions,
  getNodeSpecificProperties
} from '@/ui/canvasEditor/utils/nodeProperties';
import { Database, TablesInsert, Tables } from '@/types_db';
import {
  fetchCanvas,
  saveCanvasState
} from '@/utils/canvas/canvasDatabaseOperations';
import {
  updateNode as updateNodeInDB,
  deleteNode as deleteNodeInDB,
  createEdge as createEdgeInDB,
  updateEdge as updateEdgeInDB,
  deleteEdge as deleteEdgeInDB
} from '@/utils/canvas/nodeEdgeDatabaseOperations';

interface CanvasState {
  canvasID: string;
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
  setInitialState: (nodes: Node[], edges: Edge[]) => void;
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
  setCanvasId: (id: string) => void;
  saveCanvas: () => void;
}

const createStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return create(devtools(config));
};

export const useStore = createStore<CanvasState>((set, get) => ({
  canvasID: nanoid(),
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
  addNode: (node) => {
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
        newNode.data = {
          ...newNode.data,
          ...(node.data as TablesInsert<'note_nodes'>)
        };
        break;
      case 'task':
        newNode.data = {
          ...newNode.data,
          ...(node.data as TablesInsert<'task_nodes'>)
        };
        break;
      case 'table':
        newNode.data = {
          ...newNode.data,
          ...(node.data as TablesInsert<'table_nodes'>)
        };
        break;
      case 'calendar':
        newNode.data = {
          ...newNode.data,
          ...(node.data as TablesInsert<'calendar_nodes'>)
        };
        break;
      case 'draw':
        newNode.data = {
          ...newNode.data,
          ...(node.data as TablesInsert<'draw_nodes'>)
        };
        break;
      // Add more cases for other node types if needed
      default:
        break;
    }

    console.log('Store: New node with position and dimensions:', newNode);
    set((state) => {
      const canvasSize = {
        width: state.domNode?.clientWidth || 1000,
        height: state.domNode?.clientHeight || 800
      };
      newNode.position = findOptimalPosition(state.nodes, canvasSize);
      state.nodeInternals.set(newNode.id, newNode);
      return { nodes: [...state.nodes, newNode] };
    });
  },

  updateNode: (id, data) => {
    set((state) => {
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
              data.data?.backgroundColor || existingNode.data.backgroundColor,
            textColor: data.data?.textColor || existingNode.data.textColor,
            tags: data.data?.tags || existingNode.data.tags || [],
            attachedFiles:
              data.data?.attachedFiles || existingNode.data.attachedFiles || []
          }
        };
        switch (existingNode.type) {
          case 'note':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as Tables<'note_nodes'>)
            };
            break;
          case 'task':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as Tables<'task_nodes'>)
            };
            break;
          case 'table':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as Tables<'table_nodes'>)
            };
            break;
          case 'calendar':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as Tables<'calendar_nodes'>)
            };
            break;
          case 'draw':
            updatedNode.data = {
              ...updatedNode.data,
              ...(data.data as Tables<'draw_nodes'>)
            };
            break;
          // Add more cases for other node types if needed
          default:
            break;
        }

        const updatedNodes = [...state.nodes];
        updatedNodes[existingNodeIndex] = updatedNode;
        state.nodeInternals.set(id, updatedNode);
        return { nodes: updatedNodes };
      }
      return state;
    });
  },

  addEdge: (edge) => {
    console.log('Store: Adding edge:', edge);
    set((state) => ({
      edges: [...state.edges, { ...edge, id: nanoid() }]
    }));
  },
  removeNode: (id) => {
    console.log('Store: Removing node with id:', id);
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      )
    }));
  },
  removeEdge: (id) => {
    console.log('Store: Removing edge with id:', id);
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
  updateEdge: (id, data) => {
    console.log('Store: Updating edge with id:', id, 'and data:', data);
    set((state) => {
      const updatedEdges = state.edges.map((edge) => {
        if (edge.id === id) {
          return { ...edge, ...data };
        }
        return edge;
      });
      return { edges: updatedEdges };
    });
  },
  setInitialState: (nodes, edges) => {
    console.log(
      'Store: Setting initial state with nodes:',
      nodes,
      'and edges:',
      edges
    );
    set(() => ({
      nodes,
      edges
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
          createNode(
            selectedNodeType,
            selectedPosition,
            nodes,
            (newNode) => {
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
            { width: 0, height: 0 },
            false,
            false,
            parentNode.id
          );
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
    console.log('Store: Received node changes:', changes);
    // TODO: Implement node changes when applyNodeChanges is available
  },
  onEdgesChange: (changes) => {
    console.log('Store: Received edge changes:', changes);
    // TODO: Implement edge changes when applyEdgeChanges is available
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
  },
  setCanvasId: (id) => {
    console.log('Store: Setting canvas ID to:', id);
    set(() => ({ canvasID: id }));
  },
  saveCanvas: async () => {
    const { nodes, edges, canvasID, isLoading, lastLoadTime } = get();

    if (
      isLoading ||
      Date.now() - lastLoadTime < 2000 ||
      (nodes.length === 0 && edges.length === 0)
    ) {
      console.log(
        'Store: Skipping save due to recent load, ongoing loading, or empty canvas'
      );
      return;
    }

    // Simplified version for testing
    console.log('Store: Simulating canvas save (no actual data saved)');

    // Wait for a short time to simulate an asynchronous operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log('Store: Canvas data "saved" successfully');
  },
  // Function to load canvas data
  loadCanvas: async (canvasId: string) => {
    set({ isLoading: true });
    console.log(`Store: Starting to load canvas with ID: ${canvasId}`);
    try {
      const { data, nodeData, error } = await fetchCanvas(canvasId);

      if (error) {
        console.error('Store: Error fetching canvas data:', error);
        set({ isLoading: false });
        return;
      }

      if (data && data.node_canvas_link && data.node_canvas_link.length > 0) {
        console.log('Store: Loading existing canvas data');
        const nodes = data.node_canvas_link
          ? data.node_canvas_link
              .map((link) => {
                const commonNode = link.common_node_properties;
                if (!commonNode) return null;

                const specificNodeData = nodeData?.[commonNode.type]?.find(
                  (node) => node.common_node_id === commonNode.id
                );

                console.log('Store: loadCanvas fetched :', {
                  id: commonNode.id,
                  type: commonNode.type,
                  position: commonNode.position,
                  viewWidth: commonNode.view_width,
                  viewHeight: commonNode.view_height,
                  editWidth: commonNode.edit_width,
                  editHeight: commonNode.edit_height,
                  backgroundColor: commonNode.background_color,
                  textColor: commonNode.text_color,
                  title: commonNode.title,
                  tags: commonNode.tags,
                  attachedFiles: commonNode.attached_files,
                  isEditing: commonNode.is_editing,
                  isTemporary: commonNode.is_temporary,
                  parentNodeId: commonNode.parent_node_id,
                  zIndex: commonNode.z_index,
                  createdAt: commonNode.created_at,
                  updatedAt: commonNode.updated_at,
                  connectable: commonNode.connectable,
                  draggable: commonNode.draggable,
                  specificNodeData
                });

                let position;
                try {
                  position = JSON.parse(commonNode.position); // Always parse as JSON string
                } catch (error) {
                  console.error('Error parsing position JSON:', error);
                  position = { x: 200, y: 200 }; // Default position if parsing fails
                }

                // Ensure position is defined and has x and y properties
                if (
                  !position ||
                  typeof position.x !== 'number' ||
                  typeof position.y !== 'number'
                ) {
                  position = { x: 200, y: 200 }; // Default position if invalid
                }

                return {
                  id: commonNode.id,
                  type: commonNode.type,
                  position,
                  data: {
                    ...commonNode,
                    ...specificNodeData,
                    backgroundColor: commonNode.background_color || '#F4F4F4',
                    textColor: commonNode.text_color || '#575757',
                    tags: commonNode.tags || [],
                    attachedFiles: commonNode.attached_files || []
                  },
                  width: commonNode.view_width || 80,
                  height: commonNode.view_height || 150,
                  isEditing: false // Set isEditing to false by default
                };
              })
              .filter(
                (node): node is Node => node !== null && node.type !== undefined
              )
          : [];
        const edges = data.edges
          ? data.edges.map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: edge.type
            }))
          : [];

        set({
          nodes,
          edges,
          canvasID: canvasId,
          isLoading: false,
          lastLoadTime: Date.now()
        });
        console.log('Store: Canvas data loaded successfully');
      } else {
        console.log(
          'Store: No existing canvas data found, initializing empty canvas'
        );
        set({
          nodes: [],
          edges: [],
          canvasID: canvasId,
          isLoading: false,
          lastLoadTime: Date.now()
        });
      }
    } catch (error) {
      console.error('Store: Error loading canvas:', error);
      set({ isLoading: false });
    }
  }
}));

export type { CanvasState };
