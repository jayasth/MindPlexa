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

export const saveIdeaToVault = async (idea: any) => {
  try {
    const response = await axios.post("/api/ideas", { idea });
    return response.data;
  } catch (error) {
    console.error("Error saving idea to vault:", error);
    throw error;
  }
};

export const deleteIdea = async (ideaId: string) => {
  try {
    await axios.delete(`/api/ideas/${ideaId}`);
  } catch (error) {
    console.error("Error deleting idea:", error);
    throw error;
  }
};

export const createIdea = async (idea: {
  title: string;
  description: string;
  tags: string[];
}) => {
  try {
    const response = await axios.post("/api/ideas", idea);
    return response.data;
  } catch (error) {
    console.error("Error creating idea:", error);
    throw error;
  }
};

export const updateIdea = async (
  ideaId: string,
  updatedIdea: {
    title: string;
    description: string;
    tags: string[];
  }
) => {
  try {
    const response = await axios.put(`/api/ideas/${ideaId}`, updatedIdea);
    return response.data;
  } catch (error) {
    console.error("Error updating idea:", error);
    throw error;
  }
};
