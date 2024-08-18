'use client';

import React, { useState } from 'react';
import Input from '@/ui/Input/Input';
import Button from '@/ui/Button/Button';

const AccountSettings: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="Enter your email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Enter your password"
      />
      <Button type="submit" variant="submit">
        Update Account
      </Button>
    </form>
  );
};

export default AccountSettings;
