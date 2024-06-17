import { createClient } from '@/utils/supabase/supabaseClient';
import { Node, Edge } from 'reactflow';

const supabase = createClient();

// Fetch a single canvas and its associated nodes and edges
export const fetchCanvas = async (
  canvasId: string
): Promise<{ data: { nodes: Node[]; edges: Edge[] } | null; error: any }> => {
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
    console.error('Error fetching canvas:', error);
    return { data: null, error };
  }
  return {
    data: data
      ? {
          nodes: data.nodes.map((node: any) => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data
          })),
          edges: data.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            data: edge.data
          }))
        }
      : null,
    error: null
  };
};

// Insert a new node
export const insertNode = async (
  node: Node
): Promise<{ data: Node | null; error: any }> => {
  const { data, error } = await supabase.from('nodes').insert([
    {
      id: node.id,
      type: node.type as string,
      position: JSON.stringify(node.position),
      data: node.data
    }
  ]);
  return { data: data ? data[0] : null, error };
};

export const updateNode = async (
  nodeId: string,
  updates: Partial<Node>
): Promise<{ data: Node | null; error: any }> => {
  const { data, error } = await supabase
    .from('nodes')
    .update({
      ...updates,
      position: updates.position ? JSON.stringify(updates.position) : undefined
    })
    .eq('id', nodeId);
  return { data: data ? data[0] : null, error };
};

// Delete a node
export const deleteNode = async (
  nodeId: string
): Promise<{ data: Node | null; error: any }> => {
  const { data, error } = await supabase
    .from('nodes')
    .delete()
    .eq('id', nodeId);
  return { data: data ? data[0] : null, error };
};

// Insert a new edge
export const insertEdge = async (
  edge: Edge
): Promise<{ data: Edge | null; error: any }> => {
  const { data, error } = await supabase.from('edges').insert([edge]);
  return { data: data ? data[0] : null, error };
};

// Update an edge
export const updateEdge = async (
  edgeId: string,
  updates: Partial<Edge>
): Promise<{ data: Edge | null; error: any }> => {
  const { data, error } = await supabase
    .from('edges')
    .update(updates)
    .eq('id', edgeId);
  return { data: data ? data[0] : null, error };
};

// Delete an edge
export const deleteEdge = async (
  edgeId: string
): Promise<{ data: Edge | null; error: any }> => {
  const { data, error } = await supabase
    .from('edges')
    .delete()
    .eq('id', edgeId);
  return { data: data ? data[0] : null, error };
};

// Save the entire state of a canvas, including nodes and edges
export const saveCanvasState = async (
  canvasId: string,
  { nodes, edges }: { nodes: Node[]; edges: Edge[] }
): Promise<{ data: string | null; error: any }> => {
  try {
    // Handle nodes
    const nodePromises = nodes.map((node) => {
      if (node.id.startsWith('new-')) {
        return supabase.from('nodes').insert([
          {
            ...node,
            canvas_id: canvasId,
            type: node.type || 'default', // Ensure 'type' is provided
            position: JSON.stringify(node.position) // Convert position to JSON
          }
        ]);
      } else {
        return supabase
          .from('nodes')
          .update({
            ...node,
            position: JSON.stringify(node.position) // Convert position to JSON
          })
          .eq('id', node.id);
      }
    });

    // Handle edges
    const edgePromises = edges.map((edge) => {
      if (edge.id.startsWith('new-')) {
        return supabase
          .from('edges')
          .insert([{ ...edge, canvas_id: canvasId }]);
      } else {
        return supabase.from('edges').update(edge).eq('id', edge.id);
      }
    });

    // Execute all promises
    const results = await Promise.all([...nodePromises, ...edgePromises]);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      throw new Error('Errors occurred while saving canvas state.');
    }

    return { data: 'Canvas state saved successfully', error: null };
  } catch (error) {
    return { data: null, error };
  }
};
