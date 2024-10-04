import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

const supabase = createClient();

/* Edge related functions */

const updateEdgeInTable = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
) => {
  return await supabase
    .from('edges')
    .update(
      toSnakeCase(updates) as Database['public']['Tables']['edges']['Update']
    )
    .eq('id', id)
    .select()
    .single()
    .then(({ data, error }) => ({
      data: data
        ? (toCamelCase(data) as Database['public']['Tables']['edges']['Row'])
        : undefined,
      error
    }));
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
}): Promise<{ data?: { id: string }; error?: Error }> => {
  try {
    const { data, error } = await supabase
      .from('edges')
      .insert({
        id: uuidv4(), // Ensure UUID is generated
        source_node_id: sourceNodeId,
        target_node_id: targetNodeId,
        canvas_id: canvasId
      })
      .select()
      .single();

    if (error) throw error;

    return { data: { id: data.id }, error: undefined };
  } catch (error) {
    console.error('Error creating edge:', error);
    return {
      data: undefined,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
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
}): Promise<{ data?: { id: string }; error?: Error }> => {
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
): Promise<{
  data?: Database['public']['Tables']['edges']['Row'];
  error?: Error;
}> => {
  console.log('edgeService: Updating edge:', { id, updates });

  const { data, error } = await updateEdgeInTable(id, updates);

  if (error) {
    console.error('edgeService: Error updating edge:', error);
    return { error: new Error(error.message) };
  }

  console.log('edgeService: Edge updated:', data);
  return { data };
};

export const deleteEdge = async (
  id: string
): Promise<{ success?: boolean; error?: Error }> => {
  console.log('edgeService: Deleting edge:', id);

  const { error } = await deleteEdgeFromTable(id);

  if (error) {
    console.error('edgeService: Error deleting edge:', error);
    return { error: new Error(error.message) };
  }

  console.log('edgeService: Edge deleted successfully');
  return { success: true };
};

export const createBulkEdges = async (
  canvasId: string,
  edges: Array<{
    source: string;
    target: string;
  }>
): Promise<{
  data?: Database['public']['Tables']['edges']['Row'][];
  error?: Error;
}> => {
  const createdEdges: Database['public']['Tables']['edges']['Row'][] = [];

  for (const edge of edges) {
    const { data, error } = await supabase
      .from('edges')
      .insert({
        id: uuidv4(),
        canvas_id: canvasId,
        source_node_id: edge.source,
        target_node_id: edge.target
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating edge:', error);
      return { error: new Error(error.message) };
    } else if (data) {
      createdEdges.push(data as Database['public']['Tables']['edges']['Row']);
    }
  }

  return { data: createdEdges };
};
