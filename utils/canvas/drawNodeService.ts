import { createClient } from '@/utils/supabase/supabaseClient';

const supabase = createClient();

export const saveDrawing = async (nodeId: string, drawingData: string) => {
  if (
    typeof drawingData === 'string' &&
    (drawingData.startsWith('data:image/svg+xml;base64,') || drawingData === '')
  ) {
    let svgContent;
    if (drawingData === '') {
      // If drawingData is empty, create an empty SVG
      svgContent = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    } else {
      const base64Data = drawingData.split(',')[1];
      svgContent = atob(base64Data);
    }

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });

    const { error } = await supabase.storage
      .from('drawings')
      .upload(`${nodeId}.svg`, blob, {
        contentType: 'image/svg+xml',
        upsert: true
      });

    if (error) {
      console.error('Error saving drawing:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('drawings')
      .getPublicUrl(`${nodeId}.svg`);

    const drawingFileUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('draw_nodes')
      .update({ drawing_file_url: drawingFileUrl })
      .eq('node_id', nodeId);

    if (updateError) {
      console.error('Error updating draw node data:', updateError);
      return null;
    }

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
  try {
    // First check if the drawing exists
    const { data: drawNodeData } = await supabase
      .from('draw_nodes')
      .select('drawing_file_url')
      .eq('node_id', nodeId)
      .single();

    if (!drawNodeData?.drawing_file_url) {
      return null;
    }

    const { data, error } = await supabase.storage
      .from('drawings')
      .download(`${nodeId}.svg`);

    if (error) {
      if (error.message.includes('404')) {
        // Drawing doesn't exist yet, return null instead of throwing
        return null;
      }
      console.error('Error fetching drawing:', error);
      throw error;
    }

    if (data) {
      const svgContent = await data.text();
      return `data:image/svg+xml;base64,${btoa(svgContent)}`;
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    console.error('Unexpected error in getDrawing:', error);
    throw error;
  }
};

export const removeDrawing = async (nodeId: string) => {
  const { error } = await supabase.storage
    .from('drawings')
    .remove([`${nodeId}.svg`]);

  if (error) {
    console.error('Error removing drawing:', error);
    return false;
  }

  return true;
};

export const removeAllDrawingsForUser = async (userId: string) => {
  // Get canvas IDs for user
  const { data: canvasIds } = await supabase
    .from('canvases')
    .select('id')
    .eq('user_id', userId);

  if (!canvasIds?.length) return true;

  // Get node IDs from canvas links
  const { data: nodeIds } = await supabase
    .from('node_canvas_link')
    .select('node_id')
    .in(
      'canvas_id',
      canvasIds.map((c) => c.id)
    );

  if (!nodeIds?.length) return true;

  // Get drawings
  const { data: drawings, error } = await supabase
    .from('draw_nodes')
    .select('drawing_file_url')
    .in(
      'node_id',
      nodeIds.map((n) => n.node_id)
    );

  if (error) {
    console.error('Error fetching drawings:', error);
    return false;
  }

  const paths = drawings
    .map((drawing) => drawing.drawing_file_url)
    .filter((url): url is string => url !== null);

  if (paths.length === 0) return true;

  const { error: deleteError } = await supabase.storage
    .from('drawings')
    .remove(paths);

  if (deleteError) {
    console.error('Error deleting drawings:', deleteError);
    return false;
  }

  return true;
};
