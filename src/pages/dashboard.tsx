import React from "react";
import Layout from "../components/layout";
import DashboardOverview from "../components/Dashboard/DashboardOverview";
import withAuth from "../components/withAuth";
import useTheme from "../hooks/useTheme";

const Dashboard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Layout>
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"
        }`}
      >
        <DashboardOverview />
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);
