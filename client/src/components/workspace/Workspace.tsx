// src/components/Workspace/Workspace.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { RootState } from "../../store";
import { fetchWorkspace } from "../../features/workspace/workspaceSlice";
import ProjectCard from "./ProjectCard";
import Button from "../common/Button";

const Workspace: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const workspace = useSelector(
    (state: RootState) => state.workspace.selectedWorkspace
  );
  const projects = useSelector((state: RootState) => state.workspace.projects);

  useEffect(() => {
    if (id) {
      dispatch(fetchWorkspace(id as string));
    }
  }, [dispatch, id]);

  if (!workspace) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">{workspace.name}</h2>
      <p className="text-gray-600 mb-8">{workspace.description}</p>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Collaborators</h3>
        {/* Add collaborator list */}
      </div>
    </div>
  );
};

export default Workspace;
