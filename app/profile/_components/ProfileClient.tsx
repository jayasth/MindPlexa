'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/utils/supabase/supabaseClient';
import { Database } from '@/types_db'; // Import the Database type
import ProfileForm from './ProfileForm';
import ProfileSettings from './ProfileSettings';

type Profile = Database['public']['Tables']['profiles']['Row'];

const ProfileClient = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data as Profile | null);
        }
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const handleUpdateProfile = async (updatedProfile: Profile) => {
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.replace('/signin');
    return null;
  }

  return (
    <>
      <ProfileForm profile={profile} onUpdateProfile={handleUpdateProfile} />
      <ProfileSettings />
    </>
  );
};

export default ProfileClient;
