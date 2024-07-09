import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

/* Edge related functions */

const insertEdge = async (
  edge: Database['public']['Tables']['edges']['Insert']
) => {
  return await supabase.from('edges').insert([edge]).select().single();
};

const updateEdgeInTable = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
) => {
  return await supabase
    .from('edges')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
};

const deleteEdgeFromTable = async (id: string) => {
  return await supabase.from('edges').delete().eq('id', id);
};

export const createEdge = async (
  edge: Omit<Database['public']['Tables']['edges']['Insert'], 'id'>
): Promise<{ data?: { id: string }; error?: any }> => {
  console.log('NodeEdgeService: Creating edge:', edge);

  const edgeWithId = { ...edge, id: uuidv4() };
  const { data, error } = await insertEdge(edgeWithId);

  if (error) {
    console.error('NodeEdgeService: Error inserting edge:', error);
    return { error };
  }

  console.log('NodeEdgeService: Edge created:', data);
  return { data: { id: data.id } };
};

export const createEdgeBetweenNodes = async (
  sourceNodeId: string,
  targetNodeId: string,
  canvasId: string
): Promise<{ data?: { id: string }; error?: any }> => {
  console.log('NodeEdgeService: Creating edge between nodes:', {
    sourceNodeId,
    targetNodeId,
    canvasId
  });

  const newEdge: Omit<Database['public']['Tables']['edges']['Insert'], 'id'> = {
    source_node_id: sourceNodeId,
    target_node_id: targetNodeId,
    canvas_id: canvasId
  };

  return await createEdge(newEdge);
};

export const updateEdge = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
): Promise<{ data?: any; error?: any }> => {
  console.log('NodeEdgeService: Updating edge:', { id, updates });

  const { data, error } = await updateEdgeInTable(id, updates);

  if (error) {
    console.error('NodeEdgeService: Error updating edge:', error);
    return { error };
  }

  console.log('NodeEdgeService: Edge updated:', data);
  return { data };
};

export const deleteEdge = async (
  id: string
): Promise<{ success?: boolean; error?: any }> => {
  console.log('NodeEdgeService: Deleting edge:', id);

  const { error } = await deleteEdgeFromTable(id);

  if (error) {
    console.error('NodeEdgeService: Error deleting edge:', error);
    return { error };
  }

  console.log('NodeEdgeService: Edge deleted successfully');
  return { success: true };
};
