import { createClient } from '@/utils/supabase/supabaseClient';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

const supabase = createClient();

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
