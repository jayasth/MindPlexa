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
  data: Database['public']['Tables']['common_node_properties']['Insert'] & {
    uniqueData?: any;
  }
): Promise<{ data?: any; error?: any }> => {
  console.log('nodeEdgeDatabaseOperations: createNode called with:', {
    canvasId,
    nodeType,
    position,
    data
  });
  try {
    // Get default dimensions from nodeProperties
    const defaultDimensions = nodeDimensions[nodeType];

    // Create a common node first
    const commonNodeInsert: Database['public']['Tables']['common_node_properties']['Insert'] =
      {
        type: nodeType,
        position: JSON.stringify(position),
        view_width:
          'width' in defaultDimensions
            ? defaultDimensions.width
            : defaultDimensions.viewWidth,
        view_height:
          'height' in defaultDimensions
            ? defaultDimensions.height
            : defaultDimensions.viewHeight,
        edit_width:
          'editWidth' in defaultDimensions ? defaultDimensions.editWidth : null,
        edit_height:
          'editHeight' in defaultDimensions
            ? defaultDimensions.editHeight
            : null,
        background_color: data.background_color || '#F4F4F4',
        text_color: data.text_color || '#575757',
        title: data.title,
        tags: data.tags,
        attached_files: data.attached_files,
        is_editing: data.is_editing,
        is_temporary: data.is_temporary || false,
        parent_node_id: data.parent_node_id || null,
        z_index: data.z_index || 0
      };

    const { data: commonNodeData, error: commonNodeError } = await supabase
      .from('common_node_properties')
      .insert([commonNodeInsert])
      .select()
      .single();

    if (commonNodeError) {
      console.error('Error inserting common node:', commonNodeError);
      return { error: commonNodeError };
    }

    // Link node to canvas
    const { error: linkError } = await supabase
      .from('node_canvas_link')
      .insert({ node_id: commonNodeData.id, canvas_id: canvasId });

    if (linkError) {
      console.error('Error linking node to canvas:', linkError);
      return { error: linkError };
    }

    // Create the specific node type
    if (nodeType !== 'selectionMenu') {
      const specificNodeInsert = {
        common_node_id: commonNodeData.id,
        ...data.uniqueData
      };

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

      return { data: { ...commonNodeData, ...specificNodeData } };
    } else {
      return { data: commonNodeData };
    }
  } catch (error) {
    console.error('Unexpected error creating node:', error);
    return { error };
  }
};

// Function to update an existing node
type NodeSpecificUpdates =
  | { type: 'note'; content: string }
  | { type: 'task'; tasks: any[] }
  | { type: 'table'; columns: any[]; rows: any[] }
  | { type: 'draw'; drawing_data: string }
  | { type: 'calendar'; events: any[] };

export const updateNode = async (
  id: string,
  updates: Partial<
    Database['public']['Tables']['common_node_properties']['Update']
  >,
  specificUpdates: NodeSpecificUpdates,
  nodeType: Database['public']['Enums']['node_type']
): Promise<{ data?: any; error?: any }> => {
  try {
    // Update common node properties
    const { data: commonNodeData, error: commonNodeError } = await supabase
      .from('common_node_properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (commonNodeError) {
      console.error('Error updating common node properties:', commonNodeError);
      return { error: commonNodeError };
    }

    // Handle node type change
    if (updates.type && updates.type !== nodeType) {
      // Delete old node-specific data
      const oldTableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];
      await supabase.from(oldTableName).delete().eq('common_node_id', id);

      // Insert new node-specific data
      const newTableName =
        `${updates.type}_nodes` as keyof Database['public']['Tables'];
      const { error: newNodeError } = await supabase
        .from(newTableName)
        .insert({ common_node_id: id, ...specificUpdates })
        .select()
        .single();

      if (newNodeError) {
        console.error(
          `Error inserting new ${updates.type} node:`,
          newNodeError
        );
        return { error: newNodeError };
      }
    } else if (nodeType !== 'selectionMenu') {
      // Update existing node-specific data
      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];
      const { data: specificNodeData, error: specificNodeError } =
        await supabase
          .from(tableName)
          .update(specificUpdates)
          .eq('common_node_id', id)
          .select()
          .single();

      if (specificNodeError) {
        console.error(`Error updating ${nodeType} node:`, specificNodeError);
        return { error: specificNodeError };
      }

      return { data: { ...commonNodeData, ...specificNodeData } };
    }

    return { data: commonNodeData };
  } catch (error) {
    console.error('Unexpected error updating node:', error);
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
    if (nodeType !== 'selectionMenu') {
      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];
      const { error: specificError } = await supabase
        .from(tableName)
        .delete()
        .eq('common_node_id', nodeId);

      if (specificError) {
        console.error(`Error deleting ${nodeType} node:`, specificError);
        return { error: specificError };
      }
    }

    // Delete the common node properties
    const { error: commonError } = await supabase
      .from('common_node_properties')
      .delete()
      .eq('id', nodeId);

    if (commonError) {
      console.error('Error deleting common node properties:', commonError);
      return { error: commonError };
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

// ... rest of the file remains the same

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
