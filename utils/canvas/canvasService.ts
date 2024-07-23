import { createClient } from '@/utils/supabase/supabaseClient';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';
import { deleteNode, deleteNodes } from '@/utils/canvas/nodeService';
import { deleteEdge } from '@/utils/canvas/edgeService';
import {
  getAttachments,
  removeAttachment
} from '@/utils/canvas/attachmentService';
import {
  getNodeSpecificData,
  updateNodeSpecificData,
  processNodeSpecificData
} from '@/utils/canvas/nodeSpecificDataService';
import { handleTags } from '@/utils/canvas/tagService';
import {
  getDrawNodeData,
  updateDrawNodeData,
  saveDrawing,
  getDrawing
} from './drawNodeService';

const supabase = createClient();

// Function to handle creating a new canvas
export const createCanvas = async (
  canvasTitle: string,
  setIsModalOpen: (isOpen: boolean) => void,
  router: ReturnType<typeof useRouter>
) => {
  if (canvasTitle.trim() !== '') {
    const insertResponse = await supabase
      .from('canvases')
      .insert(toSnakeCase({ id: uuidv4(), name: canvasTitle }));

    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => ({ data: toCamelCase(data), error }));

    if (error) {
      console.error('canvasService: Error fetching canvas:', error);
    } else if (data && data[0]) {
      setIsModalOpen(false);
      router.push(`/canvasEditor/${data[0].id}?new=true`);
    }
  }
};

// Function to handle deleting a canvas and its associated nodes
export const deleteCanvas = async (
  canvasId: string,
  setCanvases: (canvases: any) => void
) => {
  const { data: nodes, error: nodesError } = await supabase
    .from('node_canvas_link')
    .select('node_id')
    .eq('canvas_id', canvasId);

  if (nodesError) {
    console.error('Error fetching canvas nodes:', nodesError);
    return;
  }

  const nodeIds = nodes.map((node) => node.node_id);

  // Delete associated edges
  await deleteEdge(canvasId);

  // Delete associated nodes
  for (const nodeId of nodeIds) {
    const attachments = await getAttachments(nodeId);
    for (const attachment of attachments) {
      await removeAttachment(attachment.id);
    }

    const { data: nodeData, error: nodeError } = await supabase
      .from('nodes')
      .select('type')
      .eq('id', nodeId)
      .single();

    if (nodeError) {
      console.error(`Error fetching node type for node ${nodeId}:`, nodeError);
      continue;
    }

    const nodeType = nodeData.type;
    if (nodeType) {
      await deleteNode(nodeId, nodeType);
    } else {
      console.error(`Node type for node ${nodeId} is null or undefined.`);
    }
  }

  // Delete the canvas
  const { error: deleteError } = await supabase
    .from('canvases')
    .delete()
    .eq('id', canvasId);

  if (deleteError) {
    console.error('Error deleting canvas:', deleteError);
  } else {
    setCanvases((prevCanvases) =>
      prevCanvases.filter((canvas) => canvas.id !== canvasId)
    );
  }
};

// Function to delete a canvas and its associated nodes (except shared ones)
export const deleteCanvasWithNodes = async (
  canvasId: string,
  setCanvases: (canvases: any) => void
) => {
  const { data: nodes, error: nodesError } = await supabase
    .from('node_canvas_link')
    .select('node_id')
    .eq('canvas_id', canvasId);

  if (nodesError) {
    console.error('Error fetching canvas nodes:', nodesError);
    return;
  }

  const nodeIds = nodes.map((node) => node.node_id);

  // Delete associated edges
  await supabase.from('edges').delete().eq('canvas_id', canvasId);

  // Delete attachments and files for each node
  for (const nodeId of nodeIds) {
    const attachments = await getAttachments(nodeId);
    for (const attachment of attachments) {
      await removeAttachment(attachment.id);
    }
  }

  // Delete associated nodes
  await deleteNodes(nodeIds);

  // Delete the canvas
  const { error: deleteError } = await supabase
    .from('canvases')
    .delete()
    .eq('id', canvasId);

  if (deleteError) {
    console.error('Error deleting canvas:', deleteError);
  } else {
    setCanvases((prevCanvases) =>
      prevCanvases.filter((canvas) => canvas.id !== canvasId)
    );
  }
};

export const fetchCanvas = async (canvasId: string) => {
  console.log('canvasService: Fetching canvas with ID:', canvasId);

  const { data: canvasData, error: canvasError } = await supabase
    .from('canvases')
    .select(
      `*, 
      nodes(
        id, type, position, is_editing, background_color, text_color, title, z_index,
        view_width, view_height, edit_width, edit_height, mobile_edit_width, mobile_edit_height,
        node_tags(tag),
        node_attachments(id, type, file_name, file_size, storage_path, mime_type, url, is_file)
      ),
      edges(id, source_node_id, target_node_id)`
    )
    .eq('id', canvasId)
    .single();

  if (canvasError) {
    console.error('canvasService: Error fetching canvas:', canvasError);
    throw canvasError;
  }

  const canvas = toCamelCase(canvasData);

  const organizedNodes = await Promise.all(
    canvas.nodes.map(async (node) => {
      const nodeType = node.type.toLowerCase();
      let specificNodeData;

      if (nodeType === 'draw') {
        specificNodeData = await getDrawNodeData(node.id);
        const drawingData = await getDrawing(node.id);
        specificNodeData.drawingData = drawingData;
      } else {
        specificNodeData = await getNodeSpecificData(node.id, nodeType);
      }

      const processedData = processNodeSpecificData(nodeType, specificNodeData);

      const tags = node.nodeTags ? node.nodeTags.map((tag) => tag.tag) : [];
      const attachments = node.nodeAttachments
        ? node.nodeAttachments.map((attachment) => ({
            id: attachment.id,
            type: attachment.type,
            name: attachment.fileName,
            size: attachment.fileSize,
            storagePath: attachment.storagePath,
            mimeType: attachment.mimeType,
            url: attachment.url,
            isFile: attachment.isFile
          }))
        : [];

      delete node.nodeTags;
      delete node.nodeAttachments;

      return {
        ...node,
        data: {
          ...processedData,
          tags,
          attachedFiles: attachments
        }
      };
    })
  );

  console.log('canvasService: Organized nodes:', organizedNodes);

  return {
    ...canvas,
    nodes: organizedNodes
  };
};

// Function to save the state of the canvas and its nodes
export const saveCanvasState = async (canvasId: string, canvasState: any) => {
  const { nodes, ...canvasData } = canvasState;

  // Update canvas data
  const { error: canvasUpdateError } = await supabase
    .from('canvases')
    .update(toSnakeCase(canvasData))
    .eq('id', canvasId);

  if (canvasUpdateError) {
    console.error('canvasService: Error updating canvas:', canvasUpdateError);
    throw canvasUpdateError;
  }

  // Update nodes
  for (const node of nodes) {
    const { id: nodeId, type: nodeType, data, ...nodeData } = node;

    // Update common node data
    const { error: nodeUpdateError } = await supabase
      .from('nodes')
      .update(toSnakeCase(nodeData))
      .eq('id', nodeId);

    if (nodeUpdateError) {
      console.error('canvasService: Error updating node:', nodeUpdateError);
      throw nodeUpdateError;
    }

    // Update node-specific data
    if (nodeType !== 'selection_menu') {
      if (nodeType === 'draw') {
        const drawingData = data.drawingData;
        if (drawingData) {
          const { currentTool, layers, settings } = drawingData;
          const drawNodeUpdates = {
            currentTool,
            layers: JSON.stringify(layers),
            settings: JSON.stringify(settings)
          };
          await updateDrawNodeData(nodeId, drawNodeUpdates);
          if (drawingData.drawingFileUrl) {
            await saveDrawing(nodeId, drawingData.drawingFileUrl);
          }
        }
      } else {
        const { error: specificNodeUpdateError } = await updateNodeSpecificData(
          nodeId,
          nodeType,
          data
        );

        if (specificNodeUpdateError) {
          console.error(
            `canvasService: Error updating ${nodeType} node:`,
            specificNodeUpdateError
          );
          throw specificNodeUpdateError;
        }
      }
    }

    // Update node tags
    const { tags } = data;
    if (tags && Array.isArray(tags)) {
      await handleTags(nodeId, tags);
    }

    // Update node attachments
    const { attachedFiles } = data;
    if (attachedFiles && Array.isArray(attachedFiles)) {
      // Delete existing attachments
      await supabase.from('node_attachments').delete().eq('node_id', nodeId);

      // Insert new attachments
      const attachmentsData = attachedFiles.map((attachment) => ({
        node_id: nodeId,
        type: attachment.type,
        file_name: attachment.name,
        file_size: attachment.size,
        storage_path: attachment.storagePath,
        mime_type: attachment.mimeType,
        url: attachment.url,
        is_file: attachment.isFile
      }));
      await supabase.from('node_attachments').insert(attachmentsData);
    }
  }
};
