import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  updateNode as updateNodeInDB,
  deleteNode as deleteNodeInDB,
  createNode as createNodeInDB
} from '@/utils/canvas/nodeEdgeDatabaseOperations';
import {
  getNodeSpecificProperties,
  nodeDimensions
} from '@/ui/canvasEditor/utils/nodeProperties';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import type { Node, XYPosition } from 'reactflow';
import type { Database, Tables, TablesInsert } from '@/types_db';

interface NodeState {
  nodes: Node[];
  nodeInternals: Map<string, Node>;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  removeNode: (id: string) => void;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  setInitialState: (nodes: Node[]) => void;
  toggleEditMode: (nodeId: string) => void;
  setSelectedNodes: (selectedIds: string[]) => void;
  addChildNode: (parentNode: Node, position: XYPosition, type: string) => void;
  createChildNodeFromDrag: (
    parentNode: Node,
    position: XYPosition,
    nodeType: string
  ) => void;
  onNodesChange: (changes: any) => void;
}

const useNodeStore = create<NodeState>()(
  devtools((set, get) => ({
    nodes: [],
    nodeInternals: new Map(),
    addNode: (node) => {
      const nodeProps = getNodeSpecificProperties(node.type || '', false);
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
        id: uuidv4(),
        style: {
          backgroundColor:
            (node.data && node.data.backgroundColor) || '#F4F4F4',
          color: textColor
        },
        data: {
          ...node.data,
          backgroundColor:
            (node.data && node.data.backgroundColor) || '#F4F4F4',
          textColor: textColor,
          toolbarColor: toolbarColor
        }
      };

      set((state) => {
        const canvasSize = {
          width: 1000, // Default width, adjust as needed
          height: 800 // Default height, adjust as needed
        };
        newNode.position = findOptimalPosition(state.nodes, canvasSize);
        state.nodeInternals.set(newNode.id, newNode);
        return { nodes: [...state.nodes, newNode] };
      });

      if (newNode.type) {
        createNodeInDB(
          newNode.id,
          newNode.type as
            | 'note'
            | 'task'
            | 'table'
            | 'calendar'
            | 'draw'
            | 'selection_menu',
          newNode.position,
          newNode.data
        );
      } else {
        console.error('Node type is undefined. Node creation failed.');
      }
    },
    updateNode: (id, data) => {
      set((state) => {
        const existingNodeIndex = state.nodes.findIndex(
          (node) => node.id === id
        );
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

          let specificUpdates: any = {};
          switch (existingNode.type) {
            case 'note':
              specificUpdates = { content: updatedNode.data.content };
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
              specificUpdates = { drawing_data: updatedNode.data.drawingData };
              break;
          }

          updateNodeInDB(
            id,
            nodeUpdates,
            specificUpdates,
            existingNode.type as 'note' | 'task' | 'table' | 'calendar' | 'draw'
          );

          state.nodeInternals.set(id, updatedNode);
          return {
            nodes: [
              ...state.nodes.slice(0, existingNodeIndex),
              updatedNode,
              ...state.nodes.slice(existingNodeIndex + 1)
            ]
          };
        }
        return state;
      });
    },
    removeNode: (id) => {
      set((state) => {
        const nodeToRemove = state.nodes.find((node) => node.id === id);
        if (nodeToRemove) {
          deleteNodeInDB(
            id,
            nodeToRemove.type as 'note' | 'task' | 'table' | 'calendar' | 'draw'
          );
          state.nodeInternals.delete(id);
          return { nodes: state.nodes.filter((node) => node.id !== id) };
        }
        return state;
      });
    },
    setNodes: (updater) => {
      set((state) => {
        const updatedNodes =
          typeof updater === 'function' ? updater(state.nodes) : updater;
        state.nodeInternals.clear();
        updatedNodes.forEach((node) => state.nodeInternals.set(node.id, node));
        return { nodes: updatedNodes };
      });
    },
    setInitialState: (nodes) => {
      set({ nodes });
    },
    toggleEditMode: (nodeId) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              isEditing: !node.data?.isEditing
            }
          };
          state.nodeInternals.set(nodeId, updatedNode);
          return {
            nodes: state.nodes.map((n) => (n.id === nodeId ? updatedNode : n))
          };
        }
        return state;
      });
    },
    setSelectedNodes: (selectedIds) => {
      set((state) => {
        const updatedNodes = state.nodes.map((node) => ({
          ...node,
          selected: selectedIds.includes(node.id)
        }));
        return { nodes: updatedNodes };
      });
    },
    addChildNode: (parentNode, position, type) => {
      const { addNode, setNodes } = get();
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
      addNode(newNode);
      setNodes((nodes) => [
        ...nodes.filter((node) => node.type !== 'selection_menu')
      ]);
    },
    createChildNodeFromDrag: (parentNode, position, nodeType) => {
      const { addNode, setNodes, removeNode } = get();
      const childNodePosition = getChildNodePosition(
        position,
        parentNode,
        { clientWidth: 1000, clientHeight: 800 },
        (pos) => pos
      );
      if (!childNodePosition) {
        console.error('Failed to calculate child node position.');
        return;
      }
      const newNode = {
        id: `selection_menu-${uuidv4()}`,
        type: 'selection_menu',
        position: childNodePosition,
        data: {
          onSelect: (selectedNodeType, selectedPosition) => {
            const createdNode = {
              id: uuidv4(),
              type: selectedNodeType,
              position: selectedPosition,
              data: { label: 'New Node' }
            };
            addNode(createdNode);
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
    },
    onNodesChange: (changes) => {
      set((state) => {
        const updatedNodes = state.nodes
          .map((node) => {
            const change = changes.find((c) => c.id === node.id);
            if (change) {
              let updatedNode = { ...node };
              switch (change.type) {
                case 'position':
                  if (
                    change.position &&
                    (change.position.x !== node.position.x ||
                      change.position.y !== node.position.y)
                  ) {
                    updateNodeInDB(
                      node.id,
                      { position: JSON.stringify(change.position) },
                      {},
                      node.type as
                        | 'note'
                        | 'task'
                        | 'table'
                        | 'calendar'
                        | 'draw'
                    );
                    updatedNode = { ...node, position: change.position };
                  }
                  break;
                case 'dimensions':
                  if (node.data.isEditing && change.dimensions) {
                    const { width, height } = change.dimensions;
                    updateNodeInDB(
                      node.id,
                      {
                        edit_width: width,
                        edit_height: height,
                        mobile_edit_width: width,
                        mobile_edit_height: height
                      },
                      {},
                      node.type as
                        | 'note'
                        | 'task'
                        | 'table'
                        | 'calendar'
                        | 'draw'
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
                  break;
                case 'select':
                  updatedNode = { ...node, selected: change.selected };
                  break;
                case 'remove':
                  return null;
                default:
                  updatedNode = { ...node, ...change };
              }
              state.nodeInternals.set(updatedNode.id, updatedNode);
              return updatedNode;
            }
            return node;
          })
          .filter(Boolean) as Node[];

        return { nodes: updatedNodes };
      });
    }
  }))
);

export default useNodeStore;
