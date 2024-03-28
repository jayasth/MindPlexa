// src/components/ChangePasswordForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { changeUserPassword } from "../api/userApi";
import { useUser } from "../utils/useUser";

const ChangePasswordForm: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const { user } = useUser();

  const onSubmit = async (data: any) => {
    if (!user) return;

    try {
      await changeUserPassword(user.id, data.newPassword);
      // Show success message
    } catch (error) {
      console.error("Error changing password:", error);
      // Show error message
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Add input fields for current and new password */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
