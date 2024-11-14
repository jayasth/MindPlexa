'use client';

import { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import ProfileForm from '@/ui/profile/ProfileForm';
import Button from '@/ui/Button/Button';
import { User } from '@supabase/supabase-js';
import { Tables } from 'types_db';
import { createClient } from '@/utils/supabase/supabaseClient';

export default function ProfileFormWrapper({
  user,
  profile
}: {
  user: User;
  profile: Tables<'profiles'>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);

  useEffect(() => {
    const checkDeactivation = async () => {
      const supabase = createClient();
      const { data: userDetails } = await supabase
        .from('users')
        .select('is_deactivated')
        .single();

      setIsDeactivated(userDetails?.is_deactivated ?? false);
    };

    checkDeactivation();
  }, []);

  if (isDeactivated) {
    return null; // Or return a message about account being deactivated
  }

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
