'use client';

import Button from '@/ui/Button/Button';
import React from 'react';
import Link from 'next/link';
import { signUp } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/supabaseClient';
import styles from '../auth.module.css';

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

    if (redirectPath.includes('/worksapce')) {
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
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={(e) => handleSubmit(e)}>
        <div>
          <label htmlFor="email" className={styles.authLabel}>
            Email
          </label>
          <input
            id="email"
            className={styles.authInput}
            placeholder="name@example.com"
            type="email"
            name="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
          />
        </div>
        <div>
          <label htmlFor="password" className={styles.authLabel}>
            Password
          </label>
          <input
            id="password"
            className={styles.authInput}
            placeholder="Password"
            type="password"
            name="password"
            autoComplete="current-password"
          />
        </div>
        <Button
          variant="slim"
          type="submit"
          className={styles.authButton}
          loading={isSubmitting}
        >
          Sign up
        </Button>
      </form>
      <div className={styles.authSeparator}>
        <div className={styles.authSeparatorLine} />
        <span className={styles.authSeparatorText}>Or</span>
      </div>
      <p className="text-xs text-center">
        Already have an account?{' '}
        <Link href="/signin/password_signin" className={styles.authLink}>
          Sign in
        </Link>
      </p>
      {allowEmail && (
        <p className="text-xs text-center mt-2">
          <Link href="/signin/email_signin" className={styles.authLink}>
            Sign in via magic link
          </Link>
        </p>
      )}
    </div>
  );
}
