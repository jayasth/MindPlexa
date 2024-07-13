import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

const supabase = createClient();

export const fetchCanvas = async (canvasId: string) => {
  console.log('canvasService: Fetching canvas with ID:', canvasId);

  const { data: canvasData, error: canvasError } = await supabase
    .from('canvases')
    .select(
      `*, 
      nodes(
        id, type, position, is_editing, background_color, text_color, title, z_index,
        view_width, view_height, edit_width, edit_height, mobile_edit_width, mobile_edit_height,
        note_nodes(content),
        task_nodes(tasks),
        calendar_nodes(events, view),
        table_nodes(columns, rows),
        draw_nodes(drawing_data),
        node_tags(tag),
        node_attachments(type, file_path, url)
      )`
    )
    .eq('id', canvasId)
    .single();

  if (canvasError) {
    console.error('canvasService: Error fetching canvas:', canvasError);
    throw canvasError;
  }

  console.log('canvasService: Raw canvas data:', canvasData);

  const canvas = toCamelCase(canvasData);

  // Organize nodes data
  const organizedNodes = canvas.nodes.map((node) => {
    const nodeType = node.type;
    const specificNodeData = node[`${nodeType}Nodes`];
    const tags = node.nodeTags.map((tag) => tag.tag);
    const attachments = node.nodeAttachments;

    delete node[`${nodeType}Nodes`];
    delete node.nodeTags;
    delete node.nodeAttachments;

    return {
      ...node,
      data: {
        ...specificNodeData,
        tags,
        attachments
      }
    };
  });

  console.log('canvasService: Organized nodes:', organizedNodes);

  return {
    ...canvas,
    nodes: organizedNodes
  };
};
export const saveCanvasState = async (canvasId: string, canvasState: any) => {
  const { nodes, ...canvasData } = canvasState;

  // Update canvas data
  const { error: canvasUpdateError } = await supabase
    .from('canvases')
    .update(toSnakeCase(canvasData))
    .eq('id', canvasId);

  if (canvasUpdateError) {
    console.error('canvasService: Error updating canvas:', canvasUpdateError);
    throw canvasUpdateError;
  }

  // Update nodes
  for (const node of nodes) {
    const { id: nodeId, type: nodeType, data, ...nodeData } = node;

    // Update common node data
    const { error: nodeUpdateError } = await supabase
      .from('nodes')
      .update(toSnakeCase(nodeData))
      .eq('id', nodeId);

    if (nodeUpdateError) {
      console.error('canvasService: Error updating node:', nodeUpdateError);
      throw nodeUpdateError;
    }

    // Update node-specific data
    if (nodeType !== 'selection_menu') {
      const updateSpecificNodeData = async () => {
        switch (nodeType) {
          case 'note':
            return supabase
              .from('note_nodes')
              .update(toSnakeCase(data))
              .eq('node_id', nodeId);
          case 'task':
            return supabase
              .from('task_nodes')
              .update(toSnakeCase(data))
              .eq('node_id', nodeId);
          case 'calendar':
            return supabase
              .from('calendar_nodes')
              .update(toSnakeCase(data))
              .eq('node_id', nodeId);
          case 'table':
            return supabase
              .from('table_nodes')
              .update(toSnakeCase(data))
              .eq('node_id', nodeId);
          case 'draw':
            return supabase
              .from('draw_nodes')
              .update(toSnakeCase(data))
              .eq('node_id', nodeId);
          default:
            throw new Error(`Unsupported node type: ${nodeType}`);
        }
      };

      const { error: specificNodeUpdateError } = await updateSpecificNodeData();

      if (specificNodeUpdateError) {
        console.error(
          `canvasService: Error updating ${nodeType} node:`,
          specificNodeUpdateError
        );
        throw specificNodeUpdateError;
      }
    }

    // Update node tags
    const { tags } = data;
    if (tags && Array.isArray(tags)) {
      // Delete existing tags
      await supabase.from('node_tags').delete().eq('node_id', nodeId);

      // Insert new tags
      const tagsData = tags.map((tag) => ({ node_id: nodeId, tag }));
      await supabase.from('node_tags').insert(tagsData);
    }

    // Update node attachments
    const { attachments } = data;
    if (attachments && Array.isArray(attachments)) {
      // Delete existing attachments
      await supabase.from('node_attachments').delete().eq('node_id', nodeId);

      // Insert new attachments
      const attachmentsData = attachments.map((attachment) => ({
        node_id: nodeId,
        ...attachment
      }));
      await supabase.from('node_attachments').insert(attachmentsData);
    }
  }
};
