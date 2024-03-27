// src/api/brainstormingApi.ts

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

export const getSessionById = async (sessionId: string) => {
  try {
    const response = await axios.get(
      `/api/brainstorming-sessions/${sessionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching brainstorming session:", error);
    throw error;
  }
};

export const addIdeaToSession = async (sessionId: string, idea: string) => {
  try {
    const response = await axios.post(
      `/api/brainstorming-sessions/${sessionId}/ideas`,
      { idea }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding idea to brainstorming session:", error);
    throw error;
  }
};

export const voteOnIdea = async (
  sessionId: string,
  ideaId: string,
  vote: "up" | "down"
) => {
  try {
    const response = await axios.post(
      `/api/brainstorming-sessions/${sessionId}/ideas/${ideaId}/vote`,
      { vote }
    );
    return response.data;
  } catch (error) {
    console.error("Error voting on idea:", error);
    throw error;
  }
};
