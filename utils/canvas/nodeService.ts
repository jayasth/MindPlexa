import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';
import {
  addAttachment,
  removeAttachment,
  getAttachments
} from '@/utils/canvas/attachmentService';

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

const deleteNodeFromTable = async (
  tableName: keyof Database['public']['Tables'],
  nodeId: string
) => {
  return await supabase.from(tableName).delete().eq('node_id', nodeId);
};

const deleteNodeLink = async (nodeId: string) => {
  return await supabase.from('node_canvas_link').delete().eq('node_id', nodeId);
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

export const duplicateNode = async (nodeId: string, canvasId: string) => {
  try {
    // Fetch the original node data
    const { data: originalNode, error: nodeError } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (nodeError) throw nodeError;

    // Generate new IDs for the duplicated node and its specific data
    const newNodeId = uuidv4();
    const newNodeData = {
      ...originalNode,
      id: newNodeId,
      parent_node_id: null
    };

    // Insert the duplicated node into the nodes table
    const { data: newNode, error: insertNodeError } =
      await insertNode(newNodeData);
    if (insertNodeError) throw insertNodeError;

    // Insert the duplicated node-specific data into the corresponding table
    const nodeSpecificTable =
      `${originalNode.type}_nodes` as keyof Database['public']['Tables'];
    const { data: originalNodeSpecific, error: nodeSpecificError } =
      await supabase
        .from(nodeSpecificTable)
        .select('*')
        .eq('node_id', nodeId)
        .single();

    if (nodeSpecificError) throw nodeSpecificError;

    const newNodeSpecificData = {
      ...originalNodeSpecific,
      id: uuidv4(),
      node_id: newNodeId
    };
    const { data: newNodeSpecific, error: insertNodeSpecificError } =
      await insertNodeSpecificData(nodeSpecificTable, newNodeSpecificData);
    if (insertNodeSpecificError) throw insertNodeSpecificError;

    // Insert the node-canvas link
    console.log(
      'NodeService: Node duplicaiton: Inserting node-canvas link with nodeId:',
      newNodeId,
      'and canvasId:',
      canvasId
    );
    const { data: newNodeCanvasLink, error: nodeCanvasLinkError } =
      await insertNodeCanvasLink(newNodeId, canvasId);
    if (nodeCanvasLinkError) throw nodeCanvasLinkError;

    // Duplicate tags
    const { data: tags, error: tagsError } = await supabase
      .from('node_tags')
      .select('*')
      .eq('node_id', nodeId);

    if (tagsError) throw tagsError;

    const newTags = tags.map((tag) => ({
      ...tag,
      id: uuidv4(),
      node_id: newNodeId
    }));

    const { error: newTagsError } = await supabase
      .from('node_tags')
      .insert(newTags);

    if (newTagsError) throw newTagsError;

    // Duplicate attachments
    const { data: attachments, error: attachmentsError } = await supabase
      .from('node_attachments')
      .select('*')
      .eq('node_id', nodeId);

    if (attachmentsError) throw attachmentsError;

    const newAttachments = attachments.map((attachment) => ({
      ...attachment,
      id: uuidv4(),
      node_id: newNodeId,
      storage_path: `path/to/duplicated/attachments/${uuidv4()}`
    }));

    const { error: newAttachmentsError } = await supabase
      .from('node_attachments')
      .insert(newAttachments);

    if (newAttachmentsError) throw newAttachmentsError;

    return { success: true, newNode };
  } catch (error) {
    console.error('Error duplicating node:', error);
    return { success: false, error };
  }
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

    if ('attachedFiles' in data && Array.isArray(data.attachedFiles)) {
      for (const attachment of data.attachedFiles) {
        await addAttachment(nodeId, attachment);
      }
    }

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

  // Update or create node-specific data
  if (nodeType !== 'selection_menu') {
    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
    const nodeSpecificUpdates = { ...specificUpdates, node_id: id };

    const { data: existingData } = await supabase
      .from(tableName)
      .select('*')
      .eq('node_id', id)
      .single();

    let specificNodeData;
    let specificNodeError;

    if (existingData) {
      // Update existing node-specific data
      ({ data: specificNodeData, error: specificNodeError } = await supabase
        .from(tableName)
        .update(toSnakeCase(nodeSpecificUpdates))
        .eq('node_id', id)
        .select()
        .single());
    } else {
      // Create new node-specific data
      ({ data: specificNodeData, error: specificNodeError } = await supabase
        .from(tableName)
        .insert(toSnakeCase(nodeSpecificUpdates))
        .select()
        .single());
    }

    if (specificNodeError) {
      console.error(
        `nodeService: Error updating/creating ${nodeType} node:`,
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
  if (specificUpdates?.attachedFiles) {
    const existingAttachments = await getAttachments(id);
    const existingIds = new Set(existingAttachments.map((a) => a.id));

    for (const attachment of specificUpdates.attachedFiles) {
      if (!existingIds.has(attachment.id)) {
        await addAttachment(id, attachment);
      }
    }

    for (const existingAttachment of existingAttachments) {
      if (
        !specificUpdates.attachedFiles.some(
          (a) => a.id === existingAttachment.id
        )
      ) {
        await removeAttachment(existingAttachment.id);
      }
    }
  }

  return { data: { ...nodeData, ...specificUpdates } };
};

export const deleteNode = async (
  nodeId: string,
  nodeType: Database['public']['Enums']['node_type']
): Promise<{ success?: boolean; error?: any }> => {
  console.log('nodeService: Deleting node:', { nodeId, nodeType });

  // Delete attachments from storage
  const { data: attachments, error: attachmentsError } = await supabase
    .from('node_attachments')
    .select('storage_path')
    .eq('node_id', nodeId);

  if (attachmentsError) {
    console.error('Error fetching attachments:', attachmentsError);
    return { error: attachmentsError };
  }

  for (const attachment of attachments) {
    if (attachment.storage_path) {
      const { error: deleteError } = await supabase.storage
        .from('node-attachments')
        .remove([attachment.storage_path]);

      if (deleteError) {
        console.error('Error deleting file from storage:', deleteError);
      }
    }
  }

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

export const deleteNodes = async (nodeIds: string[]) => {
  // Delete node-specific data
  await Promise.all([
    supabase.from('note_nodes').delete().in('node_id', nodeIds),
    supabase.from('task_nodes').delete().in('node_id', nodeIds),
    supabase.from('calendar_nodes').delete().in('node_id', nodeIds),
    supabase.from('table_nodes').delete().in('node_id', nodeIds),
    supabase.from('draw_nodes').delete().in('node_id', nodeIds)
  ]);

  // Delete node attachments and tags
  await Promise.all([
    supabase.from('node_attachments').delete().in('node_id', nodeIds),
    supabase.from('node_tags').delete().in('node_id', nodeIds)
  ]);

  // Delete nodes
  await supabase.from('nodes').delete().in('id', nodeIds);
};
