'use client';

import Button from '@/ui/Button/Button';
import Card from '@/ui/Card';
import Input from '@/ui/Input/Input';
import { updateEmail } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EmailForm({
  userEmail
}: {
  userEmail: string | undefined;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState(userEmail ?? '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new email is the same as the old email
    if (email === userEmail) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    handleRequest(e, updateEmail, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title="Your Email"
      description="Please enter the email address you want to use to login."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="text-xs text-light-text/70 dark:text-dark-text/70 mb-2 sm:mb-0">
            We will email you to verify the change.
          </p>
          <Button
            variant="sleek"
            type="submit"
            form="emailForm"
            loading={isSubmitting}
          >
            Update Email
          </Button>
        </div>
      }
    >
      <form id="emailForm" onSubmit={(e) => handleSubmit(e)} className="mt-4">
        <Input
          type="email"
          name="newEmail"
          value={email}
          onChange={(value) => setEmail(value)}
          placeholder="Your email"
          maxLength={64}
          className="w-full sm:w-2/3"
        />
      </form>
    </Card>
  );
}
