'use client';

import React, { useState } from 'react';
import Dropdown from '@/ui/dropdown/Dropdown';
import Button from '@/ui/Button/Button';

const NotificationSettings: React.FC = () => {
  const [emailFrequency, setEmailFrequency] = useState('daily');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Submitting notification settings:', {
      emailFrequency,
      pushNotifications,
      emailNotifications
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="emailFrequency"
          className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text"
        >
          Email Notification Frequency
        </label>
        <Dropdown
          id="emailFrequency"
          value={emailFrequency}
          onChange={setEmailFrequency}
          className="w-full"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Dropdown>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="pushNotifications"
          checked={pushNotifications}
          onChange={(e) => setPushNotifications(e.target.checked)}
          className="w-4 h-4 text-lavender-600 bg-gray-100 border-gray-300 rounded focus:ring-lavender-500 dark:focus:ring-lavender-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          htmlFor="pushNotifications"
          className="text-sm text-light-text dark:text-dark-text"
        >
          Enable push notifications
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="emailNotifications"
          checked={emailNotifications}
          onChange={(e) => setEmailNotifications(e.target.checked)}
          className="w-4 h-4 text-lavender-600 bg-gray-100 border-gray-300 rounded focus:ring-lavender-500 dark:focus:ring-lavender-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          htmlFor="emailNotifications"
          className="text-sm text-light-text dark:text-dark-text"
        >
          Enable email notifications
        </label>
      </div>
      <Button type="submit" variant="submit" className="w-full sm:w-auto">
        Update Notifications
      </Button>
    </form>
  );
};

export default NotificationSettings;
