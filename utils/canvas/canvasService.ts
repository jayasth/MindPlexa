import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

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
      .insert({ id: uuidv4(), name: canvasTitle });

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
        .from('nodes')
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
        .eq('node_id', nodeId);

      if (deleteError) {
        throw deleteError;
      }

      // Delete the node
      const { error: nodeDeleteError } = await client
        .from('nodes')
        .delete()
        .eq('id', nodeId);

      if (nodeDeleteError) {
        throw nodeDeleteError;
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
  nodes: (Database['public']['Tables']['nodes']['Insert'] & {
    type: string;
    noteData?: Database['public']['Tables']['note_nodes']['Insert'];
    taskData?: Database['public']['Tables']['task_nodes']['Insert'];
    calendarData?: Database['public']['Tables']['calendar_nodes']['Insert'];
    tableData?: Database['public']['Tables']['table_nodes']['Insert'];
    drawData?: Database['public']['Tables']['draw_nodes']['Insert'];
  })[],
  edges: Database['public']['Tables']['edges']['Insert'][]
) => {
  try {
    // Upsert nodes
    for (const node of nodes) {
      const {
        id,
        type,
        noteData,
        taskData,
        calendarData,
        tableData,
        drawData,
        ...nodeProperties
      } = node;

      if (!id) {
        console.error('Node ID is undefined');
        continue;
      }

      // Upsert node properties in 'nodes' table
      const { error: nodeUpsertError } = await supabase
        .from('nodes')
        .upsert({ id, type, ...nodeProperties });

      if (nodeUpsertError) {
        console.error('Error upserting node:', nodeUpsertError);
        return { error: nodeUpsertError };
      }

      // Upsert specific node data based on type
      let specificData;
      let tableName;
      switch (type) {
        case 'note':
          specificData = noteData;
          tableName = 'note_nodes';
          break;
        case 'task':
          specificData = taskData;
          tableName = 'task_nodes';
          break;
        case 'calendar':
          specificData = calendarData;
          tableName = 'calendar_nodes';
          break;
        case 'table':
          specificData = tableData;
          tableName = 'table_nodes';
          break;
        case 'draw':
          specificData = drawData;
          tableName = 'draw_nodes';
          break;
        case 'selection_menu':
          // No specific data for selection_menu
          break;
        default:
          console.error('Unknown node type:', type);
          continue;
      }

      if (tableName && specificData) {
        const { data: existingData, error: fetchError } = await supabase
          .from(tableName)
          .select('id')
          .eq('node_id', id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error(`Error fetching existing ${type} node:`, fetchError);
          return { error: fetchError };
        }

        const upsertData = existingData
          ? { id: existingData.id, node_id: id, ...specificData }
          : { id: uuidv4(), node_id: id, ...specificData };

        const { error: specificNodeUpsertError } = await supabase
          .from(tableName)
          .upsert(upsertData);

        if (specificNodeUpsertError) {
          console.error(
            `Error upserting ${type} node:`,
            specificNodeUpsertError
          );
          return { error: specificNodeUpsertError };
        }
      }

      // Upsert node_canvas_link
      const { error: linkUpsertError } = await supabase
        .from('node_canvas_link')
        .upsert({ node_id: id, canvas_id: canvasId });

      if (linkUpsertError) {
        console.error('Error upserting node_canvas_link:', linkUpsertError);
        return { error: linkUpsertError };
      }
    }

    // Upsert edges
    const { error: edgesUpsertError } = await supabase
      .from('edges')
      .upsert(
        edges.map((edge) => ({ id: uuidv4(), ...edge, canvas_id: canvasId }))
      );

    if (edgesUpsertError) {
      console.error('Error upserting edges:', edgesUpsertError);
      return { error: edgesUpsertError };
    }

    console.log('canvasDatabaseOperations: Complete canvas state saved:', {
      canvasId,
      nodesCount: nodes.length,
      edgesCount: edges.length
    });

    return { success: true };
  } catch (error) {
    console.error('Error in saveCanvasState:', error);
    return { error };
  }
};

// Function to fetch the canvas state
export const fetchCanvas = async (
  canvasId: string
): Promise<{ data?: any; error?: any; nodeData?: Record<string, any[]> }> => {
  try {
    // Fetch canvas data along with linked nodes and edges
    const { data, error } = await supabase
      .from('canvases')
      .select(
        `
        *,
        node_canvas_link!inner(nodes(*)),
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
    const nodeIds = canvas.node_canvas_link
      .map((link) => link.nodes?.id)
      .filter(Boolean);

    // Fetch specific node data for each node type
    const nodeTypes = ['note', 'task', 'table', 'calendar', 'draw'] as const;
    const nodeDataPromises = nodeTypes.map((type) =>
      supabase
        .from(`${type}_nodes` as keyof Database['public']['Tables'])
        .select('*')
        .in('node_id', nodeIds)
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

    // Combine node data from 'nodes' table and specific node tables
    const nodes = canvas.node_canvas_link
      .map((link) => {
        if (link.nodes) {
          const specificNodeData = nodeData[
            link.nodes?.type as keyof typeof nodeData
          ]?.find((data) => data.node_id === link.nodes?.id);
          return {
            ...link.nodes,
            ...specificNodeData
          };
        }
        return null;
      })
      .filter((node): node is NonNullable<typeof node> => node !== null);

    console.log('canvasDatabaseOperations: Complete canvas state fetched:', {
      canvas,
      nodes,
      edges: canvas.edges
    });

    return { data: { ...canvas, nodes }, nodeData };
  } catch (error) {
    console.error('Error in fetchCanvas:', error);
    return { error };
  }
};
