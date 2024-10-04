'use client';

import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import ProfileForm from '@/ui/profile/ProfileForm';
import Button from '@/ui/Button/Button';
import { User } from '@supabase/supabase-js';
import { Tables } from 'types_db';

export default function ProfileFormWrapper({
  user,
  profile
}: {
  user: User;
  profile: Tables<'profiles'>;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      {showForm ? (
        <>
          <ProfileForm user={user} profile={profile} />
          <Button
            onClick={() => setShowForm(false)}
            variant="cancel"
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
