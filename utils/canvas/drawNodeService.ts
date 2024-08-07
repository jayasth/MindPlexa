import { createClient } from '@/utils/supabase/supabaseClient';

const supabase = createClient();

export const saveDrawing = async (nodeId: string, drawingData: string) => {
  if (drawingData.startsWith('data:image/svg+xml')) {
    const base64Data = drawingData.split(',')[1];
    const svgContent = atob(base64Data);

    const { data, error } = await supabase.storage
      .from('drawings')
      .upload(`${nodeId}.svg`, svgContent, {
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

    return { drawingFileUrl: publicUrlData.publicUrl };
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
    const text = await data.text();
    return `data:image/svg+xml;base64,${btoa(text)}`;
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
