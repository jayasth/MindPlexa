import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

const supabase = createClient();

/* Node related functions */

const insertNode = async (
  nodeInsert: Database['public']['Tables']['nodes']['Insert']
) => {
  return await supabase
    .from('nodes')
    .insert([toSnakeCase(nodeInsert)])
    .select()
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
};

const insertNodeSpecificData = async (
  tableName: keyof Database['public']['Tables'],
  specificNodeInsert: any
) => {
  return await supabase
    .from(tableName)
    .insert([toSnakeCase(specificNodeInsert)])
    .select()
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
};

const insertNodeCanvasLink = async (nodeId: string, canvasId: string) => {
  return await supabase
    .from('node_canvas_link')
    .insert(toSnakeCase({ node_id: nodeId, canvas_id: canvasId }));
};

const updateNodeInTable = async (
  tableName: keyof Database['public']['Tables'],
  updates: any,
  id: string
) => {
  // First, check if the record exists
  const { data: existingData, error: checkError } = await supabase
    .from(tableName)
    .select('*')
    .eq('node_id', id)
    .single();

  if (checkError) {
    console.error(`Error checking ${tableName}:`, checkError);
    return { error: checkError };
  }

  if (existingData) {
    // If the record exists, update it
    const { data, error } = await supabase
      .from(tableName)
      .update(toSnakeCase(updates))
      .eq('node_id', id)
      .select();

    if (error) {
      console.error(`Error updating ${tableName}:`, error);
      return { error };
    }

    return { data: toCamelCase(data[0]) };
  } else {
    // If the record doesn't exist, insert a new one
    const { data: insertedData, error: insertError } = await supabase
      .from(tableName)
      .insert({ ...toSnakeCase(updates), node_id: id })
      .select();

    if (insertError) {
      console.error(`Error inserting into ${tableName}:`, insertError);
      return { error: insertError };
    }

    return { data: toCamelCase(insertedData[0]) };
  }
};

const deleteNodeFromTable = async (
  tableName: keyof Database['public']['Tables'],
  nodeId: string
) => {
  return await supabase.from(tableName).delete().eq('node_id', nodeId);
};

const deleteNodeLink = async (nodeId: string) => {
  return await supabase.from('node_canvas_link').delete().eq('node_id', nodeId);
};

const insertNodeTag = async (nodeId: string, tag: string) => {
  return await supabase
    .from('node_tags')
    .insert({ node_id: nodeId, tag })
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
};

const deleteNodeTag = async (nodeId: string, tag: string) => {
  return await supabase
    .from('node_tags')
    .delete()
    .match({ node_id: nodeId, tag });
};

const insertNodeAttachment = async (
  nodeId: string,
  type: 'file' | 'url',
  filePath?: string,
  url?: string
) => {
  const attachmentData: any = {
    node_id: nodeId,
    type,
    file_path: filePath || null,
    url: url || null
  };

  return await supabase
    .from('node_attachments')
    .insert([toSnakeCase(attachmentData)])
    .select()
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
};

const deleteNodeAttachment = async (id: string) => {
  return await supabase.from('node_attachments').delete().match({ id });
};

export const handleTags = async (
  nodeId: string,
  tags: string[]
): Promise<{ error?: any }> => {
  const { error: tagDeleteError } = await supabase
    .from('node_tags')
    .delete()
    .eq('node_id', nodeId);

  if (tagDeleteError) {
    console.error('nodeService: Error deleting existing tags:', tagDeleteError);
    return { error: tagDeleteError };
  }

  for (const tag of tags) {
    const { error: insertTagError } = await supabase
      .from('node_tags')
      .insert({ node_id: nodeId, tag });

    if (insertTagError) {
      console.error('nodeService: Error inserting tag:', insertTagError);
      return { error: insertTagError };
    }
  }

  return {};
};

export const handleAttachments = async (
  nodeId: string,
  attachments: (File | string)[]
): Promise<{ error?: any }> => {
  const attachmentPromises = attachments.map(async (attachment) => {
    if (typeof attachment === 'string') {
      // Handle URL attachment
      return await insertNodeAttachment(nodeId, 'url', undefined, attachment);
    } else {
      // Handle file attachment
      const filePath = await saveFileAttachment(attachment);
      return await insertNodeAttachment(nodeId, 'file', filePath);
    }
  });

  const results = await Promise.all(attachmentPromises);
  const errors = results.filter((result) => result.error);

  if (errors.length > 0) {
    return { error: errors };
  }

  return {};
};

// Implement this function to save the file and return the file path
const saveFileAttachment = async (file: File): Promise<string> => {
  // Save the file to a designated directory or upload it to a storage service
  // Return the file path or URL
  // Example:
  // const filePath = `/uploads/${uuidv4()}-${file.name}`;
  // await uploadFileToStorage(file, filePath);
  // return filePath;
  return 'path/to/saved/file'; // Replace with actual implementation
};

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
  console.log('nodeService: Creating node:', {
    canvasId,
    nodeType,
    position,
    data
  });

  const nodeId = data.id || uuidv4();
  const defaultDimensions = nodeDimensions[nodeType];

  if (!defaultDimensions) {
    console.warn('nodeService: Unsupported node type:', nodeType);
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

  try {
    const { data: nodeData, error: nodeError } = await insertNode(nodeInsert);

    if (nodeError) {
      console.error('nodeService: Error inserting node:', nodeError);
      return { error: nodeError };
    }

    console.log('nodeService: Node created:', nodeData);

    const { error: linkError } = await insertNodeCanvasLink(nodeId, canvasId);

    if (linkError) {
      console.error('nodeService: Error linking node to canvas:', linkError);
      return { error: linkError };
    }

    console.log('nodeService: Node linked to canvas:', {
      node_id: nodeId,
      canvas_id: canvasId
    });

    if (nodeType !== 'selection_menu') {
      const specificNodeInsert = {
        id: uuidv4(),
        node_id: nodeId,
        ...(data[`${nodeType}Data`] || {})
      };

      const tableName =
        `${nodeType}_nodes` as keyof Database['public']['Tables'];

      const { data: specificNodeData, error: specificNodeError } =
        await insertNodeSpecificData(tableName, specificNodeInsert);

      if (specificNodeError) {
        console.error(
          `nodeService: Error inserting ${nodeType} node:`,
          specificNodeError
        );
        return { error: specificNodeError };
      }

      console.log(`nodeService: ${nodeType} node created:`, specificNodeData);

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
    console.error('nodeService: Unexpected error:', error);
    return { error };
  }
};

export const updateNode = async (
  id: string,
  updates: Partial<Database['public']['Tables']['nodes']['Update']>,
  specificUpdates: any,
  nodeType: Database['public']['Enums']['node_type']
): Promise<{ data?: any; error?: any }> => {
  console.log('nodeService: Updating node:', {
    id,
    nodeType,
    updates,
    specificUpdates
  });

  // Update the main nodes table
  const { data: nodeData, error: nodeError } = await supabase
    .from('nodes')
    .update(toSnakeCase(updates))
    .eq('id', id)
    .select()
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));

  if (nodeError) {
    console.error('nodeService: Error updating node properties:', nodeError);
    return { error: nodeError };
  }

  console.log('nodeService: Node properties updated:', nodeData);

  // Update node-specific table
  if (nodeType !== 'selection_menu') {
    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
    const nodeSpecificUpdates = { ...specificUpdates };
    delete nodeSpecificUpdates.tags;
    delete nodeSpecificUpdates.attachedFiles;

    const { data: specificNodeData, error: specificNodeError } =
      await updateNodeInTable(tableName, nodeSpecificUpdates, id);

    if (specificNodeError) {
      console.error(
        `nodeService: Error updating ${nodeType} node:`,
        specificNodeError
      );
      return { error: specificNodeError };
    }

    console.log(`nodeService: ${nodeType} node updated:`, specificNodeData);
  }

  // Handle tags
  if (specificUpdates?.tags && Array.isArray(specificUpdates.tags)) {
    const { error: tagError } = await handleTags(id, specificUpdates.tags);
    if (tagError) {
      return { error: tagError };
    }
  }

  // Handle attachments
  if (
    specificUpdates?.attachedFiles &&
    Array.isArray(specificUpdates.attachedFiles)
  ) {
    const { error: attachmentError } = await handleAttachments(
      id,
      specificUpdates.attachedFiles
    );
    if (attachmentError) {
      return { error: attachmentError };
    }
  }

  return { data: { ...nodeData, ...specificUpdates } };
};

export const deleteNode = async (
  nodeId: string,
  nodeType: Database['public']['Enums']['node_type']
): Promise<{ success?: boolean; error?: any }> => {
  console.log('nodeService: Deleting node:', { nodeId, nodeType });

  if (nodeType !== 'selection_menu') {
    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
    const { error: specificError } = await deleteNodeFromTable(
      tableName,
      nodeId
    );

    if (specificError) {
      console.error(
        `nodeService: Error deleting ${nodeType} node:`,
        specificError
      );
      return { error: specificError };
    }
  }

  const { error: nodeError } = await supabase
    .from('nodes')
    .delete()
    .eq('id', nodeId);

  if (nodeError) {
    console.error('nodeService: Error deleting node:', nodeError);
    return { error: nodeError };
  }

  const { error: linkError } = await deleteNodeLink(nodeId);

  if (linkError) {
    console.error('nodeService: Error deleting node links:', linkError);
    return { error: linkError };
  }

  console.log('nodeService: Node deleted successfully');
  return { success: true };
};
