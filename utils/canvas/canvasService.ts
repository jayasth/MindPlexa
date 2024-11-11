import { createClient } from '@/utils/supabase/supabaseClient';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';
import { deleteNode, deleteNodes, NodeType } from '@/utils/canvas/nodeService';
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
import { removeDrawing } from './drawNodeService';
import { Database } from '@/types_db';

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

// Function to handle creating a new canvas
export const createCanvas = async (
  canvasTitle: string,
  setIsModalOpen: (isOpen: boolean) => void,
  router: ReturnType<typeof useRouter>
) => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (canvasTitle.trim() !== '' && session?.user.id) {
    const newCanvas: Database['public']['Tables']['canvases']['Insert'] = {
      id: uuidv4(),
      name: canvasTitle,
      user_id: session.user.id
    };

    await supabase
      .from('canvases')
      .insert(
        toSnakeCase(
          newCanvas
        ) as Database['public']['Tables']['canvases']['Insert']
      );

    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => ({
        data: toCamelCase(
          data
        ) as Database['public']['Tables']['canvases']['Row'][],
        error
      }));

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
  setCanvases: React.Dispatch<React.SetStateAction<{ id: string }[]>>
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

    const nodeType = nodeData.type as NodeType;
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
  setCanvases: React.Dispatch<React.SetStateAction<{ id: string }[]>>
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

  // Delete attachments, files, and drawings for each node
  for (const nodeId of nodeIds) {
    const attachments = await getAttachments(nodeId);
    for (const attachment of attachments) {
      await removeAttachment(attachment.id);
    }

    // Delete drawing for draw nodes
    const { data: nodeData } = await supabase
      .from('nodes')
      .select('type')
      .eq('id', nodeId)
      .single();

    if (nodeData && nodeData.type === 'draw') {
      await removeDrawing(nodeId);
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

  const canvas = toCamelCase(
    canvasData
  ) as Database['public']['Tables']['canvases']['Row'] & {
    nodes: Array<
      Database['public']['Tables']['nodes']['Row'] & {
        nodeTags?: Array<{ tag: string }>;
        nodeAttachments?: Array<
          Database['public']['Tables']['node_attachments']['Row']
        >;
      }
    >;
    edges: Array<Database['public']['Tables']['edges']['Row']>;
  };

  const organizedNodes = await Promise.all(
    canvas.nodes.map(async (node) => {
      console.log('CanvasService: Raw node data:', node);
      const nodeType = node.type?.toLowerCase() as NodeType;
      const specificNodeData = await getNodeSpecificData(node.id, nodeType);
      const processedData = processNodeSpecificData(
        nodeType,
        specificNodeData || {}
      );

      const tags = node.nodeTags ? node.nodeTags.map((tag) => tag.tag) : [];
      const attachments = node.nodeAttachments
        ? node.nodeAttachments.map((attachment) => ({
            id: attachment.id,
            type: attachment.type,
            name: attachment.file_name,
            size: attachment.file_size,
            storagePath: attachment.storage_path,
            mimeType: attachment.mime_type,
            url: attachment.url,
            isFile: attachment.is_file
          }))
        : [];

      delete node.nodeTags;
      delete node.nodeAttachments;

      // Handle draw node specific processing
      if (nodeType === 'draw') {
        const drawData = await getNodeSpecificData(node.id, 'draw');
        if (drawData) {
          processedData.drawingFileUrl = drawData.drawing_file_url;
          processedData.currentTool = drawData.current_tool;
          processedData.settings = drawData.settings;
          processedData.currentColor = drawData.current_color;
          processedData.currentStrokeWidth = drawData.current_stroke_width;
        }
      }

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

export interface CanvasState {
  nodes: Node[];
  [key: string]: unknown;
}

export interface Node {
  id: string;
  type: string;
  data: NodeData;
  [key: string]: unknown;
}

export interface NodeData {
  drawingFileUrl?: string;
  currentTool?: string;
  settings?: unknown;
  currentColor?: string;
  currentStrokeWidth?: number;
  columns?: unknown[];
  rows?: unknown[];
  defaultColumnType?: string;
  dateFormat?: string;
  tags?: string[];
  attachedFiles?: AttachedFile[];
  [key: string]: unknown;
}

export interface AttachedFile {
  type: string;
  name: string;
  size: number;
  storagePath: string;
  mimeType: string;
  url: string;
  isFile: boolean;
}

export const saveCanvasState = async (
  canvasId: string,
  canvasState: CanvasState
) => {
  const { nodes, ...canvasData } = canvasState;

  // Update canvas data
  const { error: canvasUpdateError } = await supabase
    .from('canvases')
    .update(
      toSnakeCase(
        canvasData
      ) as Database['public']['Tables']['canvases']['Update']
    )
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
      .update(
        toSnakeCase(nodeData) as Database['public']['Tables']['nodes']['Update']
      )
      .eq('id', nodeId);

    if (nodeUpdateError) {
      console.error('canvasService: Error updating node:', nodeUpdateError);
      throw nodeUpdateError;
    }

    // Update node-specific data
    if (nodeType !== 'selection_menu') {
      let specificUpdates: Record<string, unknown> = {};

      if (nodeType === 'draw') {
        if (data.drawingFileUrl) {
          const svgPath = await uploadSVGToBucket(nodeId, data.drawingFileUrl);
          if (svgPath) {
            data.drawingFileUrl = svgPath;
          }
        }

        specificUpdates = {
          drawing_file_url: data.drawingFileUrl,
          current_tool: data.currentTool,
          settings: data.settings,
          current_color: data.currentColor || 'None',
          current_stroke_width: data.currentStrokeWidth || 1
        };
      } else if (nodeType === 'table') {
        specificUpdates = {
          columns: data.columns,
          rows: data.rows,
          default_column_type: data.defaultColumnType,
          settings: data.settings,
          date_format: data.dateFormat
        };
      } else {
        specificUpdates = data;
      }

      const { error: specificNodeUpdateError } = await updateNodeSpecificData(
        nodeId,
        nodeType as NodeType,
        specificUpdates
      );

      if (specificNodeUpdateError) {
        console.error(
          `canvasService: Error updating ${nodeType} node:`,
          specificNodeUpdateError
        );
        throw specificNodeUpdateError;
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
