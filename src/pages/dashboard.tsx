// src/pages/dashboard.tsx

import React from "react";
import Layout from "../components/layout";

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-heading mb-8">Dashboard</h1>
        <p className="text-xl mb-12">
          Welcome to your MindPlexa dashboard. Explore the tools and features to
          boost your creativity and productivity.
        </p>
        {/* Add dashboard content */}
      </div>
    </Layout>
  );
};

export default Dashboard;
