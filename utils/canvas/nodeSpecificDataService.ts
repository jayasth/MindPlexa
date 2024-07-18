import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';

const supabase = createClient();

type NodeType = 'note' | 'task' | 'calendar' | 'table' | 'draw';

export const getNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType
) => {
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

export const updateNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType,
  updates: any
) => {
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
        events: data.events ? JSON.parse(data.events) : [],
        view: data.view || 'month',
        defaultView: data.default_view || 'month',
        eventCategories: data.event_categories
          ? JSON.parse(data.event_categories)
          : [],
        exportSettings: data.export_settings
          ? JSON.parse(data.export_settings)
          : {},
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
        drawingData: data.drawing_data || '',
        backgroundImageUrl: data.background_image_url || '',
        brushPresets: data.brush_presets ? JSON.parse(data.brush_presets) : [],
        colorPalette: data.color_palette ? JSON.parse(data.color_palette) : [],
        layers: data.layers ? JSON.parse(data.layers) : [],
        panOffset: data.pan_offset
          ? JSON.parse(data.pan_offset)
          : { x: 0, y: 0 },
        shapeElements: data.shape_elements
          ? JSON.parse(data.shape_elements)
          : [],
        symmetrySettings: data.symmetry_settings
          ? JSON.parse(data.symmetry_settings)
          : {},
        textElements: data.text_elements ? JSON.parse(data.text_elements) : [],
        zoomLevel: data.zoom_level || 1.0
      };
    default:
      return {};
  }
};
