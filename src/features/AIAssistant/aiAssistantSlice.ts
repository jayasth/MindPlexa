// src/features/AIAssistant/aiAssistantSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { generateIdeasAPI } from "./aiAssistantApi";

export const generateIdeas = createAsyncThunk(
  "aiAssistant/generateIdeas",
  async (prompt: string, { rejectWithValue }) => {
    try {
      const ideas = await generateIdeasAPI(prompt);
      return ideas;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

interface AIAssistantState {
  generatedIdeas: string[];
}

const initialState: AIAssistantState = {
  generatedIdeas: [],
};

const aiAssistantSlice = createSlice({
  name: "aiAssistant",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      generateIdeas.fulfilled,
      (state, action: PayloadAction<string[]>) => {
        state.generatedIdeas = action.payload;
      }
    );
    builder.addCase(generateIdeas.rejected, (state, action) => {
      console.error("Error generating ideas:", action.payload);
    });
  },
});

export default aiAssistantSlice.reducer;
