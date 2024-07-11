import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

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
    await upsertNodes(canvasId, nodes);
    await upsertEdges(canvasId, edges);

    console.log('canvasService: Complete canvas state saved:', {
      canvasId,
      nodesCount: nodes.length,
      edgesCount: edges.length
    });

    return { success: true };
  } catch (error) {
    console.error('canvasService: Error in saveCanvasState:', error);
    return { error };
  }
};

// Function to fetch the canvas state
export const fetchCanvas = async (
  canvasId: string
): Promise<{ data?: any; error?: any; nodeData?: Record<string, any[]> }> => {
  try {
    const { data, error } = await supabase
      .from('canvases')
      .select(
        `
        *,
        node_canvas_link!inner(nodes(*)),
        edges(*)
      `
      )
      .eq('id', canvasId)
      .then(({ data, error }) => ({ data: toCamelCase(data), error }));

    if (error) {
      return { error };
    }

    if (!data || data.length === 0) {
      return { data: null };
    }

    const canvas = data[0];
    const nodeIds = canvas.node_canvas_link
      ? canvas.node_canvas_link.map((link) => link.nodes?.id).filter(Boolean)
      : [];

    const nodeData = await fetchSpecificNodeData(nodeIds as string[]);

    const nodes = canvas.node_canvas_link
      ? canvas.node_canvas_link
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
          .filter((node): node is NonNullable<typeof node> => node !== null)
      : [];

    console.log('canvasService: Complete canvas state fetched:', {
      canvas,
      nodes,
      edges: canvas.edges
    });

    return { data: { ...canvas, nodes }, nodeData };
  } catch (error) {
    console.error('canvasService: Error in fetchCanvas:', error);
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

const upsertNodes = async (
  canvasId: string,
  nodes: (Database['public']['Tables']['nodes']['Insert'] & {
    type: string;
    noteData?: Database['public']['Tables']['note_nodes']['Insert'];
    taskData?: Database['public']['Tables']['task_nodes']['Insert'];
    calendarData?: Database['public']['Tables']['calendar_nodes']['Insert'];
    tableData?: Database['public']['Tables']['table_nodes']['Insert'];
    drawData?: Database['public']['Tables']['draw_nodes']['Insert'];
  })[]
) => {
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
      console.error('canvasService: Node ID is undefined');
      continue;
    }

    // Ensure view dimensions are not updated
    const { view_width, view_height, ...updatableProperties } = nodeProperties;

    const { error: nodeUpsertError } = await supabase
      .from('nodes')
      .upsert(toSnakeCase({ id, type, ...updatableProperties }));

    if (nodeUpsertError) {
      console.error('canvasService: Error upserting node:', nodeUpsertError);
      throw nodeUpsertError;
    }

    if (type !== 'selection_menu') {
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
        default:
          console.error('canvasService: Unknown node type:', type);
          continue;
      }

      if (tableName && specificData) {
        const { data: existingData, error: fetchError } = await supabase
          .from(tableName)
          .select('id')
          .eq('node_id', id)
          .single()
          .then(({ data, error }) => ({ data: toCamelCase(data), error }));

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error(
            `canvasService: Error fetching existing ${type} node:`,
            fetchError
          );
          throw fetchError;
        }

        const upsertData = existingData
          ? { id: existingData.id, node_id: id, ...specificData }
          : { id: uuidv4(), node_id: id, ...specificData };

        const { error: specificNodeUpsertError } = await supabase
          .from(tableName)
          .upsert(toSnakeCase(upsertData));

        if (specificNodeUpsertError) {
          console.error(
            `canvasService: Error upserting ${type} node:`,
            specificNodeUpsertError
          );
          throw specificNodeUpsertError;
        }
      }
    }

    const { error: linkUpsertError } = await supabase
      .from('node_canvas_link')
      .upsert(toSnakeCase({ node_id: id, canvas_id: canvasId }));

    if (linkUpsertError) {
      console.error(
        'canvasService: Error upserting node_canvas_link:',
        linkUpsertError
      );
      throw linkUpsertError;
    }
  }
};

const upsertEdges = async (
  canvasId: string,
  edges: Database['public']['Tables']['edges']['Insert'][]
) => {
  const { error: edgesUpsertError } = await supabase
    .from('edges')
    .upsert(
      edges.map((edge) =>
        toSnakeCase({ id: edge.id || uuidv4(), ...edge, canvas_id: canvasId })
      )
    );

  if (edgesUpsertError) {
    console.error('canvasService: Error upserting edges:', edgesUpsertError);
    throw edgesUpsertError;
  }
};

const fetchSpecificNodeData = async (nodeIds: string[]) => {
  const nodeTypes = ['note', 'task', 'table', 'calendar', 'draw'] as const;
  const nodeDataPromises = nodeTypes.map((type) =>
    supabase
      .from(`${type}_nodes` as keyof Database['public']['Tables'])
      .select('*')
      .in('node_id', nodeIds)
      .then(({ data, error }) => ({ data: toCamelCase(data), error }))
  );

  const nodeDataResults = await Promise.all(nodeDataPromises);
  return nodeDataResults.reduce(
    (acc, result, index) => {
      if (!result.error) {
        acc[nodeTypes[index]] = result.data;
      }
      return acc;
    },
    {} as Record<string, any[]>
  );
};
