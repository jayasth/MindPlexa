import React from "react";
import Layout from "../components/Layout/layout";
import WorkspaceOverview from "../components/Workspace/WorkspaceOverview";
import withAuth from "../components/withAuth";
import useTheme from "../shared/hooks/useTheme";

const Workspace: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Layout>
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"
        }`}
      >
        <WorkspaceOverview />
      </div>
    </Layout>
  );
};

export default withAuth(Workspace);
