// src/pages/dashboard.tsx
import React from "react";
import Layout from "../components/layout";
import DashboardOverview from "../components/Dashboard/DashboardOverview";
import withAuth from "../components/withAuth";

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <DashboardOverview />
    </Layout>
  );
};

export default withAuth(Dashboard);
