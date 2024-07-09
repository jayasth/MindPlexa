import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

const supabase = createClient();

/* Edge related functions */

const insertEdge = async (
  edge: Database['public']['Tables']['edges']['Insert']
) => {
  return await supabase
    .from('edges')
    .insert([toSnakeCase(edge)])
    .select()
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
};

const updateEdgeInTable = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
) => {
  return await supabase
    .from('edges')
    .update(toSnakeCase(updates))
    .eq('id', id)
    .select()
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
};

const deleteEdgeFromTable = async (id: string) => {
  return await supabase.from('edges').delete().eq('id', id);
};

export const createEdge = async ({
  sourceNodeId,
  targetNodeId,
  canvasId
}: {
  sourceNodeId: string;
  targetNodeId: string;
  canvasId: string;
}): Promise<{ data?: { id: string }; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('edges')
      .insert({
        source_node_id: sourceNodeId,
        target_node_id: targetNodeId,
        canvas_id: canvasId
      })
      .select()
      .single();

    if (error) throw error;

    return { data: { id: data.id }, error: null };
  } catch (error) {
    console.error('Error creating edge:', error);
    return { data: undefined, error };
  }
};

export const createEdgeBetweenNodes = async ({
  sourceNodeId,
  targetNodeId,
  canvasId
}: {
  sourceNodeId: string;
  targetNodeId: string;
  canvasId: string;
}): Promise<{ data?: { id: string }; error?: any }> => {
  console.log('edgeService: Creating edge between nodes:', {
    sourceNodeId,
    targetNodeId,
    canvasId
  });

  return await createEdge({
    sourceNodeId,
    targetNodeId,
    canvasId
  });
};

export const updateEdge = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
): Promise<{ data?: any; error?: any }> => {
  console.log('edgeService: Updating edge:', { id, updates });

  const { data, error } = await updateEdgeInTable(id, updates);

  if (error) {
    console.error('edgeService: Error updating edge:', error);
    return { error };
  }

  console.log('edgeService: Edge updated:', data);
  return { data };
};

export const deleteEdge = async (
  id: string
): Promise<{ success?: boolean; error?: any }> => {
  console.log('edgeService: Deleting edge:', id);

  const { error } = await deleteEdgeFromTable(id);

  if (error) {
    console.error('edgeService: Error deleting edge:', error);
    return { error };
  }

  console.log('edgeService: Edge deleted successfully');
  return { success: true };
};
