import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../utils/supabaseClient";
import { User } from "@supabase/supabase-js";

const ProfileForm = ({ user }: { user: User }) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .upsert({ ...data, id: user.id })
        .single();

      if (error) {
        console.error("Error updating profile:", error);
      }
      // Show success message or redirect to profile page
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error message
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
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
