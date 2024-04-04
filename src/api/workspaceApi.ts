// src/api/workspaceApi.ts
import { supabase } from "../shared/supabase/supabaseClient";

export const getWorkspaces = async (userId: string) => {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", userId);

  if (error) {
    console.error("Error fetching workspaces:", error);
    throw error;
  }

  return data;
};

export const createWorkspace = async (
  userId: string,
  name: string,
  description?: string
) => {
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ owner_id: userId, name, description })
    .single();

  if (error) {
    console.error("Error creating workspace:", error);
    throw error;
  }

  return data;
};

export const updateWorkspace = async (
  workspaceId: string,
  updates: Partial<{ name: string; description: string }>
) => {
  const { data, error } = await supabase
    .from("workspaces")
    .update(updates)
    .eq("id", workspaceId)
    .single();

  if (error) {
    console.error("Error updating workspace:", error);
    throw error;
  }

  return data;
};

export const deleteWorkspace = async (workspaceId: string) => {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    console.error("Error deleting workspace:", error);
    throw error;
  }
};
