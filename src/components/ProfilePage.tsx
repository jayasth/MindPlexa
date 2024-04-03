// src/pages/profile.tsx
import React from "react";
import { useRouter } from "next/router";
import { useUser } from "../shared/utils/useUser";
import Layout from "../components/layout";
import ProfileForm from "../components/ProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileForm user={user} />
          <ChangePasswordForm />
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
