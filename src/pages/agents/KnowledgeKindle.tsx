// src/pages/agents/KnowledgeKindle.tsx

import React from "react";
import Layout from "../../components/layout";
import KnowledgeKindleExplorer from "../../components/KnowledgeKindle/KnowledgeKindleExplorer";

const KnowledgeKindle: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-heading mb-4">KnowledgeKindle</h1>
        <KnowledgeKindleExplorer />
      </div>
    </Layout>
  );
};

export default KnowledgeKindle;
