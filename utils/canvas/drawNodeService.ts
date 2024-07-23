import { createClient } from '@/utils/supabase/supabaseClient';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';

const supabase = createClient();

export const getDrawNodeData = async (nodeId: string) => {
  const { data, error } = await supabase
    .from('draw_nodes')
    .select('*')
    .eq('node_id', nodeId)
    .single();

  if (error) {
    console.error('Error fetching draw node data:', error);
    return null;
  }

  return toCamelCase(data);
};

export const updateDrawNodeData = async (nodeId: string, updates: any) => {
  // Remove 'drawingData' from updates if it exists
  const { drawingData, ...validUpdates } = updates;

  const { data, error } = await supabase
    .from('draw_nodes')
    .update(toSnakeCase(validUpdates))
    .eq('node_id', nodeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating draw node data:', error);
    return null;
  }

  return toCamelCase(data);
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

export const getDrawing = async (nodeId: string) => {
  const { data, error } = await supabase.storage
    .from('drawings')
    .download(`${nodeId}.png`);

  if (error) {
    console.error('Error fetching drawing:', error);
    return null;
  }

  return data;
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
