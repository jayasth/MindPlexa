// src/pages/agents/IdeaMapper.tsx

import React from "react";
import Layout from "../../components/layout";
import IdeaMapperCanvas from "../../components/IdeaMapper/IdeaMapperCanvas";

const IdeaMapper: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col h-screen">
        <div className="p-4">
          <h1 className="text-3xl font-heading mb-4">IdeaMapper</h1>
        </div>
        <div className="flex-grow">
          <IdeaMapperCanvas />
        </div>
      </div>
    </Layout>
  );
};

export default IdeaMapper;
