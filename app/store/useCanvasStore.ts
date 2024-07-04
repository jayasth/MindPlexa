import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { v4 as uuidv4 } from 'uuid';
import type { Node, Edge, XYPosition } from 'reactflow';
import {
  nodeDimensions,
  getNodeSpecificProperties
} from '@/ui/canvasEditor/utils/nodeProperties';
import { Tables, TablesInsert, Database } from '@/types_db';
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
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
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
  loadCanvas: (canvasId: string) => Promise<void>;
  isLoading: boolean;
  lastLoadTime: number;
  saveCanvasTimeout?: NodeJS.Timeout;
}

const createStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return create(devtools(config));
};

export const useStore = createStore<CanvasState>((set, get) => ({
  canvasID: uuidv4(),
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
  isLoading: false,
  lastLoadTime: 0,
  setNodes: (updater) => {
    console.log('Store: Setting nodes with updater:', updater);
    set((state) => {
      const updatedNodes =
        typeof updater === 'function' ? updater(state.nodes) : updater;
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
    set((state) => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater
    }));
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

  updateNode: async (id, data) => {
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
            textColor: data.data?.textColor || existingNode.data.textColor
          }
        };

        // Prepare updates for the nodes table
        const nodeUpdates: Partial<
          Database['public']['Tables']['nodes']['Update']
        > = {
          position: JSON.stringify(updatedNode.position),
          background_color: updatedNode.data.backgroundColor,
          text_color: updatedNode.data.textColor,
          title: updatedNode.data.title,
          is_editing: updatedNode.data.isEditing,
          z_index: updatedNode.data.zIndex,
          edit_width: updatedNode.data.editWidth,
          edit_height: updatedNode.data.editHeight,
          mobile_edit_width: updatedNode.data.mobileEditWidth,
          mobile_edit_height: updatedNode.data.mobileEditHeight
        };

        // Prepare updates for the specific node type table
        let specificUpdates: any = {};
        switch (existingNode.type) {
          case 'note':
            specificUpdates = {
              content: updatedNode.data.content
            };
            break;
          case 'task':
            specificUpdates = {
              tasks: JSON.stringify(updatedNode.data.tasks)
            };
            break;
          case 'table':
            specificUpdates = {
              columns: JSON.stringify(updatedNode.data.columns),
              rows: JSON.stringify(updatedNode.data.rows)
            };
            break;
          case 'calendar':
            specificUpdates = {
              events: JSON.stringify(updatedNode.data.events),
              view: updatedNode.data.view
            };
            break;
          case 'draw':
            specificUpdates = {
              drawing_data: updatedNode.data.drawingData
            };
            break;
          default:
            break;
        }

        // Update the node in the database
        updateNodeInDB(id, nodeUpdates, specificUpdates, existingNode.type)
          .then(() => {
            console.log('Node updated successfully in the database');
          })
          .catch((error) => {
            console.error('Error updating node in the database:', error);
          });

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
      edges: [...state.edges, { ...edge, id: uuidv4() }]
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
      nodes: state.nodes.filter((node) => node.type !== 'selection_menu')
    }));

    const newNode = {
      id: uuidv4(),
      type: type,
      data: { label: 'New Node' },
      position,
      style: {
        backgroundColor: '#F4F4F4',
        color: '#575757'
      }
    };

    const newEdge = {
      id: uuidv4(),
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
      id: `selection_menu-${uuidv4()}`,
      type: 'selection_menu',
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
                  id: `e-${uuidv4()}`,
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
      width: nodeDimensions['selection_menu'].width,
      height: nodeDimensions['selection_menu'].height
    };

    addNode(newNode);
    setEdges((edges) => [
      ...edges,
      {
        id: `e-${uuidv4()}`,
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
  onNodesChange: (changes: any) => {
    set((state) => {
      if (
        state.isLoading ||
        (state.nodes.length === 0 && state.edges.length === 0)
      ) {
        console.log(
          'Store: Skipping onNodesChange due to loading or empty canvas'
        );
        return state;
      }

      changes.forEach((change) => {
        console.log(
          `Store: Node ${change.id} change of type '${change.type}' detected:`,
          change
        );
      });

      const updatedNodes = state.nodes
        .map((node) => {
          const change = changes.find((c) => c.id === node.id);
          if (change) {
            console.log(
              'Store: Full node data before change:',
              JSON.stringify(node, null, 2)
            );
            let updatedNode = { ...node };
            switch (change.type) {
              case 'position':
                // Ignore position changes during initial state loading
                if (state.isLoading) {
                  return node;
                }
                if (
                  change.position &&
                  (change.position.x !== node.position.x ||
                    change.position.y !== node.position.y)
                ) {
                  // Immediately update the database
                  updateNodeInDB(
                    node.id,
                    { position: JSON.stringify(change.position) },
                    {},
                    node.type
                  );
                  updatedNode = { ...node, position: change.position };
                }
                break;
              case 'dimensions':
                // Ignore dimension changes during initial state loading
                if (state.isLoading) {
                  return node;
                }
                if (node.is_editing && change.dimensions) {
                  const {
                    edit_width,
                    edit_height,
                    mobile_edit_width,
                    mobile_edit_height
                  } = node.data;
                  const { width, height } = change.dimensions;
                  const threshold = 1; // 1 pixel threshold
                  if (
                    Math.abs(width - edit_width) > threshold ||
                    Math.abs(height - edit_height) > threshold ||
                    Math.abs(width - mobile_edit_width) > threshold ||
                    Math.abs(height - mobile_edit_height) > threshold
                  ) {
                    // Immediately update the database
                    updateNodeInDB(
                      node.id,
                      {
                        edit_width: change.dimensions.width,
                        edit_height: change.dimensions.height,
                        mobile_edit_width: change.dimensions.width,
                        mobile_edit_height: change.dimensions.height
                      },
                      {},
                      node.type
                    );
                    updatedNode = {
                      ...node,
                      data: {
                        ...node.data,
                        edit_width: width,
                        edit_height: height,
                        mobile_edit_width: width,
                        mobile_edit_height: height
                      }
                    };
                  }
                }
                break;
              case 'select':
                updatedNode = { ...node, selected: change.selected };
                break;
              case 'remove':
                return null;
              default:
                updatedNode = { ...node, ...change };
            }
            console.log(
              'Store: Full node data after change:',
              JSON.stringify(updatedNode, null, 2)
            );
            return updatedNode;
          }
          return node;
        })
        .filter(Boolean);
      const removedNodeIds = changes
        .filter((c) => c.type === 'remove')
        .map((c) => c.id);

      removedNodeIds.forEach((id) => {
        state.nodeInternals.delete(id);
      });

      const updatedEdges = state.edges.filter(
        (edge) =>
          !removedNodeIds.includes(edge.source) &&
          !removedNodeIds.includes(edge.target)
      );

      // Only save if there are actual changes
      const hasChanges =
        JSON.stringify(updatedNodes) !== JSON.stringify(state.nodes);
      if (hasChanges) {
        state.saveCanvas();
      }

      return {
        nodes: updatedNodes,
        edges: updatedEdges,
        nodeInternals: state.nodeInternals
      };
    });
  },
  onEdgesChange: (changes) => {
    console.log('Store: onEdgesChange :', changes);
    set((state) => {
      const updatedEdges = state.edges.map((edge) => {
        const change = changes.find((change) => change.id === edge.id);
        if (change) {
          return { ...edge, ...change };
        }
        return edge;
      });
      return { edges: updatedEdges };
    });
  },
  toggleEditMode: async (nodeId: string) => {
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

    // Check if there are any changes to save
    const hasChanges =
      nodes.some((node) => node.data?.isModified) ||
      edges.some((edge) => edge.data?.isModified);
    if (!hasChanges) {
      console.log('Store: No changes detected, skipping save');
      return;
    }

    const canvasData = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: JSON.stringify(node.position),
        title: node.data?.title || '',
        background_color: node.data?.backgroundColor || '#F4F4F4',
        text_color: node.data?.textColor || '#575757',
        view_width: node.width || 80,
        view_height: node.height || 150,
        edit_width: node.data?.edit_width || null,
        edit_height: node.data?.edit_height || null,
        mobile_edit_width: node.data?.mobile_edit_width || null,
        mobile_edit_height: node.data?.mobile_edit_height || null,
        is_editing: node.is_editing || false,
        is_temporary: node.data?.is_temporary || false,
        parent_node_id: node.data?.parent_node_id || null,
        z_index: node.z_index || 0
      })),
      node_specific_data: nodes
        .map((node) => {
          switch (node.type) {
            case 'note':
              return {
                node_id: node.id,
                content: node.data?.noteData?.content || ''
              };
            case 'task':
              return {
                node_id: node.id,
                tasks: JSON.stringify(node.data?.taskData?.tasks || [])
              };
            case 'table':
              return {
                node_id: node.id,
                columns: JSON.stringify(node.data?.tableData?.columns || []),
                rows: JSON.stringify(node.data?.tableData?.rows || [])
              };
            case 'calendar':
              return {
                node_id: node.id,
                events: JSON.stringify(node.data?.calendarData?.events || []),
                view: node.data?.calendarData?.view || 'month'
              };
            case 'draw':
              return {
                node_id: node.id,
                drawing_data: node.data?.drawData?.drawing_data || ''
              };
            default:
              return null;
          }
        })
        .filter(Boolean),
      node_canvas_link: nodes.map((node) => ({
        node_id: node.id,
        canvas_id: canvasID
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source_node_id: edge.source,
        target_node_id: edge.target,
        canvas_id: canvasID
      }))
    };

    console.log('Store: saveCanvas full canvasData:', canvasData);

    const result = await saveCanvasState(
      canvasID,
      canvasData.nodes,
      canvasData.edges
    );
    if (result.error) {
      console.error('Store: Error saving canvas data:', result.error);
      return;
    }

    console.log('Store: Canvas data saved successfully');
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

      console.log('Store: Fetched data:', data);
      console.log('Store: Fetched nodeData:', nodeData);

      if (data && data.node_canvas_link && data.node_canvas_link.length > 0) {
        console.log('Store: Loading existing canvas data');
        const nodes = data.node_canvas_link
          .map((link) => {
            const node = link.nodes;
            if (!node) return null;

            const specificNodeData = nodeData?.[node.type]?.find(
              (specificNode) => specificNode.node_id === node.id
            );

            let position;
            try {
              position =
                typeof node.position === 'string'
                  ? JSON.parse(node.position)
                  : node.position;
            } catch (error) {
              console.error('Error parsing position JSON:', error);
              position = { x: 200, y: 200 };
            }

            return {
              id: node.id,
              type: node.type,
              position,
              data: {
                ...node,
                ...specificNodeData,
                backgroundColor: node.background_color,
                textColor: node.text_color
              },
              width: node.view_width,
              height: node.view_height,
              isEditing: node.is_editing
            };
          })
          .filter(
            (node): node is Node => node !== null && node.type !== undefined
          );

        const edges = data.edges
          ? data.edges.map((edge) => ({
              id: edge.id,
              source: edge.source_node_id || '',
              target: edge.target_node_id || '',
              type: 'customEdge'
            }))
          : [];
        set({ nodes, edges, isLoading: false });
      } else {
        console.log('Store: Initializing new blank canvas');
        set({ nodes: [], edges: [], isLoading: false });
      }
    } catch (error) {
      console.error('Store: Error loading canvas:', error);
      set({ isLoading: false });
    }
  }
}));

export type { CanvasState };
