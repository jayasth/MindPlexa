import React, { useState, useEffect } from "react";
import ProfileForm from "./Profile/ProfileForm";
import ChangePasswordForm from "./Profile/ChangePasswordForm";

const AccountSettings: React.FC = () => {
  const [user] = useState(null);

  useEffect(() => {
    // Fetch the user data here and call setUser with the data
    // For example:
    // const fetchedUser = await fetchUserData();
    // setUser(fetchedUser);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          {user && <ProfileForm user={user} />}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
