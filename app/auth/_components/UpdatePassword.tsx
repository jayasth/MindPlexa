'use client';

import Button from '@/ui/Button/Button';
import { updatePassword } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from '../auth.module.css';

interface UpdatePasswordProps {
  redirectMethod: string;
}

export default function UpdatePassword({
  redirectMethod
}: UpdatePasswordProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, updatePassword, router);
    setIsSubmitting(false);
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={(e) => handleSubmit(e)}>
        <div>
          <label htmlFor="password" className={styles.authLabel}>
            New Password
          </label>
          <input
            id="password"
            className={styles.authInput}
            placeholder="New Password"
            type="password"
            name="password"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm" className={styles.authLabel}>
            Confirm New Password
          </label>
          <input
            id="passwordConfirm"
            className={styles.authInput}
            placeholder="Confirm New Password"
            type="password"
            name="passwordConfirm"
            autoComplete="new-password"
          />
        </div>
        <Button
          variant="slim"
          type="submit"
          className={styles.authButton}
          loading={isSubmitting}
        >
          Update Password
        </Button>
      </form>
    </div>
  );
}
