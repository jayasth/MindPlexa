// src/api/projectApi.ts
import { supabase } from "../shared/supabase/supabaseClient";

export const getProjects = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }

  return data;
};

export const createProject = async (
  workspaceId: string,
  name: string,
  description?: string
) => {
  const { data, error } = await supabase
    .from("projects")
    .insert({ workspace_id: workspaceId, name, description })
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }

  return data;
};

export const updateProject = async (
  projectId: string,
  updates: Partial<{ name: string; description: string }>
) => {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error updating project:", error);
    throw error;
  }

  return data;
};

export const deleteProject = async (projectId: string) => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};
