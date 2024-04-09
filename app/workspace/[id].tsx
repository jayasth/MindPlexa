// pages/workspace/[id].tsx
import React from "react";
import { useRouter } from "next/router";
import ProjectLayout from "@/app/project/[projectId]/_components/ProjectLayout";
import ProjectView from "@/app/project/[projectId]/_components/ProjectView";

const WorkspacePage: React.FC = () => {
  const router = useRouter();
  const { id, projectId } = router.query;

  return (
    <ProjectLayout>
      {projectId ? (
        <ProjectView projectId={projectId as string} />
      ) : (
        <p>Select a project</p>
      )}
    </ProjectLayout>
  );
};

export default WorkspacePage;
