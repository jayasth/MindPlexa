// src/components/Project/ProjectCanvas.tsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import AIAssistant from "./AIAssistant/AIAssistant";
import { getProjectsByWorkspaceId } from "../../services/api/project/projectApi";
import {
  setProjects,
  setLoading,
  setError,
} from "../../features/project/projectSlice";
import CustomNode from "../../features/project/components/CustomNode";
import CustomEdge from "../../features/project/components/CustomEdge";
import Toolbar from "../../features/project/components/Toolbar";

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
      <AIAssistant />
      <div>
        <h4 className="text-lg font-semibold mb-2">Generated Ideas:</h4>
        <ul className="list-disc pl-6">
          {generatedIdeas.map((idea, index) => (
            <li key={index}>{idea}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectCanvas;
