'use client';

import React from 'react';
import AccountSettings from './_components/AccountSettings';
import ProfileSettings from './_components/ProfileSettings';
import NotificationSettings from './_components/NotificationSettings';

const SettingsContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-8">
        <AccountSettings />
        <ProfileSettings />
        <NotificationSettings />
      </div>
    </div>
  );
};

export default SettingsContent;
