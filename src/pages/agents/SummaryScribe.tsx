// src/pages/agents/SummaryScribe.tsx

import React from "react";
import Layout from "../../components/layout";
import SummaryScribeEditor from "../../components/SummaryScribe/SummaryScribeEditor";

const SummaryScribe: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col h-screen">
        <h1 className="text-3xl font-heading mb-4">SummaryScribe</h1>
        <div className="flex-grow">
          <SummaryScribeEditor />
        </div>
      </div>
    </Layout>
  );
};

export default SummaryScribe;
