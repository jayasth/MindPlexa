'use client';

import Button from '@/ui/Button/Button';
import Link from 'next/link';
import { requestPasswordUpdate } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../auth.module.css';

// Define prop type with allowEmail boolean
interface ForgotPasswordProps {
  allowEmail: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function ForgotPassword({
  allowEmail,
  redirectMethod,
  disableButton
}: ForgotPasswordProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(
      e,
      requestPasswordUpdate,
      redirectMethod === 'client' ? router : null
    );
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
        <Button
          variant="slim"
          type="submit"
          className={styles.authButton}
          loading={isSubmitting}
          disabled={disableButton}
        >
          Send Email
        </Button>
      </form>
      <div className={styles.authLinks}>
        <Link href="/signin/password_signin" className={styles.authLink}>
          Sign in with email and password
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
