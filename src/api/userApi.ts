// src/api/userApi.ts
import { supabase } from "../utils/supabaseClient";

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const changeUserPassword = async (
  userId: string,
  newPassword: string
) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error changing user password:", error);
    throw error;
  }
};
