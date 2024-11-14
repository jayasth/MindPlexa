'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/ui/Button/Button';
import Modal from '@/ui/Modal/Modal';
import styles from './DeleteAccountForm.module.css';
import { deleteUserAccount } from '@/utils/account/accountService';
import { createClient } from '@/utils/supabase/supabaseClient';

const supabase = createClient();

export default function DeleteAccountForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      await deleteUserAccount();

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete account. Please try again later.'
      );
      console.error('Error deleting account:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const { error } = await supabase.rpc('deactivate_user_account', {
        should_deactivate: true
      });

      if (error) throw error;
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to deactivate account'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.dangerZone}>
        <h3 className={styles.dangerTitle}>Delete Account</h3>
        <p className={styles.dangerText}>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Button
          variant="cancel"
          onClick={() => setIsModalOpen(true)}
          className={styles.deleteButton}
        >
          Delete Account
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        title="Delete Account"
      >
        <div className={styles.modalContent}>
          {error && <p className={styles.errorText}>{error}</p>}
          <p className={styles.warningText}>
            Before deleting your account, consider deactivating it instead. You
            can reactivate it later if you change your mind.
          </p>
          <div className={styles.modalActions}>
            <Button
              variant="slim"
              onClick={() => setIsModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="submit"
              onClick={handleDeactivateAccount}
              disabled={isDeleting}
            >
              Deactivate Instead
            </Button>
            <Button
              variant="cancel"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
