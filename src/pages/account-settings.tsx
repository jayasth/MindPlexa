import React from "react";
import ProfileForm from "../components/ProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";

const AccountSettings: React.FC = () => {
  const user = {
    id: "user-id", // replace with actual user id
    app_metadata: {}, // replace with actual app metadata
    user_metadata: {}, // replace with actual user metadata
    aud: "aud-value", // replace with actual aud value
    created_at: new Date().toISOString(), // replace with actual creation date
    // add other required properties here
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Account Settings</h1>
      <ProfileForm user={user} />
      <ChangePasswordForm />
    </div>
  );
};
export default AccountSettings;
