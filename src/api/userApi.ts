import { supabase } from "../shared/supabase/supabaseClient";

// Call this function after user signs up
export const createUserProfile = async (
  userId: string,
  { username }: { username: string }
) => {
  const { data, error } = await supabase.from("profiles").upsert(
    [
      {
        user_id: userId,
        username: username,
      },
    ],
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    console.error("Error creating or updating user profile:", error);
    throw error;
  }

  return data;
};

export const updateUserProfile = async (
  userId: string,
  {
    username,
    email,
    avatar_url,
  }: { username: string; email: string; avatar_url: string }
) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, username, email, avatar_url },
        { onConflict: "id" }
      );

    if (error) throw error;
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

export const uploadProfilePicture = async (userId: string, file: File) => {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExtension}`;
  const filePath = `avatars/${fileName}`;

  let { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  let { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return data.publicUrl;
};
