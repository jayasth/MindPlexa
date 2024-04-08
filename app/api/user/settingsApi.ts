import axios from "axios";
import { Settings } from "http2";

export const updateNotificationSettings = async (settings: Settings) => {
  try {
    const response = await axios.put("/api/settings/notifications", settings);
    return response.data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

export const updateIntegrationSettings = async (settings: Settings) => {
  try {
    const response = await axios.put("/api/settings/integrations", settings);
    return response.data;
  } catch (error) {
    console.error("Error updating integration settings:", error);
    throw error;
  }
};

export const updateThemeSettings = async (settings: Settings) => {
  try {
    const response = await axios.put("/api/settings/theme", settings);
    return response.data;
  } catch (error) {
    console.error("Error updating theme settings:", error);
    throw error;
  }
};
