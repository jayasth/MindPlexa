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
  const { data, error } = await supabase
    .from('draw_nodes')
    .update(toSnakeCase(updates))
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
  // Check if drawingData is a string and contains a comma to split
  if (typeof drawingData === 'string' && drawingData.includes(',')) {
    // Convert base64 to Blob
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

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('drawings')
      .getPublicUrl(`${nodeId}.png`);

    // Update the draw_nodes table with the public URL
    const { data: updateData, error: updateError } = await supabase
      .from('draw_nodes')
      .update({ drawing_file_url: publicUrlData.publicUrl })
      .eq('node_id', nodeId);

    if (updateError) {
      console.error('Error updating draw node data:', updateError);
      return null;
    }

    return data;
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
