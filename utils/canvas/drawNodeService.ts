import { createClient } from '@/utils/supabase/supabaseClient';
import { toCamelCase, toSnakeCase } from '@/utils/caseConversion';
import { uploadSVGToBucket } from './nodeSpecificDataService';

const supabase = createClient();

export const saveDrawing = async (nodeId: string, drawingData: string) => {
  if (
    typeof drawingData === 'string' &&
    drawingData.startsWith('data:image/svg+xml')
  ) {
    const svgPath = await uploadSVGToBucket(nodeId, drawingData);

    if (!svgPath) {
      console.error('Error saving drawing');
      return null;
    }

    const { data: updateData, error: updateError } = await supabase
      .from('draw_nodes')
      .update({ drawing_file_url: svgPath })
      .eq('node_id', nodeId);

    if (updateError) {
      console.error('Error updating draw node data:', updateError);
      return null;
    }

    return { drawingFileUrl: svgPath };
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
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
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
