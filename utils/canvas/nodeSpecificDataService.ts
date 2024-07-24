import { createClient } from '@/utils/supabase/supabaseClient';
import { saveDrawing, getDrawing } from '@/utils/canvas/drawNodeService';

const supabase = createClient();

type NodeType = 'note' | 'task' | 'calendar' | 'table' | 'draw';

interface DrawNodeData {
  id: string;
  node_id: string | null;
  current_tool: string | null;
  drawing_file_url: string | null;
  layers: string | null; // JSON string
  settings: string | null; // JSON string
  zoom_level: number | null;
}

export const getNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType
): Promise<DrawNodeData | null> => {
  const { data, error } = await supabase
    .from(`${nodeType}_nodes`)
    .select('*')
    .eq('node_id', nodeId)
    .single();

  if (error) {
    console.error(`Error fetching ${nodeType} data:`, error);
    return null;
  }

  return data as DrawNodeData;
};

export const updateNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType,
  updates: any
) => {
  if (nodeType === 'draw') {
    const { drawingData, ...otherUpdates } = updates;
    if (drawingData) {
      const result = await saveDrawing(nodeId, drawingData);
      if (result) {
        otherUpdates.drawing_file_url = result.drawingFileUrl;
      }
    }
    updates = otherUpdates;
  }

  const { data, error } = await supabase
    .from(`${nodeType}_nodes`)
    .update(updates)
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
  nodeType: NodeType,
  initialData: any
) => {
  const { data, error } = await supabase
    .from(`${nodeType}_nodes`)
    .insert({ ...initialData, node_id: nodeId })
    .select()
    .single();

  if (error) {
    console.error(`Error creating ${nodeType} data:`, error);
    return { error };
  }

  return { data };
};

export const deleteNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType
) => {
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

// Helper function to process node-specific data
export const processNodeSpecificData = (nodeType: NodeType, data: any) => {
  switch (nodeType) {
    case 'note':
      return { content: data.content || '' };
    case 'task':
      return {
        tasks: data.tasks ? JSON.parse(data.tasks) : [],
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
    case 'table':
      return {
        columns: data.columns ? JSON.parse(data.columns) : [],
        rows: data.rows ? JSON.parse(data.rows) : [],
        defaultColumnType: data.default_column_type || 'text',
        defaultLocale: data.default_locale || 'en-US'
      };
    case 'draw':
      return {
        currentTool: data.current_tool || '',
        drawingFileUrl: data.drawing_file_url || '',
        layers: data.layers ? JSON.parse(data.layers) : [],
        settings: data.settings ? JSON.parse(data.settings) : {}
      };
    default:
      return {};
  }
};

// Function to fetch drawing data
export const getNodeDrawingData = async (nodeId: string) => {
  const drawingData = await getDrawing(nodeId);
  return drawingData;
};
