import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import {
  updateNode as updateNodeInDB,
  deleteNode as deleteNodeInDB,
  handleTags,
  handleAttachments
} from '@/utils/canvas/nodeService';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import type { Node, XYPosition } from 'reactflow';
import { createClient } from '@/utils/supabase/supabaseClient';

const supabase = createClient();

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
                  textColor:
                    data.data?.textColor || existingNode.data.textColor,
                  tags: data.data?.tags || existingNode.data.tags,
                  attachedFiles:
                    data.data?.attachedFiles || existingNode.data.attachedFiles,
                  isEditing:
                    data.data?.isEditing ?? existingNode.data.isEditing,
                  isTemporary:
                    data.data?.isTemporary ?? existingNode.data.isTemporary,
                  viewWidth:
                    data.data?.viewWidth || existingNode.data.viewWidth,
                  viewHeight:
                    data.data?.viewHeight || existingNode.data.viewHeight,
                  editWidth:
                    data.data?.editWidth || existingNode.data.editWidth,
                  editHeight:
                    data.data?.editHeight || existingNode.data.editHeight,
                  mobileEditWidth:
                    data.data?.mobileEditWidth ||
                    existingNode.data.mobileEditWidth,
                  mobileEditHeight:
                    data.data?.mobileEditHeight ||
                    existingNode.data.mobileEditHeight
                }
              };

              const nodeUpdates = {
                position: JSON.stringify(updatedNode.position),
                backgroundColor: updatedNode.data.backgroundColor,
                textColor: updatedNode.data.textColor,
                title: updatedNode.data.title,
                is_editing: updatedNode.data.isEditing,
                zIndex: updatedNode.data.zIndex,
                edit_width: updatedNode.data.editWidth,
                edit_height: updatedNode.data.editHeight,
                mobile_edit_width: updatedNode.data.mobileEditWidth,
                mobile_edit_height: updatedNode.data.mobileEditHeight,
                parent_node_id: updatedNode.data.parentNodeId,
                is_temporary: updatedNode.data.isTemporary,
                view_width: updatedNode.data.viewWidth,
                view_height: updatedNode.data.viewHeight,
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

              // Handle tags and attachments separately
              if (data.data?.tags) {
                handleTags(id, data.data.tags);
              }
              if (data.data?.attachedFiles) {
                handleAttachments(id, data.data.attachedFiles);
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
        // Delete associated attachments from Supabase storage bucket
        const { data: attachments, error: attachmentsError } = await supabase
          .from('node_attachments')
          .select('content')
          .eq('node_id', id);

        if (attachmentsError) {
          throw attachmentsError;
        }
        const fileIds = attachments
          .map((attachment) => attachment.content)
          .filter((content): content is string => content !== null);
        await supabase.storage.from('node-attachments').remove(fileIds);

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
          if (node && node.type !== 'selection_menu') {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                isEditing: !node.data?.isEditing
              }
            };
            state.nodeInternals.set(nodeId, updatedNode);
            state.nodes = state.nodes.map((n) =>
              n.id === nodeId ? updatedNode : n
            );

            // Update only the is_editing field in the nodes table
            updateNodeInDB(
              nodeId,
              { is_editing: updatedNode.data.isEditing },
              {},
              node.type as
                | 'note'
                | 'task'
                | 'table'
                | 'calendar'
                | 'draw'
                | 'selection_menu'
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
            viewWidth: nodeDimensions[type].width,
            viewHeight: nodeDimensions[type].height,
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
                    backgroundColor: '#F4F4F4',
                    textColor: '#575757',
                    isEditing: false,
                    isTemporary: false,
                    viewWidth: nodeDimensions[selectedNodeType].width,
                    viewHeight: nodeDimensions[selectedNodeType].height,
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
        console.log('useNodeStore: Before onNodesChange', get().nodes);
        set(
          produce((state: NodeState) => {
            const updatedNodes = state.nodes.map((node) => {
              const change = changes.find((change) => change.id === node.id);
              if (change) {
                let updatedNode = { ...node };
                let hasChanges = false;
                let changedProperties = {};

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
                      changedProperties['position'] = change.position;
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
                      changedProperties['width'] = change.dimensions.width;
                      changedProperties['height'] = change.dimensions.height;
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
                      changedProperties['data'] = change.data;
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
                      changedProperties['style'] = change.style;
                      hasChanges = true;
                    }
                    break;
                }
                if (hasChanges) {
                  console.log('useNodeStore: Node changes detected', {
                    nodeId: updatedNode.id,
                    changedProperties
                  });

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
