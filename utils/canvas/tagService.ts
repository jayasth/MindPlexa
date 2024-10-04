import { createClient } from '@/utils/supabase/supabaseClient';

export const handleTags = async (
  nodeId: string,
  tags: string[]
): Promise<{ error?: unknown }> => {
  const supabase = createClient();

  // Make a copy of the tags array
  const tagsCopy = [...tags];

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

  for (const tag of tagsCopy) {
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
