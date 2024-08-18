'use client';

import React, { useState } from 'react';
import Input from '@/ui/Input/Input';
import Button from '@/ui/Button/Button';

const ProfileSettings: React.FC = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        type="text"
        value={name}
        onChange={setName}
        placeholder="Enter your name"
      />
      <Input
        label="Bio"
        type="textarea"
        value={bio}
        onChange={setBio}
        placeholder="Enter your bio"
        rows={4}
      />
      <Button type="submit" variant="submit">
        Update Profile
      </Button>
    </form>
  );
};

export default ProfileSettings;
