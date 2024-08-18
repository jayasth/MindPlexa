'use client';

import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import ProfileForm from '@/ui/profile/ProfileForm';
import Button from '@/ui/Button/Button';

export default function ProfileFormWrapper({
  user,
  profile
}: {
  user: any;
  profile: any;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      {showForm ? (
        <>
          <ProfileForm user={user} profile={profile} />
          <Button
            onClick={() => setShowForm(false)}
            variant="ghost"
            className="mt-4"
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="sleek"
          className="flex items-center"
        >
          <FaEdit className="mr-2 w-4 h-4" />
          Update Profile
        </Button>
      )}
    </div>
  );
}
