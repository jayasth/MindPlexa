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
      <ul>
        <li>Email: {user.full_name}</li>
        <li>Username: {user.avatar_url}</li>
      </ul>
    </div>
  );
}
