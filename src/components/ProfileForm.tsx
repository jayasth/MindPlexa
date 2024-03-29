// src/components/ProfileForm.tsx

import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { updateUserProfile, uploadProfilePicture } from "../api/userApi";
import { User } from "@supabase/supabase-js";

interface ProfileFormProps {
  user: User;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const { register, handleSubmit } = useForm();
  const fileInput = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: any) => {
    try {
      let avatar_url = user.user_metadata.avatar_url;
      if (fileInput.current?.files?.length) {
        avatar_url = await uploadProfilePicture(
          user.id,
          fileInput.current.files[0]
        );
      }
      await updateUserProfile(user.id, { ...data, avatar_url });
      // Show success message or redirect to profile page
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error message
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="avatar" className="block font-medium mb-1">
            Profile Picture
          </label>
          <input
            type="file"
            id="avatar"
            ref={fileInput}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name", { required: true })}
            defaultValue={user.user_metadata.name}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email", { required: true })}
            defaultValue={user.email}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
