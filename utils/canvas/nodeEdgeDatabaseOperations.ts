import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

const supabase = createClient();

/* node related functions */

// Function to insert a new node
export const createNode = async (
  canvasId: string,
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw',
  position: { x: number; y: number },
  data: {
    viewWidth?: number;
    viewHeight?: number;
    editWidth?: number;
    editHeight?: number;
    backgroundColor?: string;
    textColor?: string;
    title?: string;
    tags?: string[];
    attachedFiles?: any[];
    isEditing?: boolean;
    isTemporary?: boolean;
    parentNodeId?: string | null;
    uniqueData?: any;
    zIndex?: number;
  }
) => {
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
    const commonNodeInsert = {
      type: nodeType,
      position: JSON.stringify(position),
      view_width: data.viewWidth || defaultDimensions.width,
      view_height: data.viewHeight || defaultDimensions.height,
      edit_width: data.editWidth || defaultDimensions.editWidth,
      edit_height: data.editHeight || defaultDimensions.editHeight,
      background_color: data.backgroundColor || '#F4F4F4',
      text_color: data.textColor || '#575757',
      title: data.title,
      tags: data.tags,
      attached_files: data.attachedFiles,
      is_editing: data.isEditing,
      is_temporary: data.isTemporary || false,
      parent_node_id: data.parentNodeId || null,
      z_index: data.zIndex || 0
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
    const specificNodeInsert = {
      common_node_id: commonNodeData.id,
      ...data.uniqueData
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

    return { data: { ...commonNodeData, ...specificNodeData } };
  } catch (error) {
    console.error('Unexpected error creating node:', error);
    return { error };
  }
};

// Function to update an existing node
export const updateNode = async (
  id: string,
  updates: Partial<
    Database['public']['Tables']['common_node_properties']['Update']
  >,
  specificUpdates: any,
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
) => {
  // Update the common node
  const updatedCommonNode = {
    type: updates.type,
    position: updates.position,
    view_width: updates.view_width,
    view_height: updates.view_height,
    edit_width: updates.edit_width,
    edit_height: updates.edit_height,
    background_color: updates.background_color,
    text_color: updates.text_color,
    title: updates.title,
    tags: updates.tags,
    attached_files: updates.attached_files,
    is_editing: updates.is_editing,
    is_temporary: updates.is_temporary,
    parent_node_id: updates.parent_node_id,
    z_index: updates.z_index
  };

  const { data: commonNodeData, error: commonNodeError } = await supabase
    .from('common_node_properties')
    .update(updatedCommonNode)
    .eq('id', id)
    .select()
    .single();

  if (commonNodeError) {
    console.error(
      'nodeEdgeDatabaseOperations: Error updating common node:',
      commonNodeError
    );
    return { error: commonNodeError };
  }

  // Update the specific node type table
  const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];

  const { data: specificNodeData, error: specificNodeError } = await supabase
    .from(tableName)
    .update(specificUpdates)
    .eq('common_node_id', id)
    .select()
    .single();

  if (specificNodeError) {
    console.error(
      `nodeEdgeDatabaseOperations: Error updating ${nodeType} node:`,
      specificNodeError
    );
    return { error: specificNodeError };
  }

  return { data: { ...commonNodeData, ...specificNodeData } };
};

// Function to delete a node, updated to handle node_canvas_link and specific node tables
export const deleteNode = async (
  nodeId: string,
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
) => {
  try {
    // Delete the specific node type
    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
    const { error: specificError } = await supabase
      .from(tableName)
      .delete()
      .eq('common_node_id', nodeId);

    if (specificError) {
      console.error(`Error deleting ${nodeType} node:`, specificError);
      return { error: specificError };
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
  edge: Database['public']['Tables']['edges']['Insert']
): Promise<{ data: { id: string }; error?: any }> => {
  const { data, error } = await supabase.from('edges').insert([edge]).single();
  if (error) {
    console.error('nodeEdgeDatabaseOperations: Error inserting edge:', error);
    return { data: { id: '' }, error };
  }
  return { data };
};

// Function to update an existing edge
export const updateEdge = async (
  id: string,
  updates: Database['public']['Tables']['edges']['Update']
) => {
  const { data, error } = await supabase
    .from('edges')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) {
    console.error('nodeEdgeDatabaseOperations: Error updating edge:', error);
    return { error };
  }
  return { data };
};

// Function to delete an edge
export const deleteEdge = async (id: string) => {
  const { error } = await supabase.from('edges').delete().eq('id', id);
  if (error) {
    console.error('nodeEdgeDatabaseOperations: Error deleting edge:', error);
    return { error };
  }
  return { success: true };
};
