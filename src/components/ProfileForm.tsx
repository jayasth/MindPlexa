import React from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../shared/utils/supabaseClient";
import { User } from "@supabase/supabase-js";

interface ProfileFormData {
  username: string;
  avatar_url?: string;
  email: string;
}

const ProfileForm = ({ user }: { user: User }) => {
  const { register, handleSubmit, setValue } = useForm<ProfileFormData>();

  React.useEffect(() => {
    setValue("username", user.user_metadata?.full_name || "");
    if (user.email) {
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (!user.id) {
        throw new Error("User ID is undefined");
      }

      const updates = {
        ...data,
        id: user.id,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      alert(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="username" className="block font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="username"
            {...register("username", { required: true })}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly
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
