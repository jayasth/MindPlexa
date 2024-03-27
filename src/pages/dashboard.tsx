// src/pages/dashboard.tsx
import React from "react";
import Layout from "../components/layout";
import DashboardOverview from "../components/Dashboard/DashboardOverview";

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <DashboardOverview />
    </Layout>
  );
};

export default Dashboard;
