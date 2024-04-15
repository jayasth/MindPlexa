// app/profile/ProfileFormWrapper.tsx
'use client';

import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import ProfileForm from './_components/ProfileForm';

export default function ProfileFormWrapper({
  user,
  profile
}: {
  user: any;
  profile: any;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {showForm ? (
        <ProfileForm user={user} profile={profile} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 font-bold text-dark-text bg-blue-500 rounded hover:bg-blue-600"
        >
          <FaEdit className="mr-2" />
          Update Profile
        </button>
      )}
      {showForm && (
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-2 ml-4 font-bold text-dark-text bg-gray-500 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      )}
    </>
  );
}
