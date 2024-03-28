// src/components/Settings/ThemeCustomization.tsx

import React from "react";
import { useForm } from "react-hook-form";
import { updateThemeSettings } from "../../api/settingsApi";

const ThemeCustomization: React.FC = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await updateThemeSettings(data);
      // Show success message
    } catch (error) {
      console.error("Error updating theme settings:", error);
      // Show error message
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Theme Customization</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="primaryColor" className="block font-medium mb-1">
            Primary Color
          </label>
          <input
            type="color"
            id="primaryColor"
            {...register("primaryColor")}
            className="w-full h-10 border-none"
          />
        </div>
        <div>
          <label htmlFor="secondaryColor" className="block font-medium mb-1">
            Secondary Color
          </label>
          <input
            type="color"
            id="secondaryColor"
            {...register("secondaryColor")}
            className="w-full h-10 border-none"
          />
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

export default ThemeCustomization;
