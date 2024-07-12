import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import {
  updateNode as updateNodeInDB,
  deleteNode as deleteNodeInDB
} from '@/utils/canvas/nodeService';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import type { Node, XYPosition } from 'reactflow';

interface NodeState {
  nodes: Node[];
  nodeInternals: Map<string, Node>;
  addNode: (node: Node, canvasId: string) => Promise<void>;
  updateNode: (
    id: string,
    updates: {
      nodeData?: {
        backgroundColor?: string | null;
        createdAt?: string | null;
        editHeight?: number | null;
        editWidth?: number | null;
        id?: string;
        mobileEditHeight?: number | null;
        mobileEditWidth?: number | null;
        position?: XYPosition;
        textColor?: string | null;
        title?: string | null;
        viewHeight?: number;
        viewWidth?: number;
        isEditing?: boolean;
        isTemporary?: boolean;
        parentNodeId?: string | null;
        zIndex?: number;
      };
      noteData?: any;
      taskData?: any;
      calendarData?: any;
      tableData?: any;
      drawData?: any;
      tags?: string[];
      attachments?: { id: string; url: string; type: string }[];
    },
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
}

const useNodeStore = create<NodeState>()(
  devtools((set, get) => ({
    nodes: [],
    nodeInternals: new Map(),
    addNode: async (node, canvasId) => {
      try {
        set(
          produce((state: NodeState) => {
            state.nodes.push(node);
            state.nodeInternals.set(node.id, node);
          })
        );
        console.log('useNodeStore: Node added', node);
      } catch (error) {
        console.error('useNodeStore: Error adding node', error);
      }
    },
    updateNode: async (id, updates, canvasId) => {
      try {
        const { nodeInternals } = get();
        const node = nodeInternals.get(id);
        if (!node) throw new Error('Node not found');

        const { error } = await updateNodeInDB(id, node.type as any, updates);
        if (error) throw error;

        set(
          produce((state: NodeState) => {
            const updatedNode = {
              ...node,
              ...updates.nodeData,
              position: updates.nodeData?.position || node.position,
              data: {
                ...node.data,
                ...updates[`${node.type}Data`],
                tags: updates.tags,
                attachments: updates.attachments
              }
            };
            state.nodeInternals.set(id, updatedNode);
            state.nodes = state.nodes.map((n) =>
              n.id === id ? updatedNode : n
            );
          })
        );
        console.log('useNodeStore: Node updated', id);
      } catch (error) {
        console.error('useNodeStore: Error updating node', error);
      }
    },
    removeNode: async (id, canvasId) => {
      try {
        const node = get().nodes.find((n) => n.id === id);
        if (!node) throw new Error('Node not found');

        const { error } = await deleteNodeInDB(id, node.type as any);
        if (error) throw error;

        set(
          produce((state: NodeState) => {
            state.nodes = state.nodes.filter((n) => n.id !== id);
            state.nodeInternals.delete(id);
          })
        );
        console.log('useNodeStore: Node removed', id);
      } catch (error) {
        console.error('useNodeStore: Error removing node', error);
      }
    },
    setNodes: (updater) => {
      set(
        produce((state: NodeState) => {
          const updatedNodes =
            typeof updater === 'function' ? updater(state.nodes) : updater;
          state.nodeInternals.clear();
          updatedNodes.forEach((node) =>
            state.nodeInternals.set(node.id, node)
          );
          console.log('useNodeStore: Nodes set', updatedNodes);
          state.nodes = updatedNodes;
        })
      );
    },
    setInitialState: (nodes) => {
      if (get().nodes.length > 0) return;
      console.log('useNodeStore: Setting initial state', nodes);
      set(
        produce((state: NodeState) => {
          state.nodes = nodes;
          state.nodeInternals = new Map(nodes.map((node) => [node.id, node]));
        })
      );
    },
    toggleEditMode: (nodeId) => {
      set(
        produce((state: NodeState) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node && node.type !== 'selection_menu') {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                isEditing: !node.data?.isEditing
              }
            };
            state.nodeInternals.set(nodeId, updatedNode);
            console.log('useNodeStore: Edit mode toggled', updatedNode);
            state.nodes = state.nodes.map((n) =>
              n.id === nodeId ? updatedNode : n
            );

            // Update the is_editing status in the database
            get().updateNode(
              nodeId,
              { nodeData: { isEditing: updatedNode.data.isEditing } },
              ''
            );
          }
        })
      );
    },
    setSelectedNodes: (selectedIds) => {
      set(
        produce((state: NodeState) => {
          const updatedNodes = state.nodes.map((node) => ({
            ...node,
            selected: selectedIds.includes(node.id)
          }));
          updatedNodes.forEach((node) =>
            state.nodeInternals.set(node.id, node)
          );
          console.log('useNodeStore: Nodes selected', updatedNodes);
          state.nodes = updatedNodes;
        })
      );
    },
    addChildNode: async (parentNode, position, type, canvasId) => {
      try {
        const { addNode, setNodes } = get();
        const newNode = {
          id: uuidv4(),
          type: type,
          data: { label: 'New Node', parentId: parentNode.id },
          position,
          style: {
            backgroundColor: '#F4F4F4',
            textColor: '#575757',
            isEditing: false,
            isTemporary: false,
            viewWidth: nodeDimensions[type].viewWidth,
            viewHeight: nodeDimensions[type].viewHeight,
            editWidth: nodeDimensions[type].editWidth,
            editHeight: nodeDimensions[type].editHeight,
            mobileEditWidth: nodeDimensions[type].mobileEditWidth,
            mobileEditHeight: nodeDimensions[type].mobileEditHeight
          }
        };
        await addNode(newNode, canvasId);
        setNodes((nodes) => [
          ...nodes.filter((node) => node.type !== 'selection_menu')
        ]);
        console.log('useNodeStore: Child node added', newNode);
      } catch (error) {
        console.error('useNodeStore: Error adding child node', error);
      }
    },
    createChildNodeFromDrag: async (
      parentNode,
      position,
      nodeType,
      canvasId
    ) => {
      try {
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
          console.error(
            'useNodeStore: Failed to calculate child node position.'
          );
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
              try {
                const createdNode = {
                  id: uuidv4(),
                  type: selectedNodeType,
                  position: selectedPosition,
                  data: {
                    label: 'New Node',
                    parentId: parentNode.id,
                    isEditing: false,
                    isTemporary: false
                  },
                  style: {
                    backgroundColor: '#F4F4F4',
                    textColor: '#575757',
                    viewWidth: nodeDimensions[selectedNodeType].viewWidth,
                    viewHeight: nodeDimensions[selectedNodeType].viewHeight,
                    editWidth: nodeDimensions[selectedNodeType].editWidth,
                    editHeight: nodeDimensions[selectedNodeType].editHeight,
                    mobileEditWidth:
                      nodeDimensions[selectedNodeType].mobileEditWidth,
                    mobileEditHeight:
                      nodeDimensions[selectedNodeType].mobileEditHeight
                  }
                };
                await addNode(createdNode, canvasId);
                await removeNode(newNode.id, canvasId);
                setNodes((nodes) =>
                  nodes.filter((node) => node.id !== newNode.id)
                );
                console.log(
                  'useNodeStore: Child node created from drag',
                  createdNode
                );
              } catch (error) {
                console.error(
                  'useNodeStore: Error creating child node from drag',
                  error
                );
              }
            },
            onClose: () => {
              try {
                removeNode(newNode.id, canvasId);
                setNodes((nodes) =>
                  nodes.filter((node) => node.id !== newNode.id)
                );
                console.log('useNodeStore: Selection menu closed', newNode);
              } catch (error) {
                console.error(
                  'useNodeStore: Error closing selection menu',
                  error
                );
              }
            },
            parentNode: parentNode,
            isTemporary: true
          },
          viewWidth: nodeDimensions['selection_menu'].width,
          viewHeight: nodeDimensions['selection_menu'].height
        };
        await addNode(newNode, canvasId);
        setNodes((nodes) => [
          ...nodes.filter((node) => node.type !== 'selection_menu'),
          newNode
        ]);
        console.log('useNodeStore: Selection menu node added', newNode);
      } catch (error) {
        console.error('useNodeStore: Error adding selection menu node', error);
      }
    },
    onNodesChange: async (changes, canvasId) => {
      try {
        const { updateNode, nodeInternals } = get();
        for (const change of changes) {
          const { id, type, data, position, style } = change;
          const node = nodeInternals.get(id);
          if (!node) throw new Error('Node not found');

          const updates = {
            nodeData: {
              position: JSON.stringify(position),
              viewWidth: style.viewWidth,
              viewHeight: style.viewHeight,
              editWidth: style.editWidth,
              editHeight: style.editHeight,
              mobileEditWidth: style.mobileEditWidth,
              mobileEditHeight: style.mobileEditHeight,
              backgroundColor: style.backgroundColor,
              textColor: style.textColor,
              title: data.label,
              isEditing: style.isEditing,
              isTemporary: style.isTemporary,
              parentNodeId: data.parentId,
              zIndex: style.zIndex
            },
            [`${type}Data`]: data
          };

          await updateNode(id, updates, canvasId);
        }
        console.log('useNodeStore: Nodes changed', changes);
      } catch (error) {
        console.error('useNodeStore: Error updating nodes', error);
      }
    }
  }))
);

export default useNodeStore;
