import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

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
  const { error: linkError } = await deleteCanvasLinks(canvasId);

  if (linkError) {
    return { error: linkError };
  }

  const { error } = await supabase.from('canvases').delete().eq('id', canvasId);

  if (error) {
    console.error('canvasService: Error deleting canvas:', error);
    return { error };
  } else {
    setCanvases((prevCanvases: any) =>
      prevCanvases.filter((canvas: any) => canvas.id !== canvasId)
    );
    return { success: true };
  }
};

// Function to delete a canvas and its associated nodes (except shared ones)
export const deleteCanvasWithNodes = async (
  canvasId: string,
  setCanvases: (canvases: any) => void
) => {
  try {
    const linkedNodes = await fetchLinkedNodes(canvasId);
    const nodeIds = linkedNodes.map((link) => link.node_id);

    const sharedNodes = await fetchSharedNodes(nodeIds);
    const sharedNodeIds = sharedNodes.map((node) => node.node_id);
    const nonSharedNodeIds = nodeIds.filter(
      (nodeId) => !sharedNodeIds.includes(nodeId)
    );

    await deleteNonSharedNodes(nonSharedNodeIds);

    const { error: linkDeleteError } = await deleteCanvasLinks(canvasId);

    if (linkDeleteError) {
      throw linkDeleteError;
    }

    const { error: canvasError } = await supabase
      .from('canvases')
      .delete()
      .eq('id', canvasId);

    if (canvasError) {
      throw canvasError;
    }

    setCanvases((prevCanvases: any) =>
      prevCanvases.filter((canvas: any) => canvas.id !== canvasId)
    );

    return { success: true };
  } catch (error) {
    console.error(
      'canvasService: Error during canvas and node deletion:',
      error
    );
    return { error };
  }
};

// Helper functions
const deleteCanvasLinks = async (canvasId: string) => {
  const { error } = await supabase
    .from('node_canvas_link')
    .delete()
    .eq('canvas_id', canvasId);
  if (error) {
    console.error('canvasService: Error deleting canvas links:', error);
  }
  return { error };
};

const fetchLinkedNodes = async (canvasId: string) => {
  const { data, error } = await supabase
    .from('node_canvas_link')
    .select('node_id')
    .eq('canvas_id', canvasId);
  if (error) {
    console.error('canvasService: Error fetching linked nodes:', error);
    throw error;
  }
  return data;
};

const fetchSharedNodes = async (nodeIds: string[]) => {
  const { data, error } = await supabase
    .from('node_canvas_link')
    .select('node_id')
    .in('node_id', nodeIds);
  if (error) {
    console.error('canvasService: Error fetching shared nodes:', error);
    throw error;
  }
  return data;
};

const deleteNonSharedNodes = async (nodeIds: string[]) => {
  for (const nodeId of nodeIds) {
    const { data: nodeData, error: nodeError } = await supabase
      .from('nodes')
      .select('type')
      .eq('id', nodeId)
      .single()
      .then(({ data, error }) => ({ data: toCamelCase(data), error }));

    if (nodeError) {
      console.error('canvasService: Error fetching node type:', nodeError);
      throw nodeError;
    }

    const nodeType = nodeData.type;
    if (nodeType !== 'selection_menu') {
      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('node_id', nodeId);

      if (deleteError) {
        console.error(
          `canvasService: Error deleting ${nodeType} node:`,
          deleteError
        );
        throw deleteError;
      }
    }

    const { error: nodeDeleteError } = await supabase
      .from('nodes')
      .delete()
      .eq('id', nodeId);

    if (nodeDeleteError) {
      console.error('canvasService: Error deleting node:', nodeDeleteError);
      throw nodeDeleteError;
    }
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
        node_attachments(type, file_path, url)
      ),
      edges(id, source_node_id, target_node_id)`
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
