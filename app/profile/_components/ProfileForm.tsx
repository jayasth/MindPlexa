'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { updateProfile } from '@/utils/supabase/supabaseClient';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types';
import Button from '@/components/ui/Button';

interface ProfileFormProps {
  user: User;
  profile: Profile | null;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [website, setWebsite] = useState(profile?.website ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedProfile = {
      full_name: fullName,
      avatar_url: avatarUrl,
      bio,
      website
    };

    await updateProfile(user.id, updatedProfile);
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="fullName" className="block mb-2 font-medium">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="avatarUrl" className="block mb-2 font-medium">
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          type="text"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label htmlFor="bio" className="block mb-2 font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="website" className="block mb-2 font-medium">
          Website
        </label>
        <input
          id="website"
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <Button type="submit" loading={isSubmitting}>
        Update Profile
      </Button>
    </form>
  );
}
