'use client';

import Button from '@/ui/Button/Button';
import React from 'react';
import Link from 'next/link';
import { signUp } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/supabaseClient';

interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function SignUp({ allowEmail, redirectMethod }: SignUpProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission
    setIsSubmitting(true);

    // Create a FormData object from the form
    const formData = new FormData(e.currentTarget);

    const redirectPath = await signUp(formData);

    console.log('Redirect Path:', redirectPath); // Add this line

    if (redirectPath.includes('/dashboard')) {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        console.log('Creating user profile');
        // Create a new profile record for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
    }

    console.log('Redirecting to:', redirectPath);

    if (router) {
      router.push(redirectPath);
    } else {
      window.location.href = redirectPath;
    }
    setIsSubmitting(false);
  };

  return (
    <div className="my-8">
      <form
        noValidate={true}
        className="mb-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="grid gap-2">
          <div className="grid gap-1">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="w-full p-3 rounded-md bg-zinc-800"
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              placeholder="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full p-3 rounded-md bg-zinc-800"
            />
          </div>
          <Button
            variant="slim"
            type="submit"
            className="mt-1"
            loading={isSubmitting}
          >
            Sign up
          </Button>
        </div>
      </form>
      <p>Already have an account?</p>
      <p>
        <Link href="/signin/password_signin" className="font-light text-sm">
          Sign in with email and password
        </Link>
      </p>
      {allowEmail && (
        <p>
          <Link href="/signin/email_signin" className="font-light text-sm">
            Sign in via magic link
          </Link>
        </p>
      )}
    </div>
  );
}
