import { createClient } from '@/utils/supabase/supabaseClient';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';
import { getDrawing } from './drawNodeService';
const supabase = createClient();

type NodeType = 'note' | 'task' | 'calendar' | 'table' | 'draw';
type SpecialNodeType = 'selection_menu';

// Define a type for the settings
type DrawNodeSettings = {
  [key: string]: {
    color: string;
    strokeWidth: number;
    opacity: number;
  };
};

export const uploadSVGToBucket = async (nodeId: string, svgContent: string) => {
  const svgData = svgContent.replace(/^data:image\/svg\+xml;base64,/, '');

  const { data, error } = await supabase.storage
    .from('drawings')
    .upload(`${nodeId}.svg`, Buffer.from(svgData, 'base64'), {
      contentType: 'image/svg+xml',
      upsert: true
    });

  if (error) {
    console.error('Error uploading SVG to bucket:', error);
    return null;
  }

  return data.path;
};

export const getNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType | SpecialNodeType
): Promise<Record<string, unknown> | null> => {
  if (nodeType === 'selection_menu') {
    return {};
  }

  if (nodeType === 'draw') {
    const drawData = await getDrawNodeData(nodeId);
    return drawData;
  }

  const { data, error } = await supabase
    .from(`${nodeType}_nodes`)
    .select('*')
    .eq('node_id', nodeId)
    .single();

  if (error) {
    console.error(`Error fetching ${nodeType} data:`, error);
    return null;
  }

  return data;
};

export const getDrawNodeData = async (nodeId: string) => {
  try {
    const { data, error } = await supabase
      .from('draw_nodes')
      .select('*')
      .eq('node_id', nodeId)
      .single();

    if (error) throw error;

    let drawingData: string | null = null;
    try {
      drawingData = await getDrawing(nodeId);
    } catch (drawingError) {
      console.error('Error fetching drawing:', drawingError);
      // Continue execution even if drawing fetch fails
    }

    return {
      ...data,
      drawingData,
      currentColor: data.current_color,
      currentStrokeWidth: data.current_stroke_width,
      currentTool: data.current_tool,
      settings:
        typeof data.settings === 'string'
          ? JSON.parse(data.settings)
          : data.settings
    };
  } catch (error) {
    console.error('Error fetching draw node data:', error);
    return null;
  }
};

export const updateNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType | SpecialNodeType,
  updates: Record<string, unknown>
) => {
  if (nodeType === 'selection_menu') {
    return { data: updates as Record<string, unknown> };
  }

  if (nodeType === 'draw') {
    let svgPath = updates.drawingFileUrl;
    if (
      updates.drawingData &&
      typeof updates.drawingData === 'string' &&
      updates.drawingData.startsWith('data:image/svg+xml;base64,')
    ) {
      svgPath = await uploadSVGToBucket(nodeId, updates.drawingData);
    }

    const updateData = {
      ...(toSnakeCase(updates) as Record<string, unknown>),
      current_tool: updates.currentTool as string | null | undefined,
      current_color: updates.currentColor as string | null | undefined,
      current_stroke_width: updates.currentStrokeWidth as
        | number
        | null
        | undefined,
      settings: updates.settings as DrawNodeSettings,
      drawing_file_url: svgPath as string | null | undefined
    };

    const { data, error } = await supabase
      .from('draw_nodes')
      .update(updateData)
      .eq('node_id', nodeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating draw node data:', error);
      return { error };
    }

    return { data: toCamelCase(data) };
  }

  const { data, error } = await supabase
    .from(`${nodeType}_nodes`)
    .update(toSnakeCase(updates) as Record<string, unknown>)
    .eq('node_id', nodeId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${nodeType} data:`, error);
    return { error };
  }

  return { data };
};

export const createNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType | SpecialNodeType,
  initialData: Record<string, unknown>
) => {
  if (nodeType === 'selection_menu') {
    return { data: initialData as Record<string, unknown> };
  }

  const { data: existingData, error: fetchError } = await supabase
    .from(`${nodeType}_nodes`)
    .select('*')
    .eq('node_id', nodeId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error(`Error fetching ${nodeType} data:`, fetchError);
    return { error: fetchError };
  }

  if (existingData) {
    console.log(
      `Record already exists for node_id ${nodeId} in ${nodeType}_nodes`
    );
    return { data: toCamelCase(existingData) };
  }

  if (nodeType === 'draw') {
    const drawNodeData = {
      node_id: nodeId,
      current_tool: initialData.currentTool as string | null | undefined,
      current_color: initialData.currentColor as string | null | undefined,
      current_stroke_width: initialData.currentStrokeWidth as
        | number
        | null
        | undefined,
      settings: initialData.settings as DrawNodeSettings,
      drawing_file_url: initialData.drawingFileUrl as string | null | undefined
    };

    const { data, error } = await supabase
      .from('draw_nodes')
      .insert(drawNodeData)
      .select()
      .single();

    if (error) {
      console.error('Error creating draw node data:', error);
      return { error };
    }

    return { data: toCamelCase(data) };
  }

  const nodeData = {
    ...(toSnakeCase(initialData) as Record<string, unknown>),
    node_id: nodeId
  };

  const { data, error } = await supabase
    .from(
      `${nodeType}_nodes` as
        | 'note_nodes'
        | 'task_nodes'
        | 'calendar_nodes'
        | 'table_nodes'
        | 'draw_nodes'
    )
    .insert(nodeData)
    .select()
    .single();

  if (error) {
    console.error(`Error creating ${nodeType} data:`, error);
    return { error };
  }

  return { data: toCamelCase(data) };
};

export const deleteNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType | SpecialNodeType
) => {
  if (nodeType === 'selection_menu') {
    return { success: true };
  }

  if (nodeType === 'draw') {
    const { error } = await supabase
      .from('draw_nodes')
      .delete()
      .eq('node_id', nodeId);

    if (error) {
      console.error('Error deleting draw node data:', error);
      return { error };
    }

    const { error: deleteError } = await supabase.storage
      .from('drawings')
      .remove([`${nodeId}.svg`]);

    if (deleteError) {
      console.error('Error deleting SVG file from bucket:', deleteError);
    }

    return { success: true };
  }

  const { error } = await supabase
    .from(`${nodeType}_nodes`)
    .delete()
    .eq('node_id', nodeId);

  if (error) {
    console.error(`Error deleting ${nodeType} data:`, error);
    return { error };
  }

  return { success: true };
};

export const processNodeSpecificData = (
  nodeType: NodeType | SpecialNodeType,
  data: Record<string, unknown>
) => {
  switch (nodeType) {
    case 'note':
      return { content: data.content || '' };
    case 'task':
      return {
        tasks: data.tasks ? JSON.parse(data.tasks as string) : [],
        completedTasks: data.completed_tasks || 0,
        totalTasks: data.total_tasks || 0,
        showCompletedTasks: data.show_completed_tasks ?? true,
        showDueDate: data.show_due_date ?? true,
        showPriority: data.show_priority ?? true,
        sortBy: data.sort_by || ''
      };
    case 'calendar':
      return {
        events: data.events || [],
        defaultView: data.default_view || 'month',
        timeZone: data.time_zone || 'UTC'
      };
    case 'draw':
      return {
        currentTool: data.current_tool,
        drawingFileUrl: data.drawing_file_url,
        drawingData: data.drawingData,
        settings: data.settings,
        currentColor: data.current_color,
        currentStrokeWidth: data.current_stroke_width
      };
    case 'table':
      return {
        columns: data.columns || [],
        rows: data.rows || [],
        defaultColumnType: data.default_column_type || 'text',
        dateFormat: data.date_format || 'yyyy-MM-dd',
        settings: data.settings || {}
      };
    case 'selection_menu':
      return {};
    default:
      return {};
  }
};
