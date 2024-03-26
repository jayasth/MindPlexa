import axios from "axios";

export const createBrainstormingSession = async (sessionData: any) => {
  try {
    const response = await axios.post(
      "/api/brainstorming-sessions",
      sessionData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating brainstorming session:", error);
    throw error;
  }
};

export const generateIdeas = async (sessionId: string, prompt: string) => {
  try {
    const response = await axios.post(
      `/api/brainstorming-sessions/${sessionId}/generate-ideas`,
      { prompt }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw error;
  }
};
