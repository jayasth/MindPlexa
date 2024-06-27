import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { useRouter } from 'next/navigation';
import { updateNode } from '@/utils/canvas/nodeEdgeDatabaseOperations';

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

    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('canvasDatabaseOperations: Error fetching canvas:', error);
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
  // First, remove all links to this canvas in node_canvas_link
  const { error: linkError } = await supabase
    .from('node_canvas_link')
    .delete()
    .eq('canvas_id', canvasId);

  if (linkError) {
    console.error(
      'CanvasDatabaseOperations: Error deleting canvas links:',
      linkError
    );
    return { error: linkError };
  }

  // Then, delete the canvas itself
  const { error } = await supabase.from('canvases').delete().eq('id', canvasId);

  if (error) {
    console.error('CanvasDatabaseOperations: Error deleting canvas:', error);
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
  const client = supabase;

  try {
    // Fetch linked nodes
    const { data: linkedNodes, error: linkError } = await client
      .from('node_canvas_link')
      .select('node_id')
      .eq('canvas_id', canvasId);

    if (linkError) {
      throw linkError;
    }

    const nodeIds = linkedNodes.map((link) => link.node_id);

    // Filter out shared nodes
    const { data: sharedNodes, error: sharedError } = await client
      .from('node_canvas_link')
      .select('node_id')
      .in('node_id', nodeIds)
      .neq('canvas_id', canvasId);

    if (sharedError) {
      throw sharedError;
    }

    const sharedNodeIds = sharedNodes.map((node) => node.node_id);
    const nonSharedNodeIds = nodeIds.filter(
      (nodeId) => !sharedNodeIds.includes(nodeId)
    );

    // Delete non-shared nodes from specific node tables
    for (const nodeId of nonSharedNodeIds) {
      const { data: nodeData, error: nodeError } = await client
        .from('common_node_properties')
        .select('type')
        .eq('id', nodeId)
        .single();

      if (nodeError) {
        throw nodeError;
      }

      const nodeType = nodeData.type;
      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];
      const { error: deleteError } = await client
        .from(tableName)
        .delete()
        .eq('common_node_id', nodeId);

      if (deleteError) {
        throw deleteError;
      }

      // Delete the common node properties
      const { error: commonError } = await client
        .from('common_node_properties')
        .delete()
        .eq('id', nodeId);

      if (commonError) {
        throw commonError;
      }
    }

    // Remove links from node_canvas_link
    const { error: linkDeleteError } = await client
      .from('node_canvas_link')
      .delete()
      .eq('canvas_id', canvasId);

    if (linkDeleteError) {
      throw linkDeleteError;
    }

    // Finally, delete the canvas itself
    const { error: canvasError } = await client
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
    console.error('Error during canvas and node deletion:', error);
    return { error };
  }
};

// Function to save the canvas state
export const saveCanvasState = async (
  canvasId: string,
  nodes: (Database['public']['Tables']['common_node_properties']['Insert'] & {
    type: string;
    uniqueData?: any;
  })[],
  edges: Database['public']['Tables']['edges']['Insert'][]
) => {
  try {
    // Upsert nodes
    for (const node of nodes) {
      const { id, type, uniqueData, ...commonProperties } = node;
      console.log('canvasDatabaseOperations: Node properties before upsert:', {
        id,
        type,
        uniqueData,
        ...commonProperties
      });
      const { error: updateNodeError } = await updateNode(
        id!,
        commonProperties,
        uniqueData,
        type as 'note' | 'task' | 'table' | 'calendar' | 'draw'
      );

      if (updateNodeError) {
        return { error: updateNodeError };
      }
    }

    // Upsert edges
    const { error: createEdgesError } = await supabase
      .from('edges')
      .upsert(edges);

    if (createEdgesError) {
      return { error: createEdgesError };
    }

    // Link nodes to the canvas if not already linked
    const existingLinks = await supabase
      .from('node_canvas_link')
      .select('node_id')
      .eq('canvas_id', canvasId);

    const existingNodeIds = new Set(
      existingLinks.data ? existingLinks.data.map((link) => link.node_id) : []
    );
    const newLinks = nodes
      .filter((node) => node.id !== undefined && !existingNodeIds.has(node.id))
      .map((node) => ({
        node_id: node.id!,
        canvas_id: canvasId
      }));

    if (newLinks.length > 0) {
      const { error: linkError } = await supabase
        .from('node_canvas_link')
        .insert(newLinks);

      if (linkError) {
        return { error: linkError };
      }
    }

    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Function to fetch the canvas state
export const fetchCanvas = async (
  canvasId: string
): Promise<{ data?: any; error?: any; nodeData?: Record<string, any[]> }> => {
  // Fetch canvas data along with linked nodes and edges
  const { data, error } = await supabase
    .from('canvases')
    .select(
      `
      *,
      node_canvas_link!inner(common_node_properties(*)),
      edges(*)
    `
    )
    .eq('id', canvasId);

  if (error) {
    return { error };
  }

  if (data.length === 0) {
    return { data: null };
  }

  const canvas = data[0];
  const commonNodeIds = canvas.node_canvas_link
    .map((link) => link.common_node_properties?.id)
    .filter(Boolean);

  // Fetch specific node data for each node type
  const nodeTypes = ['note', 'task', 'table', 'calendar', 'draw'] as const;
  const nodeDataPromises = nodeTypes.map((type) =>
    supabase
      .from(`${type}_nodes` as keyof Database['public']['Tables'])
      .select('*')
      .in('common_node_id', commonNodeIds)
  );

  const nodeDataResults = await Promise.all(nodeDataPromises);
  const nodeData = nodeDataResults.reduce(
    (acc, result, index) => {
      if (!result.error) {
        acc[nodeTypes[index]] = result.data;
      }
      return acc;
    },
    {} as Record<string, any[]>
  );
  console.log('canvasDatabaseOperations: Complete node data fetched:', {
    canvas,
    commonNodeProperties: canvas.node_canvas_link
      .map((link) => {
        if (link.common_node_properties) {
          return {
            id: link.common_node_properties.id,
            type: link.common_node_properties.type,
            position: link.common_node_properties.position,
            view_width: link.common_node_properties.view_width,
            view_height: link.common_node_properties.view_height,
            edit_width: link.common_node_properties.edit_width,
            edit_height: link.common_node_properties.edit_height,
            background_color: link.common_node_properties.background_color,
            text_color: link.common_node_properties.text_color,
            title: link.common_node_properties.title,
            tags: link.common_node_properties.tags,
            attached_files: link.common_node_properties.attached_files,
            is_editing: link.common_node_properties.is_editing,
            is_temporary: link.common_node_properties.is_temporary,
            parent_node_id: link.common_node_properties.parent_node_id,
            z_index: link.common_node_properties.z_index,
            created_at: link.common_node_properties.created_at,
            updated_at: link.common_node_properties.updated_at,
            connectable: link.common_node_properties.connectable,
            draggable: link.common_node_properties.draggable
          };
        }
        return null;
      })
      .filter((props): props is NonNullable<typeof props> => props !== null),
    nodeData
  }); // Logging all node data including all fields from common_node_properties
  return { data: canvas, nodeData };
};
