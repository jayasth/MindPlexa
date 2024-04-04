// src/features/AIAssistant/aiAssistantApi.ts
import axios from "axios";

export const generateIdeasAPI = async (prompt: string): Promise<string[]> => {
  const response = await axios.post("/api/ai-assistant/generate-ideas", {
    prompt,
  });
  return response.data;
};
