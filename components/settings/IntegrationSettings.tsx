import React from "react";
import { useForm } from "react-hook-form";
import { updateIntegrationSettings } from "../../app/api/user/settingsApi";

interface FormData {
  slackWebhook: string;
  jiraUrl: string;
}

const IntegrationSettings: React.FC = () => {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = async (data: any) => {
    try {
      await updateIntegrationSettings(data);
      // Show success message
    } catch (error) {
      console.error("Error updating integration settings:", error);
      // Show error message
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Integration Settings</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="slackWebhook" className="block font-medium mb-1">
            Slack Webhook URL
          </label>
          <input
            type="text"
            id="slackWebhook"
            {...register("slackWebhook")}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="jiraUrl" className="block font-medium mb-1">
            Jira URL
          </label>
          <input
            type="text"
            id="jiraUrl"
            {...register("jiraUrl")}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default IntegrationSettings;
