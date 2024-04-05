// src/api/ideaApi.ts
import { supabase } from "../supabase/supabaseClient";

export const getIdeas = async (projectId: string) => {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching ideas:", error);
    throw error;
  }

  return data;
};

export const createIdea = async (
  projectId: string,
  title: string,
  description?: string
) => {
  const { data, error } = await supabase
    .from("ideas")
    .insert({ project_id: projectId, title, description })
    .single();

  if (error) {
    console.error("Error creating idea:", error);
    throw error;
  }

  return data;
};

export const updateIdea = async (
  ideaId: string,
  updates: Partial<{ title: string; description: string }>
) => {
  const { data, error } = await supabase
    .from("ideas")
    .update(updates)
    .eq("id", ideaId)
    .single();

  if (error) {
    console.error("Error updating idea:", error);
    throw error;
  }

  return data;
};

export const deleteIdea = async (ideaId: string) => {
  const { error } = await supabase.from("ideas").delete().eq("id", ideaId);

  if (error) {
    console.error("Error deleting idea:", error);
    throw error;
  }
};
