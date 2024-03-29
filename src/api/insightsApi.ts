// src/api/insightsApi.ts

import axios from "axios";

export const getUserInsights = async () => {
  try {
    const response = await axios.get("/api/insights");
    return response.data;
  } catch (error) {
    console.error("Error fetching user insights:", error);
    throw error; // Throw the error to be caught in the component
  }
};
