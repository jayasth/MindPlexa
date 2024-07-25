import { produce } from 'immer';
import { updateNode as updateNodeInDB } from '@/utils/canvas/nodeService';
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

export const onNodesChange = async (set, get, changes, canvasId) => {
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
                  changedProperties['position'] = JSON.stringify(
                    change.position
                  );
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
                  changedProperties['view_width'] = change.dimensions.width;
                  changedProperties['view_height'] = change.dimensions.height;
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

              // Prepare updates for nodes table
              const nodeUpdates = {
                position: JSON.stringify(updatedNode.position),
                background_color: updatedNode.data?.backgroundColor,
                text_color: updatedNode.data?.textColor,
                title: updatedNode.data?.title,
                is_editing: updatedNode.data?.isEditing,
                z_index: updatedNode.data?.zIndex,
                edit_width: updatedNode.data?.editWidth,
                edit_height: updatedNode.data?.editHeight,
                mobile_edit_width: updatedNode.data?.mobileEditWidth,
                mobile_edit_height: updatedNode.data?.mobileEditHeight,
                parent_node_id: updatedNode.data?.parentNodeId,
                view_width: updatedNode.data?.viewWidth,
                view_height: updatedNode.data?.viewHeight,
                is_temporary: updatedNode.data?.isTemporary,
                version: updatedNode.data?.version
              };

              // Prepare specific updates based on node type
              let specificUpdates = {};
              switch (updatedNode.type) {
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
                    layers: JSON.stringify(updatedNode.data.layers),
                    settings: JSON.stringify(updatedNode.data.settings),
                    zoom_level: updatedNode.data.zoomLevel
                  };
                  const drawingData = updatedNode.data.drawingData;
                  if (drawingData) {
                    const svgPath = nodeSpecificDataService.uploadSVGToBucket(
                      updatedNode.id,
                      drawingData
                    );
                    if (svgPath) {
                      specificUpdates['drawing_file_url'] = svgPath;
                    }
                  }
                  break;
              }

              // Update node in database
              updateNodeInDB(
                updatedNode.id,
                nodeUpdates,
                specificUpdates,
                updatedNode.type as NodeType
              );

              nodeSpecificDataService.updateNodeSpecificData(
                updatedNode.id,
                updatedNode.type as NodeType,
                specificUpdates
              );

              // Handle tags
              if (updatedNode.data?.tags) {
                handleTags(updatedNode.id, [...updatedNode.data.tags]);
              }

              // Handle attachments
              if (updatedNode.data?.attachedFiles) {
                (async () => {
                  const existingAttachments = await getAttachments(
                    updatedNode.id
                  );
                  const existingIds = new Set(
                    existingAttachments.map((a) => a.id)
                  );

                  for (const attachment of updatedNode.data.attachedFiles) {
                    if (!existingIds.has(attachment.id)) {
                      await addAttachment(updatedNode.id, attachment);
                    }
                  }

                  for (const existingAttachment of existingAttachments) {
                    if (
                      !updatedNode.data.attachedFiles.some(
                        (a) => a.id === existingAttachment.id
                      )
                    ) {
                      await removeAttachment(existingAttachment.id);
                    }
                  }
                })();
              }
            }

            return updatedNode;
          }
          return node;
        });

        // Update nodeInternals
        const updatedNodeInternals = new Map(state.nodeInternals);
        updatedNodes.forEach((node) => updatedNodeInternals.set(node.id, node));

        console.log('useNodeStore: Nodes updated', updatedNodes);
        state.nodes = updatedNodes;
        state.nodeInternals = updatedNodeInternals;
      })
    );
    console.log('useNodeStore: After onNodesChange', get().nodes);
  } catch (error) {
    console.error('useNodeStore: Error updating nodes', error);
  }
};
