import { Edge } from "reactflow";
import { supabase } from "../../../utils/supabaseClient";

export const saveMindmap = async (
  mindmapId: number,
  nodes: Node[],
  edges: Edge[]
) => {
  const { error } = await supabase
    .from("mindmaps")
    .update({ nodes, edges })
    .eq("id", mindmapId);

  if (error) {
    console.error("Error saving mindmap:", error);
  }
};

export const loadMindmap = async (userId: string) => {
  const { data, error } = await supabase
    .from("mindmaps")
    .select("id, nodes, edges")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error loading mindmap:", error);
    return { id: null, nodes: [], edges: [] };
  }

  return data;
};

export const shareMindmap = async (
  mindmapId: number,
  userId: string,
  accessLevel: string
) => {
  const { error } = await supabase
    .from("mindmap_shares")
    .insert({
      mindmap_id: mindmapId,
      user_id: userId,
      access_level: accessLevel,
    });

  if (error) {
    console.error("Error sharing mindmap:", error);
  }
};

export const getSharedMindmaps = async (userId: string) => {
  const { data, error } = await supabase
    .from("mindmap_shares")
    .select("mindmap_id, access_level")
    .eq("user_id", userId);

  if (error) {
    console.error("Error getting shared mindmaps:", error);
    return [];
  }

  return data;
};
