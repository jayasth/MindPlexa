import { produce } from 'immer';
import {
  updateNode as updateNodeInDB,
  deleteNode as deleteNodeInDB
} from '@/utils/canvas/nodeService';
import {
  addAttachment,
  removeAttachment,
  getAttachments
} from '@/utils/canvas/attachmentService';
import { handleTags } from '@/utils/canvas/tagService';
import type { NodeState } from './useNodeStore';
import { Database } from '@/types_db';
import * as nodeSpecificDataService from '@/utils/canvas/nodeSpecificDataService';

type NodeType = Exclude<
  Database['public']['Enums']['node_type'],
  'selection_menu'
>;

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
            background_color: updatedNode.data.backgroundColor,
            text_color: updatedNode.data.textColor,
            title: updatedNode.data.title,
            is_editing: updatedNode.data.isEditing,
            z_index: updatedNode.data.zIndex,
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

          let specificUpdates = {};
          switch (existingNode.type) {
            case 'note':
              specificUpdates = {
                content: updatedNode.data.content
              };
              break;
            case 'task':
              specificUpdates = {
                tasks: JSON.stringify(updatedNode.data.tasks),
                completed_tasks: updatedNode.data.completedTasks,
                total_tasks: updatedNode.data.totalTasks,
                show_completed_tasks: updatedNode.data.showCompletedTasks,
                show_due_date: updatedNode.data.showDueDate,
                show_priority: updatedNode.data.showPriority,
                sort_by: updatedNode.data.sortBy
              };
              break;
            case 'calendar':
              specificUpdates = {
                events: JSON.stringify(updatedNode.data.events),
                default_view: updatedNode.data.defaultView,
                time_zone: updatedNode.data.timeZone
              };
              break;
            case 'table':
              specificUpdates = {
                columns: JSON.stringify(updatedNode.data.columns),
                rows: JSON.stringify(updatedNode.data.rows),
                default_column_type: updatedNode.data.defaultColumnType,
                default_locale: updatedNode.data.defaultLocale
              };
              break;
            case 'draw':
              specificUpdates = {
                current_tool: updatedNode.data.currentTool,
                drawing_file_url: updatedNode.data.drawingFileUrl,
                layers: JSON.stringify(updatedNode.data.layers),
                settings: JSON.stringify(updatedNode.data.settings),
                zoom_level: updatedNode.data.zoomLevel
              };
              // Adjusted to handle draw node's specific data
              if (data.data?.drawingData) {
                nodeSpecificDataService.updateNodeSpecificData(
                  id,
                  existingNode.type as NodeType,
                  { drawing_file_url: data.data.drawingData }
                );
              }
              break;
          }

          // Handle tags
          if (data.data?.tags) {
            handleTags(id, [...data.data.tags]);
          }

          // Handle attachments
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

          if (existingNode.type && existingNode.type !== 'selection_menu') {
            updateNodeInDB(
              id,
              nodeUpdates,
              specificUpdates,
              existingNode.type as NodeType
            );
            nodeSpecificDataService.updateNodeSpecificData(
              id,
              existingNode.type as NodeType,
              specificUpdates
            );
          }

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
        if (
          nodeToRemove &&
          nodeToRemove.type &&
          nodeToRemove.type !== 'selection_menu'
        ) {
          deleteNodeInDB(id, nodeToRemove.type as NodeType);
          state.nodeInternals.delete(id);
          console.log(`useNodeStore: Node with id ${id} removed`, nodeToRemove);
          state.nodes = state.nodes.filter((node) => node.id !== id);

          // Ensure the drawing is deleted from the bucket when the node is deleted
          if (nodeToRemove.type === 'draw') {
            nodeSpecificDataService.deleteNodeSpecificData(
              id,
              nodeToRemove.type as NodeType
            );
          }
        }
      })
    );
  } catch (error) {
    console.error('useNodeStore: Error removing node', error);
  }
};
