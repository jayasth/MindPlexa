import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';
import {
  getNodeSpecificData,
  createNodeSpecificData,
  processNodeSpecificData
} from '@/utils/canvas/nodeSpecificDataService';
import { insertNode, insertNodeCanvasLink } from '@/utils/canvas/nodeService';

const supabase = createClient();

type NodeType = Exclude<
  Database['public']['Enums']['node_type'],
  'selection_menu'
>;

export const duplicateNode = async (
  nodeId: string,
  canvasId: string,
  newPosition: { x: number; y: number }
) => {
  try {
    // Fetch the original node data
    const { data: originalNode, error: nodeError } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (nodeError) throw nodeError;

    // Generate new ID for the duplicated node
    const newNodeId = uuidv4();
    const newNodeData = {
      ...originalNode,
      id: newNodeId,
      parent_node_id: null,
      title: `${originalNode.title} copy`,
      version: 1,
      position: JSON.stringify(newPosition) // Update the position
    };

    // Insert the duplicated node into the nodes table
    const { data: newNode, error: insertNodeError } =
      await insertNode(newNodeData);
    if (insertNodeError) throw insertNodeError;

    // Duplicate node-specific data
    const originalNodeSpecific = await getNodeSpecificData(
      nodeId,
      originalNode.type as NodeType
    );

    if (!originalNodeSpecific)
      throw new Error('Failed to fetch original node specific data');

    // Process the node-specific data
    const processedNodeSpecificData = processNodeSpecificData(
      originalNode.type as NodeType,
      originalNodeSpecific
    );

    // Create new node-specific data
    const { data: newNodeSpecific, error: newNodeSpecificError } =
      await createNodeSpecificData(
        newNodeId,
        originalNode.type as NodeType,
        processedNodeSpecificData
      );

    if (newNodeSpecificError)
      throw new Error(
        'Failed to create new node specific data: ' +
          newNodeSpecificError.message
      );

    // Insert the node-canvas link
    const { error: nodeCanvasLinkError } = await insertNodeCanvasLink(
      newNodeId,
      canvasId
    );
    if (nodeCanvasLinkError) throw nodeCanvasLinkError;

    // Duplicate tags
    const { data: tags, error: tagsError } = await supabase
      .from('node_tags')
      .select('tag')
      .eq('node_id', nodeId);

    if (tagsError) throw tagsError;

    if (tags && tags.length > 0) {
      const newTags = tags.map((tag) => ({
        node_id: newNodeId,
        tag: tag.tag
      }));

      const { error: newTagsError } = await supabase
        .from('node_tags')
        .insert(newTags);

      if (newTagsError) throw newTagsError;
    }

    // Duplicate attachments
    const { data: attachments, error: attachmentsError } = await supabase
      .from('node_attachments')
      .select('*')
      .eq('node_id', nodeId);

    if (attachmentsError) throw attachmentsError;

    if (attachments && attachments.length > 0) {
      const newAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          const newAttachment = {
            ...attachment,
            id: uuidv4(),
            node_id: newNodeId
          };
          if (attachment.is_file && attachment.storage_path) {
            const newStoragePath = `node-attachments/${newNodeId}/${attachment.file_name}`;
            const { data, error } = await supabase.storage
              .from('node-attachments')
              .copy(attachment.storage_path, newStoragePath);
            if (error) throw error;
            newAttachment.storage_path = newStoragePath;
          }
          return newAttachment;
        })
      );

      const { error: newAttachmentsError } = await supabase
        .from('node_attachments')
        .insert(newAttachments);

      if (newAttachmentsError) throw newAttachmentsError;
    }

    return {
      success: true,
      newNode: {
        ...newNode,
        ...newNodeSpecific,
        id: newNodeId,
        canvasId,
        parent_node_id: null,
        title: newNodeData.title,
        version: newNodeData.version,
        position: newPosition
      }
    };
  } catch (error) {
    console.error('Error duplicating node:', error);
    return { success: false, error };
  }
};
