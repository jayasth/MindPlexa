'use client';

import React from 'react';
import AccountSettings from '@/ui/settings/AccountSettings';
import ProfileSettings from '@/ui/settings/ProfileSettings';
import NotificationSettings from '@/ui/settings/NotificationSettings';

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
