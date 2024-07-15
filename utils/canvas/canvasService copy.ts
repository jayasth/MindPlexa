import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';
import { deleteNode, deleteNodes } from '@/utils/canvas/nodeService';
import { deleteEdge } from '@/utils/canvas/edgeService';

const supabase = createClient();

// Function to handle creating a new canvas, this is working
export const createCanvas = async (
  canvasTitle: string,
  setIsModalOpen: (isOpen: boolean) => void,
  router: ReturnType<typeof useRouter>
) => {
  if (canvasTitle.trim() !== '') {
    const insertResponse = await supabase
      .from('canvases')
      .insert(toSnakeCase({ id: uuidv4(), name: canvasTitle }));

    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => ({ data: toCamelCase(data), error }));

    if (error) {
      console.error('canvasService: Error fetching canvas:', error);
    } else if (data && data[0]) {
      setIsModalOpen(false);
      router.push(`/canvasEditor/${data[0].id}?new=true`);
    }
  }
};

// Function to handle deleting a canvas, updated to handle node_canvas_link
export const deleteCanvas = async (
  canvasId: string,
  setCanvases: (canvases: any) => void
) => {
  const { data: nodes, error: nodesError } = await supabase
    .from('node_canvas_link')
    .select('node_id')
    .eq('canvas_id', canvasId);

  if (nodesError) {
    console.error('Error fetching canvas nodes:', nodesError);
    return;
  }

  const nodeIds = nodes.map((node) => node.node_id);

  // Delete associated edges
  await deleteEdge(canvasId);

  // Delete associated nodes
  for (const nodeId of nodeIds) {
    const { data: nodeData, error: nodeError } = await supabase
      .from('nodes')
      .select('type')
      .eq('id', nodeId)
      .single();

    if (nodeError) {
      console.error(`Error fetching node type for node ${nodeId}:`, nodeError);
      continue;
    }

    const nodeType = nodeData.type;
    if (nodeType) {
      await deleteNode(nodeId, nodeType);
    } else {
      console.error(`Node type for node ${nodeId} is null or undefined.`);
    }
  }

  // Delete the canvas
  const { error: deleteError } = await supabase
    .from('canvases')
    .delete()
    .eq('id', canvasId);

  if (deleteError) {
    console.error('Error deleting canvas:', deleteError);
  } else {
    setCanvases((prevCanvases) =>
      prevCanvases.filter((canvas) => canvas.id !== canvasId)
    );
  }
};

// Function to delete a canvas and its associated nodes (except shared ones)
export const deleteCanvasWithNodes = async (
  canvasId: string,
  setCanvases: (canvases: any) => void
) => {
  const { data: nodes, error: nodesError } = await supabase
    .from('node_canvas_link')
    .select('node_id')
    .eq('canvas_id', canvasId);

  if (nodesError) {
    console.error('Error fetching canvas nodes:', nodesError);
    return;
  }

  const nodeIds = nodes.map((node) => node.node_id);

  // Delete associated edges
  await supabase.from('edges').delete().eq('canvas_id', canvasId);

  // Delete associated nodes
  await deleteNodes(nodeIds);

  // Delete the canvas
  const { error: deleteError } = await supabase
    .from('canvases')
    .delete()
    .eq('id', canvasId);

  if (deleteError) {
    console.error('Error deleting canvas:', deleteError);
  } else {
    setCanvases((prevCanvases) =>
      prevCanvases.filter((canvas) => canvas.id !== canvasId)
    );
  }
};

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
        node_attachments(id, type, file_name, file_size, content)
      ),
      edges(id, source_node_id, target_node_id)`
    )
    .eq('id', canvasId)
    .single();

  if (canvasError) {
    console.error('canvasService: Error fetching canvas:', canvasError);
    throw canvasError;
  }

  const canvas = toCamelCase(canvasData);

  const organizedNodes = canvas.nodes
    ? canvas.nodes.map((node) => {
        const nodeType = node.type.toLowerCase();
        const specificNodeData = node[`${nodeType}_nodes`] || {};
        const tags = node.node_tags ? node.node_tags.map((tag) => tag.tag) : [];
        const attachments = node.node_attachments
          ? node.node_attachments.map((attachment) => ({
              type: attachment.type,
              name: attachment.file_name,
              size: attachment.file_size,
              content: attachment.content,
              fileName: attachment.file_name
            }))
          : [];

        delete node[`${nodeType}_nodes`];
        delete node.node_tags;
        delete node.node_attachments;

        return {
          ...node,
          data: {
            ...specificNodeData,
            tags,
            attachedFiles: attachments
          }
        };
      })
    : [];

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
            return null;
        }
      };

      const result = await updateSpecificNodeData();
      const specificNodeUpdateError = result?.error;

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
    const { attachedFiles } = data;
    if (attachedFiles && Array.isArray(attachedFiles)) {
      // Delete existing attachments
      await supabase.from('node_attachments').delete().eq('node_id', nodeId);

      // Insert new attachments
      const attachmentsData = attachedFiles.map((attachment) => ({
        node_id: nodeId,
        type: attachment.type,
        file_name: attachment.name || attachment.content,
        file_size: attachment.size || null,
        content: attachment.content
      }));
      await supabase.from('node_attachments').insert(attachmentsData);
    }
  }
};
