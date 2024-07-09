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
    updateNode: async (id, data, canvasId) => {
      try {
        console.log('useNodeStore: Before updateNode', { id, data });
        set(
          produce((state: NodeState) => {
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
                    data.data?.backgroundColor ||
                    existingNode.data.backgroundColor,
                  textColor: data.data?.textColor || existingNode.data.textColor
                }
              };

              const nodeUpdates = {
                position: JSON.stringify(updatedNode.position),
                backgroundColor: updatedNode.data.backgroundColor,
                textColor: updatedNode.data.textColor,
                title: updatedNode.data.title,
                isEditing: updatedNode.data.isEditing,
                zIndex: updatedNode.data.zIndex,
                editWidth: updatedNode.data.editWidth,
                editHeight: updatedNode.data.editHeight,
                mobileEditWidth: updatedNode.data.mobileEditWidth,
                mobileEditHeight: updatedNode.data.mobileEditHeight,
                parentNodeId: updatedNode.data.parentNodeId,
                viewWidth: updatedNode.data.viewWidth,
                viewHeight: updatedNode.data.viewHeight,
                isTemporary: updatedNode.data.isTemporary,
                version: updatedNode.data.version
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
                    drawingData: updatedNode.data.drawingData || ''
                  };
                  break;
              }

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
                  | 'selection_menu'
              );

              state.nodeInternals.set(id, updatedNode);
              console.log('useNodeStore: Node updated', updatedNode);
              state.nodes[existingNodeIndex] = updatedNode;
            }
          })
        );
        console.log('useNodeStore: After updateNode', get().nodes);
      } catch (error) {
        console.error('useNodeStore: Error updating node', error);
      }
    },
    removeNode: async (id, canvasId) => {
      try {
        set(
          produce((state: NodeState) => {
            const nodeToRemove = state.nodes.find((node) => node.id === id);
            if (nodeToRemove) {
              deleteNodeInDB(
                id,
                nodeToRemove.type as
                  | 'note'
                  | 'task'
                  | 'table'
                  | 'calendar'
                  | 'draw'
                  | 'selection_menu'
              );
              state.nodeInternals.delete(id);
              console.log('useNodeStore: Node removed', nodeToRemove);
              state.nodes = state.nodes.filter((node) => node.id !== id);
            }
          })
        );
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
            state.nodes = state.nodes.map((n) =>
              n.id === nodeId ? updatedNode : n
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
            color: '#575757'
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
                  data: { label: 'New Node', parentId: parentNode.id }
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
          newNode // Include the newly created selection_menu node
        ]);
        console.log('useNodeStore: Selection menu node added', newNode);
      } catch (error) {
        console.error('useNodeStore: Error adding selection menu node', error);
      }
    },
    onNodesChange: async (changes, canvasId) => {
      try {
        console.log('useNodeStore: Before onNodesChange', get().nodes);
        set(
          produce((state: NodeState) => {
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
                      updatedNode = {
                        ...updatedNode,
                        position: change.position
                      };
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
                if (hasChanges) {
                  // Prepare updates for database
                  const nodeUpdates = {
                    position: JSON.stringify(updatedNode.position),
                    backgroundColor: updatedNode.data?.backgroundColor,
                    textColor: updatedNode.data?.textColor,
                    title: updatedNode.data?.title,
                    isEditing: updatedNode.data?.isEditing,
                    zIndex: updatedNode.data?.zIndex,
                    editWidth: updatedNode.data?.editWidth,
                    editHeight: updatedNode.data?.editHeight,
                    mobileEditWidth: updatedNode.data?.mobileEditWidth,
                    mobileEditHeight: updatedNode.data?.mobileEditHeight,
                    parentNodeId: updatedNode.data?.parentNodeId,
                    viewWidth: updatedNode.data?.viewWidth,
                    viewHeight: updatedNode.data?.viewHeight,
                    isTemporary: updatedNode.data?.isTemporary,
                    version: updatedNode.data?.version
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
                        columns: JSON.stringify(
                          updatedNode.data?.columns || []
                        ),
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
                        drawingData: updatedNode.data?.drawingData || ''
                      };
                      break;
                  }

                  // Update node in database
                  updateNodeInDB(
                    updatedNode.id,
                    nodeUpdates,
                    specificUpdates,
                    updatedNode.type as
                      | 'note'
                      | 'task'
                      | 'table'
                      | 'calendar'
                      | 'draw'
                      | 'selection_menu'
                  );
                }

                return updatedNode;
              }
              return node;
            });

            // Update nodeInternals
            const updatedNodeInternals = new Map(state.nodeInternals);
            updatedNodes.forEach((node) =>
              updatedNodeInternals.set(node.id, node)
            );

            console.log('useNodeStore: Nodes updated', updatedNodes);
            state.nodes = updatedNodes;
            state.nodeInternals = updatedNodeInternals;
          })
        );
        console.log('useNodeStore: After onNodesChange', get().nodes);
      } catch (error) {
        console.error('useNodeStore: Error updating nodes', error);
      }
    }
  }))
);

export default useNodeStore;
