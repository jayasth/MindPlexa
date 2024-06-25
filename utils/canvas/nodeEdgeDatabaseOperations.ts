import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import {
  NoteNodeData,
  TaskNodeData,
  TableNodeData,
  CalendarNodeData,
  DrawNodeData,
  CommonNodeData
} from '@/ui/canvasEditor/utils/nodeDatatypes';

const supabase = createClient();

/* node related functions */

// Function to insert a new node
export const createNode = async (
  canvasId: string,
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selection_menu',
  position: { x: number; y: number },
  data: CommonNodeData & {
    viewWidth?: number;
    viewHeight?: number;
    editWidth?: number;
    editHeight?: number;
    uniqueData?:
      | NoteNodeData
      | TaskNodeData
      | TableNodeData
      | CalendarNodeData
      | DrawNodeData;
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
        view_width: data.viewWidth || defaultDimensions.viewWidth,
        view_height: data.viewHeight || defaultDimensions.viewHeight,
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
    if (nodeType !== 'selection_menu') {
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
export const updateNode = async (
  id: string,
  updates: Partial<
    Database['public']['Tables']['common_node_properties']['Update']
  >,
  specificUpdates: Partial<
    | NoteNodeData
    | TaskNodeData
    | TableNodeData
    | CalendarNodeData
    | DrawNodeData
  >,
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selection_menu'
): Promise<{ data?: any; error?: any }> => {
  try {
    // Ensure we only update columns that exist in common_node_properties
    const validCommonNodeUpdates: Partial<
      Database['public']['Tables']['common_node_properties']['Update']
    > = {
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

    // Remove undefined properties
    Object.keys(validCommonNodeUpdates).forEach(
      (key) =>
        validCommonNodeUpdates[key as keyof typeof validCommonNodeUpdates] ===
          undefined &&
        delete validCommonNodeUpdates[
          key as keyof typeof validCommonNodeUpdates
        ]
    );

    const {
      data: commonNodeData,
      error: commonNodeError,
      count: commonNodeCount
    } = await supabase
      .from('common_node_properties')
      .update(validCommonNodeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (commonNodeError) {
      console.error(
        'nodeEdgeDatabaseOperations: Error updating common node properties:',
        commonNodeError
      );
      return { error: commonNodeError };
    }

    if (commonNodeCount === 0) {
      console.error(
        'nodeEdgeDatabaseOperations: No common node found to update'
      );
      return { error: 'No common node found to update' };
    }

    console.log(
      'nodeEdgeDatabaseOperations: Updated common node properties:',
      commonNodeData
    );

    // Update the specific node type table
    if (nodeType !== 'selection_menu') {
      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];
      const {
        data: specificNodeData,
        error: specificNodeError,
        count: specificNodeCount
      } = await supabase
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

      if (specificNodeCount === 0) {
        console.error(
          `nodeEdgeDatabaseOperations: No ${nodeType} node found to update`
        );
        return { error: `No ${nodeType} node found to update` };
      }

      console.log(
        `nodeEdgeDatabaseOperations: Updated ${nodeType} node properties:`,
        specificNodeData
      );

      return { data: { ...commonNodeData, ...specificNodeData } };
    } else {
      return { data: commonNodeData };
    }
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
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selection_menu'
): Promise<{ success?: boolean; error?: any }> => {
  try {
    // Delete the specific node type
    if (nodeType !== 'selection_menu') {
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
  edge: Database['public']['Tables']['edges']['Insert']
): Promise<{ data?: { id: string }; error?: any }> => {
  const { data, error } = await supabase
    .from('edges')
    .insert([edge])
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
