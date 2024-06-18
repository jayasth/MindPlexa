import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { Node, Edge } from 'reactflow';

const supabase = createClient();

// Function to insert a new node
export const createNode = async (
  node: Database['public']['Tables']['nodes']['Insert']
) => {
  const { data, error } = await supabase.from('nodes').insert([node]).single();
  if (error) {
    console.error('Error inserting node:', error);
    return { error };
  }
  return { data };
};

// Function to update an existing node
export const updateNode = async (
  id: string,
  updates: Partial<Database['public']['Tables']['nodes']['Update']>
) => {
  const { data, error } = await supabase
    .from('nodes')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error updating node:', error);
    return { error };
  }
  return { data };
};

// Function to delete a node
export const deleteNode = async (id: string) => {
  const { error } = await supabase.from('nodes').delete().eq('id', id);
  if (error) {
    console.error('Error deleting node:', error);
    return { error };
  }
  return { success: true };
};

// Function to insert a new edge
export const createEdge = async (
  edge: Database['public']['Tables']['edges']['Insert']
) => {
  const { data, error } = await supabase.from('edges').insert([edge]).single();
  if (error) {
    console.error('Error inserting edge:', error);
    return { error };
  }
  return { data };
};

// Function to update an existing edge
export const updateEdge = async (
  id: string,
  updates: Partial<Database['public']['Tables']['edges']['Update']>
) => {
  const { data, error } = await supabase
    .from('edges')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error updating edge:', error);
    return { error };
  }
  return { data };
};

// Function to delete an edge
export const deleteEdge = async (id: string) => {
  const { error } = await supabase.from('edges').delete().eq('id', id);
  if (error) {
    console.error('Error deleting edge:', error);
    return { error };
  }
  return { success: true };
};

// Function to fetch the canvas state
export const fetchCanvas = async (canvasId: string) => {
  const { data, error } = await supabase
    .from('canvases')
    .select('nodes, edges')
    .eq('id', canvasId)
    .single();
  if (error) {
    console.error('Error fetching canvas:', error);
    return { error };
  }
  return { data };
};

// Function to attach a file to a node
export const attachFileToNode = async (nodeId: string, file: File) => {
  const { data, error } = await supabase
    .from('files')
    .insert([
      {
        file_data: file.name,
        file_type: file.type,
        file_url: file.name,
        name: file.name
      }
    ])
    .single();
  if (error) {
    console.error('Error attaching file to node:', error);
    return { error };
  }
  return { data };
};

// Function to remove a file from a node
export const removeFileFromNode = async (nodeId: string, fileId: string) => {
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('node_id', nodeId)
    .eq('id', fileId);
  if (error) {
    console.error('Error removing file from node:', error);
    return { error };
  }
  return { success: true };
};

// Function to save the canvas state
export const saveCanvasState = async (
  canvasId: string,
  nodes: Database['public']['Tables']['nodes']['Row'][],
  edges: Database['public']['Tables']['edges']['Row'][]
) => {
  const { error } = await supabase
    .from('canvases')
    .update({ nodes, edges })
    .eq('id', canvasId);
  if (error) {
    console.error('Error saving canvas state:', error);
    return { error };
  }
  return { success: true };
};
