import React from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../utils/supabaseClient";
import { useUser } from "../hooks/useUser";

const ChangePasswordForm: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const { user } = useUser();

  const onSubmit = async (data: any) => {
    if (!user) return;

    try {
      const { data: user, error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        console.error("Error changing password:", error);
      }
      // Show success message
    } catch (error) {
      console.error("Error changing password:", error);
      // Show error message
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block font-medium mb-1">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            {...register("currentPassword", { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block font-medium mb-1">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            {...register("newPassword", { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
