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
          if (existingNode.type && existingNode.type !== 'selection_menu') {
            specificUpdates = getNodeSpecificUpdates(
              existingNode.type as NodeType,
              updatedNode.data
            );

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

const getNodeSpecificUpdates = (nodeType: NodeType, data: any) => {
  switch (nodeType) {
    case 'note':
      return { content: data.content };
    case 'task':
      return {
        tasks: JSON.stringify(data.tasks),
        completed_tasks: data.completedTasks,
        total_tasks: data.totalTasks,
        show_completed_tasks: data.showCompletedTasks,
        show_due_date: data.showDueDate,
        show_priority: data.showPriority,
        sort_by: data.sortBy
      };
    case 'calendar':
      return {
        events: JSON.stringify(data.events),
        default_view: data.defaultView,
        time_zone: data.timeZone
      };
    case 'table':
      return {
        columns: JSON.stringify(data.columns),
        rows: JSON.stringify(data.rows),
        default_column_type: data.defaultColumnType,
        settings: JSON.stringify(data.settings),
        date_format: data.dateFormat
      };
    case 'draw':
      return {
        current_tool: data.currentTool,
        drawing_file_url: data.drawingFileUrl,
        settings: JSON.stringify(data.settings),
        current_color: data.currentColor,
        current_stroke_width: data.currentStrokeWidth
      };
    default:
      return {};
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
          deleteNodeInDB(id, nodeToRemove.type as NodeType);
          state.nodeInternals.delete(id);
          state.nodes = state.nodes.filter((node) => node.id !== id);
          console.log(`useNodeStore: Node with id ${id} removed`, nodeToRemove);

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

export { getNodeSpecificUpdates };
