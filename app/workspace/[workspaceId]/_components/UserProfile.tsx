'use client';

import { Tables } from '@/types_db';

type User = Tables<'users'>;

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold">User Profile</h3>
      {/* Add user profile implementation */}
      <p>Manage account details for user: {user.email}</p>
    </div>
  );
}
