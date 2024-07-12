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
  return await supabase
    .from(tableName)
    .update(toSnakeCase(updates))
    .eq('node_id', id)
    .select()
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
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
  url: string,
  type: string
) => {
  return await supabase
    .from('node_attachments')
    .insert({ node_id: nodeId, url, type })
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
};

const deleteNodeAttachment = async (id: string) => {
  return await supabase.from('node_attachments').delete().match({ id });
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

    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];

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
    const { data: specificNodeData, error: specificNodeError } =
      await updateNodeInTable(
        tableName,
        { content: specificUpdates.content },
        id
      );

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

const handleTags = async (
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
    const { error: insertTagError } = await insertNodeTag(nodeId, tag);

    if (insertTagError) {
      console.error('nodeService: Error inserting tag:', insertTagError);
      return { error: insertTagError };
    }
  }

  return {};
};

const handleAttachments = async (
  nodeId: string,
  attachedFiles: { id: string; url: string; type: string }[]
): Promise<{ error?: any }> => {
  const { error: attachmentDeleteError } = await supabase
    .from('node_attachments')
    .delete()
    .eq('node_id', nodeId);

  if (attachmentDeleteError) {
    console.error(
      'nodeService: Error deleting existing attachments:',
      attachmentDeleteError
    );
    return { error: attachmentDeleteError };
  }

  for (const file of attachedFiles) {
    if (!file.url) {
      console.error('nodeService: Missing URL for attachment:', file);
      return { error: 'Missing URL for attachment' };
    }

    const { error: insertAttachmentError } = await insertNodeAttachment(
      nodeId,
      file.url,
      file.type
    );

    if (insertAttachmentError) {
      console.error(
        'nodeService: Error inserting attachment:',
        insertAttachmentError
      );
      return { error: insertAttachmentError };
    }
  }

  return {};
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
