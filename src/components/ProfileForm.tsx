// src/components/ProfileForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { updateUserProfile } from "../api/userApi";
import { User } from "@supabase/supabase-js";

interface ProfileFormProps {
  user: User;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await updateUserProfile(user.id, data);
      // Show success message or redirect to profile page
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error message
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Add input fields for profile information */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
