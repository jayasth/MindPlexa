import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

/* node related functions */

// Function to insert a new node
export const createNode = async (
  canvasId: string,
  nodeType: Database['public']['Enums']['node_type'],
  position: { x: number; y: number },
  data: Database['public']['Tables']['nodes']['Insert'] & {
    noteData?: Database['public']['Tables']['note_nodes']['Insert'];
    taskData?: Database['public']['Tables']['task_nodes']['Insert'];
    calendarData?: Database['public']['Tables']['calendar_nodes']['Insert'];
    tableData?: Database['public']['Tables']['table_nodes']['Insert'];
    drawData?: Database['public']['Tables']['draw_nodes']['Insert'];
  }
): Promise<{ data?: any; error?: any }> => {
  console.log('nodeEdgeDatabaseOperations: createNode called with:', {
    canvasId,
    nodeType,
    position,
    data
  });
  try {
    // Use the provided ID instead of generating a new one
    const nodeId = data.id || uuidv4();

    // Get default dimensions from nodeProperties
    const defaultDimensions = nodeDimensions[nodeType];

    if (!defaultDimensions) {
      throw new Error(`Unsupported node type: ${nodeType}`);
    }

    // Create a node
    const nodeInsert: Database['public']['Tables']['nodes']['Insert'] = {
      id: nodeId,
      type: nodeType,
      position: position,
      view_width: defaultDimensions.viewWidth,
      view_height: defaultDimensions.viewHeight,
      edit_width:
        'editWidth' in defaultDimensions ? defaultDimensions.editWidth : null,
      edit_height:
        'editHeight' in defaultDimensions ? defaultDimensions.editHeight : null,
      mobile_edit_width:
        'mobileEditWidth' in defaultDimensions
          ? defaultDimensions.mobileEditWidth
          : null,
      mobile_edit_height:
        'mobileEditHeight' in defaultDimensions
          ? defaultDimensions.mobileEditHeight
          : null,
      background_color: data.background_color || '#F4F4F4',
      text_color: data.text_color || '#575757',
      title: data.title,
      is_editing: data.is_editing || false,
      is_temporary: data.is_temporary || false,
      parent_node_id: data.parent_node_id || null,
      z_index: data.z_index || 0
    };

    const { data: nodeData, error: nodeError } = await supabase
      .from('nodes')
      .insert([nodeInsert])
      .select()
      .single();

    if (nodeError) {
      console.error('Error inserting node:', nodeError);
      return { error: nodeError };
    }

    console.log('nodeEdgeDatabaseOperations: Node created:', nodeData);

    // Link node to canvas
    const { error: linkError } = await supabase
      .from('node_canvas_link')
      .insert({ node_id: nodeId, canvas_id: canvasId });

    if (linkError) {
      console.error('Error linking node to canvas:', linkError);
      return { error: linkError };
    }

    console.log('nodeEdgeDatabaseOperations: Node linked to canvas:', {
      node_id: nodeId,
      canvas_id: canvasId
    });

    // Create the specific node type
    if (nodeType !== 'selection_menu') {
      let specificNodeInsert;

      switch (nodeType) {
        case 'note':
          specificNodeInsert = {
            id: uuidv4(),
            node_id: nodeId,
            ...data.noteData
          };
          break;
        case 'task':
          specificNodeInsert = {
            id: uuidv4(),
            node_id: nodeId,
            ...data.taskData
          };
          break;
        case 'calendar':
          specificNodeInsert = {
            id: uuidv4(),
            node_id: nodeId,
            ...data.calendarData
          };
          break;
        case 'table':
          specificNodeInsert = {
            id: uuidv4(),
            node_id: nodeId,
            ...data.tableData
          };
          break;
        case 'draw':
          specificNodeInsert = {
            id: uuidv4(),
            node_id: nodeId,
            ...data.drawData
          };
          break;
        default:
          throw new Error(`Unsupported node type: ${nodeType}`);
      }

      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];

      const { data: specificNodeData, error: specificNodeError } =
        await supabase
          .from(tableName)
          .insert([specificNodeInsert])
          .select()
          .single();

      if (specificNodeError) {
        console.error(`Error inserting ${nodeType} node:`, specificNodeError);
        return { error: specificNodeError };
      }

      console.log(
        `nodeEdgeDatabaseOperations: ${nodeType} node created:`,
        specificNodeData
      );

      return {
        data: {
          ...nodeData,
          ...specificNodeData,
          id: nodeId,
          nodeId: nodeId
        }
      };
    } else {
      return {
        data: {
          ...nodeData,
          id: nodeId,
          nodeId: nodeId
        }
      };
    }
  } catch (error) {
    console.error('Unexpected error creating node:', error);
    return { error };
  }
};

export const updateNode = async (
  id: string,
  updates: Partial<Database['public']['Tables']['nodes']['Update']>,
  specificUpdates: Partial<
    | Database['public']['Tables']['note_nodes']['Update']
    | Database['public']['Tables']['task_nodes']['Update']
    | Database['public']['Tables']['calendar_nodes']['Update']
    | Database['public']['Tables']['table_nodes']['Update']
    | Database['public']['Tables']['draw_nodes']['Update']
  >,
  nodeType: Database['public']['Enums']['node_type']
): Promise<{ data?: any; error?: any }> => {
  try {
    console.log(
      'nodeEdgeDatabaseOperations: Updating node with the following details:'
    );
    console.log('Node ID:', id);
    console.log('Node Type:', nodeType);
    console.log('Node Updates:', JSON.stringify(updates, null, 2));
    console.log('Specific Updates:', JSON.stringify(specificUpdates, null, 2));

    // Get default dimensions from nodeProperties
    const defaultDimensions = nodeDimensions[nodeType];

    // Ensure we're not updating view dimensions
    const safeUpdates: Partial<
      Database['public']['Tables']['nodes']['Update']
    > = { ...updates };
    delete safeUpdates.view_width;
    delete safeUpdates.view_height;

    // Only update edit dimensions if they're different from the defaults
    if (
      safeUpdates.edit_width &&
      safeUpdates.edit_width === defaultDimensions.editWidth
    ) {
      delete safeUpdates.edit_width;
    }
    if (
      safeUpdates.edit_height &&
      safeUpdates.edit_height === defaultDimensions.editHeight
    ) {
      delete safeUpdates.edit_height;
    }

    // Ensure position is stored as JSONB
    if (safeUpdates.position && typeof safeUpdates.position === 'object') {
      safeUpdates.position = JSON.stringify(safeUpdates.position);
    }

    // Update node properties
    const { data: nodeData, error: nodeError } = await supabase
      .from('nodes')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (nodeError) {
      console.error(
        'nodeEdgeDatabaseOperations: Error updating node properties:',
        nodeError
      );
      return { error: nodeError };
    }

    console.log(
      'nodeEdgeDatabaseOperations: Node properties updated successfully:',
      nodeData
    );

    // Update specific node properties if not a selection_menu node
    if (nodeType !== 'selection_menu') {
      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];

      // Ensure specific updates match the table structure
      const safeSpecificUpdates: any = { ...specificUpdates };

      if (nodeType === 'note' && 'content' in safeSpecificUpdates) {
        safeSpecificUpdates.content = String(safeSpecificUpdates.content);
      } else if (nodeType === 'task' && 'tasks' in safeSpecificUpdates) {
        safeSpecificUpdates.tasks = JSON.stringify(safeSpecificUpdates.tasks);
      } else if (nodeType === 'calendar' && 'events' in safeSpecificUpdates) {
        safeSpecificUpdates.events = JSON.stringify(safeSpecificUpdates.events);
      } else if (nodeType === 'table') {
        if ('columns' in safeSpecificUpdates) {
          safeSpecificUpdates.columns = JSON.stringify(
            safeSpecificUpdates.columns
          );
        }
        if ('rows' in safeSpecificUpdates) {
          safeSpecificUpdates.rows = JSON.stringify(safeSpecificUpdates.rows);
        }
      } else if (nodeType === 'draw' && 'drawing_data' in safeSpecificUpdates) {
        safeSpecificUpdates.drawing_data = String(
          safeSpecificUpdates.drawing_data
        );
      }

      const { data: specificNodeData, error: specificNodeError } =
        await supabase
          .from(tableName)
          .update(safeSpecificUpdates)
          .eq('node_id', id)
          .select()
          .single();

      if (specificNodeError) {
        console.error(
          `nodeEdgeDatabaseOperations: Error updating ${nodeType} node:`,
          specificNodeError
        );
        return { error: specificNodeError };
      }

      console.log(
        `nodeEdgeDatabaseOperations: ${nodeType} node updated successfully:`,
        specificNodeData
      );

      return { data: { ...nodeData, ...specificNodeData } };
    }

    return { data: nodeData };
  } catch (error) {
    console.error(
      'nodeEdgeDatabaseOperations: Unexpected error updating node:',
      error
    );
    return { error };
  }
};

// Function to delete a node, updated to handle node_canvas_link and specific node tables
export const deleteNode = async (
  nodeId: string,
  nodeType: Database['public']['Enums']['node_type']
): Promise<{ success?: boolean; error?: any }> => {
  try {
    // Delete the specific node type
    if (nodeType !== 'selection_menu') {
      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];
      const { error: specificError } = await supabase
        .from(tableName)
        .delete()
        .eq('node_id', nodeId);

      if (specificError) {
        console.error(`Error deleting ${nodeType} node:`, specificError);
        return { error: specificError };
      }
    }

    // Delete the node
    const { error: nodeError } = await supabase
      .from('nodes')
      .delete()
      .eq('id', nodeId);

    if (nodeError) {
      console.error('Error deleting node:', nodeError);
      return { error: nodeError };
    }

    // Remove links from node_canvas_link
    const { error: linkError } = await supabase
      .from('node_canvas_link')
      .delete()
      .eq('node_id', nodeId);

    if (linkError) {
      console.error('Error deleting node links:', linkError);
      return { error: linkError };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting node:', error);
    return { error };
  }
};

/* edge related functions */

// Function to insert a new edge
export const createEdge = async (
  edge: Omit<Database['public']['Tables']['edges']['Insert'], 'id'>
): Promise<{ data?: { id: string }; error?: any }> => {
  const edgeWithId = { ...edge, id: uuidv4() };
  const { data, error } = await supabase
    .from('edges')
    .insert([edgeWithId])
    .select()
    .single();
  if (error) {
    console.error('nodeEdgeDatabaseOperations: Error inserting edge:', error);
    return { error };
  }
  return { data: { id: data.id } };
};

// Function to update an existing edge
export const updateEdge = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
): Promise<{ data?: any; error?: any }> => {
  const { data, error } = await supabase
    .from('edges')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('nodeEdgeDatabaseOperations: Error updating edge:', error);
    return { error };
  }
  return { data };
};

// Function to delete an edge
export const deleteEdge = async (
  id: string
): Promise<{ success?: boolean; error?: any }> => {
  const { error } = await supabase.from('edges').delete().eq('id', id);
  if (error) {
    console.error('nodeEdgeDatabaseOperations: Error deleting edge:', error);
    return { error };
  }
  return { success: true };
};
