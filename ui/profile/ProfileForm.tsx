'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { updateProfile } from '@/utils/supabase/profileClient';
import { useRouter } from 'next/navigation';
import type { Tables } from 'types_db';
import Card from '@/ui/Card';
import Input from '@/ui/Input/Input';
import Button from '@/ui/Button/Button';
import { createClient } from '@/utils/supabase/supabaseClient';

type Profile = Tables<'profiles'>;

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

  useEffect(() => {
    const checkDeactivation = async () => {
      const supabase = createClient();
      const { data: userDetails } = await supabase
        .from('users')
        .select('is_deactivated')
        .single();

      if (userDetails?.is_deactivated) {
        router.push('/workspace/account');
      }
    };

    checkDeactivation();
  }, [router]);

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
    <Card title="Update Profile" className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="fullName"
            label="Full Name"
            type="text"
            value={fullName}
            onChange={setFullName}
            placeholder="Enter your full name"
            required
          />
          <Input
            id="avatarUrl"
            label="Avatar URL"
            type="text"
            value={avatarUrl}
            onChange={setAvatarUrl}
            placeholder="Enter avatar URL"
          />
        </div>
        <Input
          id="bio"
          label="Bio"
          type="textarea"
          value={bio}
          onChange={setBio}
          placeholder="Tell us about yourself"
          rows={3}
        />
        <Input
          id="website"
          label="Website"
          type="url"
          value={website}
          onChange={setWebsite}
          placeholder="https://example.com"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="your@email.com"
            required
          />
          <Input
            id="phone"
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+1 (123) 456-7890"
          />
        </div>
        <Button
          type="submit"
          variant="submit"
          loading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </Card>
  );
}
