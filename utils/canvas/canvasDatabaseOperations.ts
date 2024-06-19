import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { useRouter } from 'next/navigation';

const supabase = createClient();

/*canvas related functions*/

// Function to handle creating a new canvas, this is working
export const createCanvas = async (
  canvasTitle: string,
  setIsModalOpen: (isOpen: boolean) => void,
  router: ReturnType<typeof useRouter>
) => {
  if (canvasTitle.trim() !== '') {
    const insertResponse = await supabase
      .from('canvases')
      .insert({ name: canvasTitle });

    console.log('canvasDatabaseOperations: Insert response:', insertResponse);

    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('canvasDatabaseOperations: Select data:', data);
    console.log('canvasDatabaseOperations: Select error:', error);

    if (error) {
      console.error('canvasDatabaseOperations: Error fetching canvas:', error);
    } else if (data && data[0]) {
      console.log('canvasDatabaseOperations: Redirecting to new canvas...');
      setIsModalOpen(false);
      router.push(`/canvasEditor/${data[0].id}?new=true`);
    } else {
      console.log('canvasDatabaseOperations: Fetch operation returned no data');
    }
  }
};

// Function to handle deleting a canvas, this is working
export const deleteCanvas = async (
  canvasId: string,
  setCanvases: (canvases: any) => void
) => {
  const { error } = await supabase.from('canvases').delete().eq('id', canvasId);

  if (error) {
    console.log('canvasDatabaseOperations: Error deleting canvas:', error);
  } else {
    setCanvases((prevCanvases: any) =>
      prevCanvases.filter((canvas: any) => canvas.id !== canvasId)
    );
  }
};

// Function to save the canvas state
export const saveCanvasState = async (
  canvasId: string,
  nodes: Database['public']['Tables']['nodes']['Insert'][],
  edges: Database['public']['Tables']['edges']['Insert'][]
) => {
  const { error: deleteNodesError } = await supabase
    .from('nodes')
    .delete()
    .eq('canvas_id', canvasId);
  if (deleteNodesError) {
    console.error(
      'canvasDatabaseOperations: Error deleting existing nodes:',
      deleteNodesError
    );
    return { error: deleteNodesError };
  }

  const { error: deleteEdgesError } = await supabase
    .from('edges')
    .delete()
    .eq('canvas_id', canvasId);
  if (deleteEdgesError) {
    console.error(
      'canvasDatabaseOperations: Error deleting existing edges:',
      deleteEdgesError
    );
    return { error: deleteEdgesError };
  }

  const { error: createNodesError } = await supabase
    .from('nodes')
    .insert(nodes);
  if (createNodesError) {
    console.error(
      'canvasDatabaseOperations: Error inserting nodes:',
      createNodesError
    );
    return { error: createNodesError };
  }

  const { error: createEdgesError } = await supabase
    .from('edges')
    .insert(edges);
  if (createEdgesError) {
    console.error(
      'canvasDatabaseOperations: Error inserting edges:',
      createEdgesError
    );
    return { error: createEdgesError };
  }

  return { success: true };
};

// Function to fetch the canvas state
export const fetchCanvas = async (canvasId: string) => {
  const { data, error } = await supabase
    .from('canvases')
    .select(
      `
      *,
      nodes(*),
      edges(*)
    `
    )
    .eq('id', canvasId)
    .single();
  if (error) {
    console.error('canvasDatabaseOperations: Error fetching canvas:', error);
    return { error };
  }
  return { data };
};

/* node related functions */

// Function to insert a new node
export const createNode = async (
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw',
  position: { x: number; y: number },
  data: any
) => {
  try {
    // Create a base node first
    const baseNodeInsert = {
      type: nodeType,
      position: JSON.stringify(position),
      width: data.width,
      height: data.height,
      color: data.backgroundColor || '#F4F4F4'
    };

    const { data: baseNodeData, error: baseNodeError } = await supabase
      .from('base_nodes')
      .insert([baseNodeInsert])
      .select()
      .single();

    if (baseNodeError) {
      console.error('Error inserting base node:', baseNodeError);
      return { error: baseNodeError };
    }

    // Create the specific node type
    const specificNodeInsert = {
      base_node_id: baseNodeData.id,
      title: data.title,
      background_color: data.backgroundColor || '#F4F4F4',
      text_color: data.textColor || '#575757',
      tags: data.tags,
      attached_files: data.attachedFiles
    };

    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];

    const { data: specificNodeData, error: specificNodeError } = await supabase
      .from(tableName)
      .insert([specificNodeInsert])
      .select()
      .single();

    if (specificNodeError) {
      console.error(`Error inserting ${nodeType} node:`, specificNodeError);
      return { error: specificNodeError };
    }

    return { data: { ...baseNodeData, ...specificNodeData } };
  } catch (error) {
    console.error('Unexpected error creating node:', error);
    return { error };
  }
};

// Function to update an existing node
export const updateNode = async (
  id: string,
  updates: Partial<Database['public']['Tables']['base_nodes']['Update']>,
  specificUpdates: any,
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
) => {
  // Update the base node
  const { data: baseNodeData, error: baseNodeError } = await supabase
    .from('base_nodes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (baseNodeError) {
    console.error(
      'canvasDatabaseOperations: Error updating base node:',
      baseNodeError
    );
    return { error: baseNodeError };
  }

  // Update the specific node type
  const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
  const { data: specificNodeData, error: specificNodeError } = await supabase
    .from(tableName)
    .update(specificUpdates)
    .eq('base_node_id', id)
    .select()
    .single();

  if (specificNodeError) {
    console.error(
      `canvasDatabaseOperations: Error updating ${nodeType} node:`,
      specificNodeError
    );
    return { error: specificNodeError };
  }

  return { data: { ...baseNodeData, ...specificNodeData } };
};

// Function to delete a node
export const deleteNode = async (
  id: string,
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
) => {
  const { error } = await supabase.from('nodes').delete().eq('id', id);
  if (error) {
    console.error('canvasDatabaseOperations: Error deleting node:', error);
    return { error };
  }

  const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
  const { error: specificError } = await supabase
    .from(tableName)
    .delete()
    .eq('base_node_id', id);
  if (specificError) {
    console.error(
      `canvasDatabaseOperations: Error deleting ${nodeType} node:`,
      specificError
    );
    return { error: specificError };
  }

  return { success: true };
};

// Function to attach a file to a node
export const attachFileToNode = async (nodeId: string, fileId: number) => {
  const { data, error } = await supabase
    .from('node_files')
    .insert([{ node_id: nodeId, file_id: fileId }]);
  if (error) {
    console.error(
      'canvasDatabaseOperations: Error attaching file to node:',
      error
    );
    return { error };
  }
  return { data };
};

// Function to remove a file from a node
export const removeFileFromNode = async (nodeId: string, fileId: number) => {
  const { error } = await supabase
    .from('node_files')
    .delete()
    .match({ node_id: nodeId, file_id: fileId });
  if (error) {
    console.error(
      'canvasDatabaseOperations: Error removing file from node:',
      error
    );
    return { error };
  }
  return { success: true };
};

/* edge related functions */

// Function to insert a new edge
export const createEdge = async (
  edge: Database['public']['Tables']['edges']['Insert']
): Promise<{ data: { id: string }; error?: any }> => {
  const { data, error } = await supabase.from('edges').insert([edge]).single();
  if (error) {
    console.error('canvasDatabaseOperations: Error inserting edge:', error);
    return { data: { id: '' }, error };
  }
  return { data };
};

// Function to update an existing edge
export const updateEdge = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
) => {
  const { data, error } = await supabase
    .from('edges')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) {
    console.error('canvasDatabaseOperations: Error updating edge:', error);
    return { error };
  }
  return { data };
};

// Function to delete an edge
export const deleteEdge = async (id: string) => {
  const { error } = await supabase.from('edges').delete().eq('id', id);
  if (error) {
    console.error('canvasDatabaseOperations: Error deleting edge:', error);
    return { error };
  }
  return { success: true };
};
