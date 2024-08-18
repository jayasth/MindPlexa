'use client';

import React, { useState } from 'react';
import NotificationSettings from '@/ui/settings/NotificationSettings';
import Card from '@/ui/Card/Card';
import Button from '@/ui/Button/Button';
import Link from 'next/link';

const SettingsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationSettings />;
      default:
        return null;
    }
  };

  return (
    <Card title="Settings" className="max-w-4xl mx-auto">
      <div className="flex mb-4 space-x-2">
        <Button
          variant={activeTab === 'notifications' ? 'sleek' : 'ghost'}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </Button>
      </div>
      <div className="mt-4">{renderContent()}</div>
      <div className="mt-8 pt-4 border-t border-light-primary/20 dark:border-dark-primary/20">
        <p className="text-sm text-light-text/70 dark:text-dark-text/70 mb-2">
          Manage your profile and account settings:
        </p>
        <div className="flex space-x-4">
          <Link href="/workspace/profile">
            <Button variant="outline">Profile Settings</Button>
          </Link>
          <Link href="/workspace/account">
            <Button variant="outline">Account Settings</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default SettingsContent;
