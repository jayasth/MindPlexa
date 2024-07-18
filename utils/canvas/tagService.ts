import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db';

const supabase = createClient();

export const handleTags = async (
  nodeId: string,
  tags: string[]
): Promise<{ error?: any }> => {
  const { error: tagDeleteError } = await supabase
    .from('node_tags')
    .delete()
    .eq('node_id', nodeId);

  if (tagDeleteError) {
    console.error(
      'nodeTagService: Error deleting existing tags:',
      tagDeleteError
    );
    return { error: tagDeleteError };
  }

  for (const tag of tags) {
    const { error: insertTagError } = await supabase
      .from('node_tags')
      .insert({ node_id: nodeId, tag });

    if (insertTagError) {
      console.error('nodeTagService: Error inserting tag:', insertTagError);
      return { error: insertTagError };
    }
  }

  return {};
};
