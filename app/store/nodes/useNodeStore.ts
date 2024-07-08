import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  updateNode as updateNodeInDB,
  deleteNode as deleteNodeInDB
} from '@/utils/canvas/nodeEdgeDatabaseOperations';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import type { Node, XYPosition } from 'reactflow';
import type { Database } from '@/types_db';

interface NodeState {
  nodes: Node[];
  nodeInternals: Map<string, Node>;
  addNode: (node: Node, canvasId: string) => void;
  updateNode: (id: string, data: Partial<Node>, canvasId: string) => void;
  removeNode: (id: string, canvasId: string) => void;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  setInitialState: (nodes: Node[]) => void;
  toggleEditMode: (nodeId: string) => void;
  setSelectedNodes: (selectedIds: string[]) => void;
  addChildNode: (
    parentNode: Node,
    position: XYPosition,
    type: string,
    canvasId: string
  ) => void;
  createChildNodeFromDrag: (
    parentNode: Node,
    position: XYPosition,
    nodeType: string,
    canvasId: string
  ) => void;
  onNodesChange: (changes: any, canvasId: string) => void;
}

const useNodeStore = create<NodeState>()(
  devtools((set, get) => ({
    nodes: [],
    nodeInternals: new Map(),
    addNode: async (node, canvasId) => {
      set((state) => ({
        nodes: [...state.nodes, node],
        nodeInternals: new Map(state.nodeInternals).set(node.id, node)
      }));
      console.log('useNodeStore: Node added', node);
    },
    updateNode: async (id, data, canvasId) => {
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
              specificUpdates = { content: updatedNode.data.content || '' };
              break;
            case 'task':
              specificUpdates = {
                tasks: JSON.stringify(updatedNode.data.tasks || [])
              };
              break;
            case 'table':
              specificUpdates = {
                columns: JSON.stringify(updatedNode.data.columns || []),
                rows: JSON.stringify(updatedNode.data.rows || [])
              };
              break;
            case 'calendar':
              specificUpdates = {
                events: JSON.stringify(updatedNode.data.events || []),
                view: updatedNode.data.view || 'month'
              };
              break;
            case 'draw':
              specificUpdates = {
                drawing_data: updatedNode.data.drawingData || ''
              };
              break;
          }

          if (existingNode.type !== 'selection_menu') {
            updateNodeInDB(
              id,
              nodeUpdates,
              specificUpdates,
              existingNode.type as
                | 'note'
                | 'task'
                | 'table'
                | 'calendar'
                | 'draw'
            );
          }

          state.nodeInternals.set(id, updatedNode);
          console.log('useNodeStore: Node updated', updatedNode);
          return {
            nodes: [
              ...state.nodes.slice(0, existingNodeIndex),
              updatedNode,
              ...state.nodes.slice(existingNodeIndex + 1)
            ],
            nodeInternals: new Map(state.nodeInternals).set(id, updatedNode)
          };
        }
        return state;
      });
    },
    removeNode: async (id, canvasId) => {
      set((state) => {
        const nodeToRemove = state.nodes.find((node) => node.id === id);
        if (nodeToRemove) {
          if (nodeToRemove.type !== 'selection_menu') {
            deleteNodeInDB(
              id,
              nodeToRemove.type as
                | 'note'
                | 'task'
                | 'table'
                | 'calendar'
                | 'draw'
            );
          }
          state.nodeInternals.delete(id);
          console.log('useNodeStore: Node removed', nodeToRemove);
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
        console.log('useNodeStore: Nodes set', updatedNodes);
        return { nodes: updatedNodes };
      });
    },
    setInitialState: (nodes) => {
      if (get().nodes.length > 0) return;
      console.log('useNodeStore: Setting initial state', nodes);
      set({
        nodes,
        nodeInternals: new Map(nodes.map((node) => [node.id, node]))
      });
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
          console.log('useNodeStore: Edit mode toggled', updatedNode);
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
        updatedNodes.forEach((node) => state.nodeInternals.set(node.id, node));
        console.log('useNodeStore: Nodes selected', updatedNodes);
        return { nodes: updatedNodes };
      });
    },
    addChildNode: async (parentNode, position, type, canvasId) => {
      const { addNode, setNodes } = get();
      const newNode = {
        id: uuidv4(),
        type: type,
        data: { label: 'New Node', parentId: parentNode.id },
        position,
        style: {
          backgroundColor: '#F4F4F4',
          color: '#575757'
        }
      };
      await addNode(newNode, canvasId);
      setNodes((nodes) => [
        ...nodes.filter((node) => node.type !== 'selection_menu')
      ]);
      console.log('useNodeStore: Child node added', newNode);
    },
    createChildNodeFromDrag: async (
      parentNode,
      position,
      nodeType,
      canvasId
    ) => {
      const { addNode, setNodes, removeNode } = get();
      const dummyElement = document.createElement('div');
      dummyElement.style.width = '1000px';
      dummyElement.style.height = '800px';
      const childNodePosition = getChildNodePosition(
        { clientX: position.x, clientY: position.y } as MouseEvent,
        parentNode,
        dummyElement,
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
          onSelect: async (
            selectedNodeType: string,
            selectedPosition: XYPosition
          ) => {
            const createdNode = {
              id: uuidv4(),
              type: selectedNodeType,
              position: selectedPosition,
              data: { label: 'New Node', parentId: parentNode.id }
            };
            await addNode(createdNode, canvasId);
            await removeNode(newNode.id, canvasId);
            setNodes((nodes) => nodes.filter((node) => node.id !== newNode.id));
            console.log(
              'useNodeStore: Child node created from drag',
              createdNode
            );
          },
          onClose: () => {
            removeNode(newNode.id, canvasId);
            setNodes((nodes) => nodes.filter((node) => node.id !== newNode.id));
            console.log('useNodeStore: Selection menu closed', newNode);
          },
          parentNode: parentNode,
          isTemporary: true
        },
        width: nodeDimensions['selection_menu'].width,
        height: nodeDimensions['selection_menu'].height
      };
      await addNode(newNode, canvasId);
      setNodes((nodes) => [
        ...nodes.filter((node) => node.type !== 'selection_menu'),
        newNode // Include the newly created selection_menu node
      ]);
      console.log('useNodeStore: Selection menu node added', newNode);
    },
    onNodesChange: async (changes, canvasId) => {
      set((state) => {
        const updatedNodes = state.nodes.map((node) => {
          const change = changes.find((change) => change.id === node.id);
          if (change) {
            let updatedNode = { ...node };
            let hasChanges = false;

            switch (change.type) {
              case 'position':
                if (
                  JSON.stringify(updatedNode.position) !==
                  JSON.stringify(change.position)
                ) {
                  updatedNode = { ...updatedNode, position: change.position };
                  hasChanges = true;
                }
                break;
              case 'dimensions':
                if (
                  updatedNode.width !== change.dimensions.width ||
                  updatedNode.height !== change.dimensions.height
                ) {
                  updatedNode = {
                    ...updatedNode,
                    width: change.dimensions.width,
                    height: change.dimensions.height
                  };
                  hasChanges = true;
                }
                break;
              case 'data':
                if (
                  JSON.stringify(updatedNode.data) !==
                  JSON.stringify(change.data)
                ) {
                  updatedNode = {
                    ...updatedNode,
                    data: { ...node.data, ...change.data }
                  };
                  hasChanges = true;
                }
                break;
              case 'style':
                if (
                  JSON.stringify(updatedNode.style) !==
                  JSON.stringify(change.style)
                ) {
                  updatedNode = {
                    ...updatedNode,
                    style: { ...node.style, ...change.style }
                  };
                  hasChanges = true;
                }
                break;
            }

            if (hasChanges && updatedNode.type !== 'selection_menu') {
              // Prepare updates for database
              const nodeUpdates: Partial<
                Database['public']['Tables']['nodes']['Update']
              > = {
                position: JSON.stringify(updatedNode.position),
                view_width: updatedNode.width,
                view_height: updatedNode.height,
                background_color: updatedNode.data?.backgroundColor,
                text_color: updatedNode.data?.textColor,
                title: updatedNode.data?.title,
                is_editing: updatedNode.data?.isEditing,
                z_index: updatedNode.data?.zIndex
              };

              // Prepare specific updates based on node type
              let specificUpdates: any = {};
              switch (updatedNode.type) {
                case 'note':
                  specificUpdates = {
                    content: updatedNode.data?.content || ''
                  };
                  break;
                case 'task':
                  specificUpdates = {
                    tasks: JSON.stringify(updatedNode.data?.tasks || [])
                  };
                  break;
                case 'table':
                  specificUpdates = {
                    columns: JSON.stringify(updatedNode.data?.columns || []),
                    rows: JSON.stringify(updatedNode.data?.rows || [])
                  };
                  break;
                case 'calendar':
                  specificUpdates = {
                    events: JSON.stringify(updatedNode.data?.events || []),
                    view: updatedNode.data?.view || 'month'
                  };
                  break;
                case 'draw':
                  specificUpdates = {
                    drawing_data: updatedNode.data?.drawingData || ''
                  };
                  break;
              }

              // Update node in database
              updateNodeInDB(
                updatedNode.id,
                nodeUpdates,
                specificUpdates,
                updatedNode.type as Database['public']['Enums']['node_type']
              );
            }

            return updatedNode;
          }
          return node;
        });

        // Update nodeInternals
        const updatedNodeInternals = new Map(state.nodeInternals);
        updatedNodes.forEach((node) => updatedNodeInternals.set(node.id, node));

        console.log('useNodeStore: Nodes updated', updatedNodes);
        return { nodes: updatedNodes, nodeInternals: updatedNodeInternals };
      });
    }
  }))
);

export default useNodeStore;
