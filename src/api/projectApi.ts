// src/api/projectApi.ts
import { supabase } from "../shared/supabase/supabaseClient";

export const getProjectsByWorkspaceId = async (workspaceId: string) => {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Error getting projects by workspace ID:", error.message);
    throw error;
  }

  return projects;
};

export const createProject = async (workspaceId: string, name: string) => {
  const { data: project, error } = await supabase
    .from("projects")
    .insert({ workspace_id: workspaceId, name })
    .single();

  if (error) {
    console.error("Error creating project:", error.message);
    throw error;
  }

  return project;
};

export const updateProject = async (projectId: string, updates: any) => {
  const { data: project, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error updating project:", error.message);
    throw error;
  }

  return project;
};

export const deleteProject = async (projectId: string) => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error.message);
    throw error;
  }
};
