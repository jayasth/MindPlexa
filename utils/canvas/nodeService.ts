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
import {
  updateNodeSpecificData,
  createNodeSpecificData,
  deleteNodeSpecificData
} from '@/utils/canvas/nodeSpecificDataService';
import { handleTags } from '@/utils/canvas/tagService';

type NodeType = Exclude<
  Database['public']['Enums']['node_type'],
  'selection_menu'
>;

const supabase = createClient();

const uploadSVGToBucket = async (nodeId: string, svgContent: string) => {
  const { data, error } = await supabase.storage
    .from('drawings')
    .upload(`${nodeId}.svg`, svgContent, {
      contentType: 'image/svg+xml',
      upsert: true
    });

  if (error) {
    console.error('Error uploading SVG to bucket:', error);
    return null;
  }

  return data.path;
};

/* Node related functions */

export const insertNode = async (
  nodeInsert: Database['public']['Tables']['nodes']['Insert']
) => {
  return await supabase
    .from('nodes')
    .insert([toSnakeCase(nodeInsert)])
    .select()
    .single()
    .then(({ data, error }) => ({ data: toCamelCase(data), error }));
};

export const insertNodeCanvasLink = async (
  nodeId: string,
  canvasId: string
) => {
  return await supabase
    .from('node_canvas_link')
    .insert(toSnakeCase({ node_id: nodeId, canvas_id: canvasId }));
};

const deleteNodeLink = async (nodeId: string) => {
  return await supabase.from('node_canvas_link').delete().eq('node_id', nodeId);
};

export const createNode = async (
  canvasId: string,
  nodeType: Database['public']['Enums']['node_type'],
  position: { x: number; y: number },
  data: Database['public']['Tables']['nodes']['Insert'] & {
    noteData?: Database['public']['Tables']['note_nodes']['Insert'];
    taskData?: Database['public']['Tables']['task_nodes']['Insert'];
    calendarData?: Database['public']['Tables']['calendar_nodes']['Insert'];
    drawData?: Database['public']['Tables']['draw_nodes']['Insert'];
    tableData?: Database['public']['Tables']['table_nodes']['Insert'];
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

  const defaultTitle = `Untitled ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`;

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
    title: data.title || defaultTitle,
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
        node_id: nodeId,
        ...(data[`${nodeType}Data`] || {})
      };

      if (
        nodeType === 'draw' &&
        'drawing_file_url' in specificNodeInsert &&
        specificNodeInsert.drawing_file_url
      ) {
        const svgPath = await uploadSVGToBucket(
          nodeId,
          specificNodeInsert.drawing_file_url
        );
        if (svgPath) {
          specificNodeInsert.drawing_file_url = svgPath;
        }
      }

      const { data: specificNodeData, error: specificNodeError } =
        await createNodeSpecificData(
          nodeId,
          nodeType as NodeType,
          specificNodeInsert
        );

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
    if (nodeType === 'draw') {
      if (specificUpdates.drawingFileUrl) {
        const svgPath = await uploadSVGToBucket(
          id,
          specificUpdates.drawingFileUrl
        );
        if (svgPath) {
          specificUpdates.drawingFileUrl = svgPath;
        }
      }

      const drawNodeUpdates = {
        drawing_file_url: specificUpdates.drawingFileUrl,
        current_tool: specificUpdates.currentTool,
        layers: specificUpdates.layers,
        settings: specificUpdates.settings,
        zoom_level: specificUpdates.zoomLevel
      };

      const { data: drawNodeData, error: drawNodeError } =
        await updateNodeSpecificData(id, 'draw', drawNodeUpdates);

      if (drawNodeError) {
        console.error('nodeService: Error updating draw node:', drawNodeError);
        return { error: drawNodeError };
      }

      console.log('nodeService: Draw node updated:', drawNodeData);
    } else {
      const nodeSpecificUpdates = { ...specificUpdates, node_id: id };

      const { data: specificNodeData, error: specificNodeError } =
        await updateNodeSpecificData(
          id,
          nodeType as NodeType,
          nodeSpecificUpdates
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
  }

  if (specificUpdates?.tags && Array.isArray(specificUpdates.tags)) {
    const { error: tagError } = await handleTags(id, specificUpdates.tags);
    if (tagError) {
      return { error: tagError };
    }
  }

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
    const { error: specificError } = await deleteNodeSpecificData(
      nodeId,
      nodeType as NodeType
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
  await Promise.all([
    supabase.from('note_nodes').delete().in('node_id', nodeIds),
    supabase.from('task_nodes').delete().in('node_id', nodeIds),
    supabase.from('calendar_nodes').delete().in('node_id', nodeIds)
  ]);

  // Delete node attachments and tags
  await Promise.all([
    supabase.from('node_attachments').delete().in('node_id', nodeIds),
    supabase.from('node_tags').delete().in('node_id', nodeIds)
  ]);

  await supabase.from('nodes').delete().in('id', nodeIds);
};
