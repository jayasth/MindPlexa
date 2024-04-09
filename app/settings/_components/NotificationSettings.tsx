import React from "react";
import { useForm } from "react-hook-form";
import { updateNotificationSettings } from "@/app/api/user/settingsApi";

const NotificationSettings: React.FC = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await updateNotificationSettings(data);
      // Show success message
    } catch (error) {
      console.error("Error updating notification settings:", error);
      // Show error message
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Notification Settings</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifications"
            {...register("emailNotifications")}
            className="mr-2"
          />
          <label htmlFor="emailNotifications">Email Notifications</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="pushNotifications"
            {...register("pushNotifications")}
            className="mr-2"
          />
          <label htmlFor="pushNotifications">Push Notifications</label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default NotificationSettings;
