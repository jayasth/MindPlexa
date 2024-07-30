import { createClient } from '@/utils/supabase/supabaseClient';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

const supabase = createClient();

type NodeType = 'note' | 'task' | 'calendar' | 'table' | 'draw';

export const uploadSVGToBucket = async (nodeId: string, svgContent: string) => {
  // Remove the data URL prefix if present
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
  nodeType: NodeType
): Promise<any | null> => {
  if (nodeType === 'draw') {
    return getDrawNodeData(nodeId);
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

    let drawingData = '';
    if (data && data.drawing_file_url) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('drawings')
        .download(data.drawing_file_url);

      if (fileError) throw fileError;

      const svgContent = await fileData.text();
      const base64Content = btoa(svgContent);
      drawingData = `data:image/svg+xml;base64,${base64Content}`;
    }

    return {
      ...data,
      drawingData,
      currentColor: data.current_color,
      currentStrokeWidth: data.current_stroke_width,
      currentTool: data.current_tool,
      settings:
        typeof data.settings === 'string'
          ? data.settings
          : JSON.stringify(data.settings)
    };
  } catch (error) {
    console.error('Error fetching draw node data:', error);
    throw error;
  }
};

export const updateNodeSpecificData = async (
  nodeId: string,
  nodeType: NodeType,
  updates: any
) => {
  if (nodeType === 'draw') {
    let svgPath = updates.drawingFileUrl;
    if (
      updates.drawingFileUrl &&
      typeof updates.drawingFileUrl === 'string' &&
      updates.drawingFileUrl.startsWith('data:image/svg+xml')
    ) {
      svgPath = await uploadSVGToBucket(nodeId, updates.drawingFileUrl);
    }

    const updateData = {
      ...toSnakeCase(updates),
      drawing_file_url: svgPath,
      current_color: updates.currentColor,
      current_stroke_width: updates.currentStrokeWidth,
      current_tool: updates.currentTool,
      settings: JSON.stringify(updates.settings)
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

    return { data };
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
  if (nodeType === 'draw') {
    if (initialData.drawingFileUrl) {
      const svgPath = await uploadSVGToBucket(
        nodeId,
        initialData.drawingFileUrl
      );
      if (svgPath) {
        initialData.drawingFileUrl = svgPath;
      }
    }

    const { data, error } = await supabase
      .from('draw_nodes')
      .insert({
        ...toSnakeCase(initialData),
        node_id: nodeId,
        current_color: initialData.currentColor,
        current_stroke_width: initialData.currentStrokeWidth,
        current_tool: initialData.currentTool
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating draw node data:', error);
      return { error };
    }

    return { data: toCamelCase(data) };
  }

  const { data, error } = await supabase
    .from(`${nodeType}_nodes`)
    .insert({ ...toSnakeCase(initialData), node_id: nodeId })
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
  nodeType: NodeType
) => {
  if (nodeType === 'draw') {
    const { error } = await supabase
      .from('draw_nodes')
      .delete()
      .eq('node_id', nodeId);

    if (error) {
      console.error('Error deleting draw node data:', error);
      return { error };
    }

    // Delete the SVG file from the bucket
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
        // Add table-specific data processing here
      };
    default:
      return {};
  }
};
