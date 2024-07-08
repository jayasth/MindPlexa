import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

/* Node related functions */

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
  console.log('NodeEdgeDatabaseOperations: Creating node:', {
    canvasId,
    nodeType,
    position,
    data
  });

  const nodeId = data.id || uuidv4();
  const defaultDimensions = nodeDimensions[nodeType];

  if (!defaultDimensions) {
    console.warn(`Unsupported node type: ${nodeType}`);
    return { error: `Unsupported node type: ${nodeType}` };
  }

  const nodeInsert: Database['public']['Tables']['nodes']['Insert'] = {
    id: nodeId,
    type: nodeType,
    position: JSON.stringify(position),
    view_width:
      'viewWidth' in defaultDimensions
        ? defaultDimensions.viewWidth
        : defaultDimensions.width,
    view_height:
      'viewHeight' in defaultDimensions
        ? defaultDimensions.viewHeight
        : defaultDimensions.height,
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
    is_temporary:
      nodeType === 'selection_menu' ? true : data.is_temporary || false,
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

  console.log('Node created:', nodeData);

  const { error: linkError } = await supabase
    .from('node_canvas_link')
    .insert({ node_id: nodeId, canvas_id: canvasId });

  if (linkError) {
    console.error('Error linking node to canvas:', linkError);
    return { error: linkError };
  }

  console.log('Node linked to canvas:', {
    node_id: nodeId,
    canvas_id: canvasId
  });

  if (nodeType !== 'selection_menu') {
    const specificNodeInsert = {
      id: uuidv4(),
      node_id: nodeId,
      ...(data[`${nodeType}Data`] || {})
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

    console.log(`${nodeType} node created:`, specificNodeData);

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
  console.log('Updating node:', { id, nodeType, updates, specificUpdates });

  const defaultDimensions = nodeDimensions[nodeType];
  const safeUpdates: Partial<Database['public']['Tables']['nodes']['Update']> =
    { ...updates };

  // Handle dimensions
  if ('viewWidth' in defaultDimensions) {
    safeUpdates.view_width = defaultDimensions.viewWidth;
  }
  if ('viewHeight' in defaultDimensions) {
    safeUpdates.view_height = defaultDimensions.viewHeight;
  }
  if ('editWidth' in defaultDimensions) {
    safeUpdates.edit_width = defaultDimensions.editWidth;
  }
  if ('editHeight' in defaultDimensions) {
    safeUpdates.edit_height = defaultDimensions.editHeight;
  }
  if ('mobileEditWidth' in defaultDimensions) {
    safeUpdates.mobile_edit_width = defaultDimensions.mobileEditWidth;
  }
  if ('mobileEditHeight' in defaultDimensions) {
    safeUpdates.mobile_edit_height = defaultDimensions.mobileEditHeight;
  }

  // Handle position
  if (safeUpdates.position && typeof safeUpdates.position === 'object') {
    safeUpdates.position = JSON.stringify(safeUpdates.position);
  }

  // Update node in the nodes table
  const { data: nodeData, error: nodeError } = await supabase
    .from('nodes')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (nodeError) {
    console.error('Error updating node properties:', nodeError);
    return { error: nodeError };
  }

  console.log('Node properties updated:', nodeData);

  // Handle specific node type updates
  if (nodeType !== 'selection_menu') {
    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
    const safeSpecificUpdates: any = { ...specificUpdates };

    // Handle specific node type data
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

    // Check if the specific node already exists
    const { data: existingNode, error: existingNodeError } = await supabase
      .from(tableName)
      .select()
      .eq('node_id', id)
      .single();

    let specificNodeData;
    if (existingNode) {
      // Update existing specific node
      const { data, error: updateError } = await supabase
        .from(tableName)
        .update(safeSpecificUpdates)
        .eq('node_id', id)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating ${nodeType} node:`, updateError);
        return { error: updateError };
      }
      specificNodeData = data;
    } else {
      // Insert new specific node
      const { data, error: insertError } = await supabase
        .from(tableName)
        .insert({ node_id: id, ...safeSpecificUpdates })
        .select()
        .single();

      if (insertError) {
        console.error(`Error inserting ${nodeType} node:`, insertError);
        return { error: insertError };
      }
      specificNodeData = data;
    }

    console.log(`${nodeType} node updated:`, specificNodeData);

    return { data: { ...nodeData, ...specificNodeData } };
  }

  return { data: nodeData };
};
export const deleteNode = async (
  nodeId: string,
  nodeType: Database['public']['Enums']['node_type']
): Promise<{ success?: boolean; error?: any }> => {
  console.log('Deleting node:', { nodeId, nodeType });

  if (nodeType !== 'selection_menu') {
    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
    const { error: specificError } = await supabase
      .from(tableName)
      .delete()
      .eq('node_id', nodeId);

    if (specificError) {
      console.error(`Error deleting ${nodeType} node:`, specificError);
      return { error: specificError };
    }
  }

  const { error: nodeError } = await supabase
    .from('nodes')
    .delete()
    .eq('id', nodeId);

  if (nodeError) {
    console.error('Error deleting node:', nodeError);
    return { error: nodeError };
  }

  const { error: linkError } = await supabase
    .from('node_canvas_link')
    .delete()
    .eq('node_id', nodeId);

  if (linkError) {
    console.error('Error deleting node links:', linkError);
    return { error: linkError };
  }

  console.log('Node deleted successfully');
  return { success: true };
};

/* Edge related functions */

export const createEdge = async (
  edge: Omit<Database['public']['Tables']['edges']['Insert'], 'id'>
): Promise<{ data?: { id: string }; error?: any }> => {
  console.log('Creating edge:', edge);

  const edgeWithId = { ...edge, id: uuidv4() };
  const { data, error } = await supabase
    .from('edges')
    .insert([
      {
        id: edgeWithId.id,
        source_node_id: edgeWithId.source_node_id,
        target_node_id: edgeWithId.target_node_id,
        canvas_id: edgeWithId.canvas_id
        // Add any other fields that are in your edges table
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting edge:', error);
    return { error };
  }

  console.log('Edge created:', data);
  return { data: { id: data.id } };
};

export const updateEdge = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
): Promise<{ data?: any; error?: any }> => {
  console.log('Updating edge:', { id, updates });

  const { data, error } = await supabase
    .from('edges')
    .update({
      source_node_id: updates.source_node_id,
      target_node_id: updates.target_node_id,
      canvas_id: updates.canvas_id
      // Add any other fields that are in your edges table
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating edge:', error);
    return { error };
  }

  console.log('Edge updated:', data);
  return { data };
};

export const deleteEdge = async (
  id: string
): Promise<{ success?: boolean; error?: any }> => {
  console.log('Deleting edge:', id);

  const { error } = await supabase.from('edges').delete().eq('id', id);

  if (error) {
    console.error('Error deleting edge:', error);
    return { error };
  }

  console.log('Edge deleted successfully');
  return { success: true };
};
