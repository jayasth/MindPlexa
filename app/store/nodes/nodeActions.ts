import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import {
  updateNode as updateNodeInDB,
  deleteNode as deleteNodeInDB
} from '@/utils/canvas/nodeService';
import * as nodeSpecificDataService from '@/utils/canvas/nodeSpecificDataService';
import {
  addAttachment,
  removeAttachment,
  getAttachments
} from '@/utils/canvas/attachmentService';
import { handleTags } from '@/utils/canvas/tagService';
import type { NodeState } from './useNodeStore';

export const addNode = async (set, node, canvasId) => {
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
};

export const updateNode = async (set, get, id, data, canvasId) => {
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
              ...data.data
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

          const specificUpdates =
            nodeSpecificDataService.processNodeSpecificData(
              existingNode.type as
                | 'note'
                | 'task'
                | 'table'
                | 'calendar'
                | 'draw',
              updatedNode.data
            );

          // Handle tags and attachments separately
          if (data.data?.tags) {
            handleTags(id, [...data.data.tags]);
          }
          if (data.data?.attachedFiles) {
            (async () => {
              const existingAttachments = await getAttachments(id);
              const existingIds = new Set(existingAttachments.map((a) => a.id));

              for (const attachment of data.data.attachedFiles) {
                if (!existingIds.has(attachment.id)) {
                  await addAttachment(id, attachment);
                }
              }

              for (const existingAttachment of existingAttachments) {
                if (
                  !data.data.attachedFiles.some(
                    (a) => a.id === existingAttachment.id
                  )
                ) {
                  await removeAttachment(existingAttachment.id);
                }
              }
            })();
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
};

export const removeNode = async (set, get, id, canvasId) => {
  try {
    const attachments = await getAttachments(id);
    for (const attachment of attachments) {
      await removeAttachment(attachment.id);
    }

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
};
