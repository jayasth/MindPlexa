'use client';

import Button from '@/ui/Button/Button';
import Link from 'next/link';
import { signInWithPassword } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from '../auth.module.css';

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod
}: PasswordSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signInWithPassword, router);
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
          Sign in
        </Button>
      </form>
      <div className={styles.authLinks}>
        <Link href="/signin/forgot_password" className={styles.authLink}>
          Forgot your password?
        </Link>
        {allowEmail && (
          <Link href="/signin/email_signin" className={styles.authLink}>
            Sign in via magic link
          </Link>
        )}
        <Link href="/signin/signup" className={styles.authLink}>
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  );
}
