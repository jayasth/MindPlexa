// src/pages/agents/IdeaMapper.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "../../components/withAuth";
import Layout from "../../components/layout";
import IdeaMapperCanvas from "../../features/IdeaMapper/components/IdeaMapperCanvas";
import { useUser } from "../../shared/hooks/useUser";
import useTheme from "../../shared/hooks/useTheme";

const IdeaMapper: React.FC = () => {
  const { theme } = useTheme();
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div
        className={`flex flex-col h-screen ${
          theme === "dark" ? "bg-gray-900 text-white" : ""
        }`}
      >
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

export default withAuth(IdeaMapper);
