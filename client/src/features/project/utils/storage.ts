import { Node as ReactFlowNode, Edge as ReactFlowEdge } from "reactflow";
import { supabase } from "../../../services/api/supabase/supabaseClient";

export const saveMindmap = async (
  title: string,
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[]
) => {
  const { data, error } = await supabase
    .from("mindmaps")
    .insert({ title, nodes, edges });

  if (error) {
    console.error("Error saving mindmap:", error);
  }
};

export const loadMindmap = async (mindmapId: number) => {
  const { data, error } = await supabase
    .from("mindmaps")
    .select("nodes, edges")
    .eq("id", mindmapId)
    .single();

  if (error) {
    console.error("Error loading mindmap:", error);
    return { nodes: [], edges: [] };
  }

  return data;
};

export const shareMindmap = async (
  mindmapId: number,
  userId: string,
  accessLevel: string
) => {
  const { error } = await supabase.from("mindmap_shares").insert({
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
