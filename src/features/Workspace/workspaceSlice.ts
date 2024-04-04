// src/features/Workspace/workspaceSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getWorkspaceById } from "./workspaceApi";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Workspace {
  id: string;
  name: string;
  user_id: string;
  projects: Project[];
}

interface WorkspaceState {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  selectedWorkspace: Workspace | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  loading: false,
  error: null,
  selectedWorkspace: null,
};

export const fetchWorkspace = createAsyncThunk(
  "workspace/fetchWorkspace",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const workspace = await getWorkspaceById(workspaceId);
      return workspace;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    // ... existing reducers ...
    createProject: (state, action: PayloadAction<{ workspaceId: string; name: string; description: string }>) => {
      const { workspaceId, name, description } = action.payload;
      const newProject = {
        id: generateUniqueId(),
        name,
        description,
      };
      const workspace = state.workspaces.find(workspace => workspace.id === workspaceId);
      if (workspace) {
        workspace.projects.push(newProject);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWorkspace.fulfilled, (state, action: PayloadAction<Workspace>) => {
      state.selectedWorkspace = action.payload;
    });
    builder.addCase(fetchWorkspace.rejected, (state, action) => {
      console.error("Error fetching workspace:", action.payload);
    });
  },
});

export const { /* ... other actions ... */, createProject } = workspaceSlice.actions;

export default workspaceSlice.reducer;