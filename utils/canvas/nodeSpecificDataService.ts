import { createClient } from '@/utils/supabase/supabaseClient';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

const supabase = createClient();

type NodeType = 'note' | 'task' | 'calendar' | 'table' | 'draw';

interface DrawNodeData {
  id: string;
  node_id: string | null;
  current_tool: string | null;
  drawing_file_url: string | null;
  layers: string | null;
  settings: string | null;
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
    .update(toSnakeCase(updates))
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
        settings: data.settings ? JSON.parse(data.settings) : {},
        zoomLevel: data.zoom_level || 1
      };
    default:
      return {};
  }
};

export const getNodeDrawingData = async (nodeId: string) => {
  const drawingData = await getDrawing(nodeId);
  return drawingData;
};

export const saveDrawing = async (nodeId: string, drawingData: string) => {
  if (typeof drawingData === 'string' && drawingData.includes(',')) {
    const base64Data = drawingData.split(',')[1];
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(
      (res) => res.blob()
    );

    const { data, error } = await supabase.storage
      .from('drawings')
      .upload(`${nodeId}.png`, blob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Error saving drawing:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('drawings')
      .getPublicUrl(`${nodeId}.png`);

    const drawingFileUrl = publicUrlData.publicUrl;

    const { data: updateData, error: updateError } = await supabase
      .from('draw_nodes')
      .update({ drawing_file_url: drawingFileUrl })
      .eq('node_id', nodeId);

    if (updateError) {
      console.error('Error updating draw node data:', updateError);
      return null;
    }

    return { drawingFileUrl };
  } else {
    console.error('Invalid drawing data format');
    return null;
  }
};

export const getDrawing = async (nodeId: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('drawings')
    .download(`${nodeId}.png`);

  if (error) {
    console.error('Error fetching drawing:', error);
    return null;
  }

  if (data) {
    const blob = new Blob([data], { type: 'image/png' });
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  return null;
};

export const removeDrawing = async (nodeId: string) => {
  const { error } = await supabase.storage
    .from('drawings')
    .remove([`${nodeId}.png`]);

  if (error) {
    console.error('Error removing drawing:', error);
    return false;
  }

  return true;
};
