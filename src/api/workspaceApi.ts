// src/api/workspaceApi.ts
import { supabase } from "../shared/supabase/supabaseClient";

export const getUserWorkspaces = async (userId: string) => {
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error getting user workspaces:", error.message);
    throw error;
  }

  return workspaces;
};

export const createWorkspace = async (userId: string, name: string) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ user_id: userId, name })
    .single();

  if (error) {
    console.error("Error creating workspace:", error.message);
    throw error;
  }

  return workspace;
};

export const updateWorkspace = async (workspaceId: string, updates: any) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .update(updates)
    .eq("id", workspaceId)
    .single();

  if (error) {
    console.error("Error updating workspace:", error.message);
    throw error;
  }

  return workspace;
};

export const deleteWorkspace = async (workspaceId: string) => {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    console.error("Error deleting workspace:", error.message);
    throw error;
  }
};
