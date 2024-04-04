// src/components/Project/ProjectCanvas.tsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { getProjectsByWorkspaceId } from "../../api/projectApi";
import {
  setProjects,
  setLoading,
  setError,
} from "../../features/Project/projectSlice";
import CustomNode from "../../features/Project/components/CustomNode";
import CustomEdge from "../../features/Project/components/CustomEdge";
import Toolbar from "../../features/Project/components/Toolbar";

interface ProjectCanvasProps {
  workspaceId: string;
}

const ProjectCanvas: React.FC<ProjectCanvasProps> = ({ workspaceId }) => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector(
    (state: RootState) => state.project
  );

  useEffect(() => {
    const fetchProjects = async () => {
      dispatch(setLoading(true));
      try {
        const data = await getProjectsByWorkspaceId(workspaceId);
        dispatch(setProjects(data));
      } catch (error) {
        dispatch(setError(error.message));
      }
      dispatch(setLoading(false));
    };

    fetchProjects();
  }, [dispatch, workspaceId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Toolbar />
      <div>
        {/* Render the project canvas */}
        {/* Use CustomNode and CustomEdge components */}
      </div>
    </div>
  );
};

export default ProjectCanvas;
