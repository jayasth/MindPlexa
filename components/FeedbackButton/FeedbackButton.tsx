'use client';

import { useState } from 'react';
import { FaComments } from 'react-icons/fa';
import Button from '@/ui/Button/Button';
import dynamic from 'next/dynamic';
import styles from './FeedbackButton.module.css';

const FeedbackModal = dynamic(() => import('./FeedbackModal'), {
  ssr: false
});

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={styles.buttonContainer}>
        <Button
          variant="slim"
          className={styles.feedbackButton}
          onClick={() => setIsOpen(true)}
        >
          <FaComments className={styles.icon} />
        </Button>
      </div>
      {isOpen && (
        <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
