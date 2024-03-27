// src/api/ideaVaultApi.ts
import axios from "axios";

export const getIdeasForUser = async () => {
  try {
    const response = await axios.get("/api/ideas");
    return response.data;
  } catch (error) {
    console.error("Error fetching ideas:", error);
    throw error;
  }
};

// ... (other API functions)

export const saveIdeaToVault = async (idea: any) => {
  try {
    const response = await axios.post("/api/ideas", { idea });
    return response.data;
  } catch (error) {
    console.error("Error saving idea to vault:", error);
    throw error;
  }
};
