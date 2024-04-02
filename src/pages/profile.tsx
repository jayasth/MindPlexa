// src/pages/profile.tsx
import React from "react";
import { useRouter } from "next/router";
import withAuth from "../components/withAuth";
import { useUser } from "../utils/useUser";
import Layout from "../components/layout";
import ProfileForm from "../components/ProfileForm";

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <ProfileForm user={user} />
      </div>
    </Layout>
  );
};

export default withAuth(ProfilePage);
