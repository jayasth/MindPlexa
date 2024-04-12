'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { updateProfile } from '@/utils/supabase/profileClient';
import { useRouter } from 'next/navigation';
import { Profiles } from '@/types/database/profiles';

type Profile = Profiles['Row'];

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
  const [email, setEmail] = useState(profile?.email ?? user.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedProfile = {
      full_name: fullName,
      avatar_url: avatarUrl,
      bio,
      website,
      email,
      phone
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
      <div>
        <label htmlFor="email" className="block mb-2 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block mb-2 font-medium">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
