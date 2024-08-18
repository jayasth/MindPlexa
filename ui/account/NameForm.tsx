'use client';

import Button from '@/ui/Button/Button';
import Card from '@/ui/Card';
import Input from '@/ui/Input/Input';
import { updateName } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NameForm({ userName }: { userName: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(userName);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new name is the same as the old name
    if (name === userName) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    handleRequest(e, updateName, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title="Your Name"
      description="Please enter your full name, or a display name you are comfortable with."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="text-xs text-light-text/70 dark:text-dark-text/70 mb-2 sm:mb-0">
            64 characters maximum
          </p>
          <Button
            variant="sleek"
            type="submit"
            form="nameForm"
            loading={isSubmitting}
          >
            Update Name
          </Button>
        </div>
      }
    >
      <form id="nameForm" onSubmit={(e) => handleSubmit(e)} className="mt-4">
        <Input
          type="text"
          name="fullName"
          value={name}
          onChange={(value) => setName(value)}
          placeholder="Your name"
          maxLength={64}
          className="w-full sm:w-2/3"
        />
      </form>
    </Card>
  );
}
