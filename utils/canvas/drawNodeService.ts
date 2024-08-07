import { createClient } from '@/utils/supabase/supabaseClient';

const supabase = createClient();

export const saveDrawing = async (nodeId: string, drawingData: string) => {
  if (
    typeof drawingData === 'string' &&
    drawingData.startsWith('data:image/svg+xml;base64,')
  ) {
    const base64Data = drawingData.split(',')[1];
    const svgContent = atob(base64Data);

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });

    const { data, error } = await supabase.storage
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
    .download(`${nodeId}.svg`);

  if (error) {
    console.error('Error fetching drawing:', error);
    return null;
  }

  if (data) {
    const svgContent = await data.text();
    return `data:image/svg+xml;base64,${Buffer.from(svgContent, 'utf-8').toString('base64')}`;
  }

  return null;
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
