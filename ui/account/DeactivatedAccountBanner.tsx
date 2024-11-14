'use client';

import { useState } from 'react';
import Button from '@/ui/Button/Button';
import styles from './DeactivatedAccountBanner.module.css';
import { createClient } from '@/utils/supabase/supabaseClient';

const supabase = createClient();

export default function DeactivatedAccountBanner() {
  const [isReactivating, setIsReactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReactivate = async () => {
    try {
      setIsReactivating(true);
      setError(null);

      const { error } = await supabase.rpc('deactivate_user_account', {
        should_deactivate: false
      });

      if (error) throw error;
      window.location.reload(); // Refresh to update UI
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to reactivate account'
      );
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <h2 className={styles.title}>Account Deactivated</h2>
        <p className={styles.message}>
          Your account is currently deactivated. You can reactivate it at any
          time.
        </p>
        {error && <p className={styles.error}>{error}</p>}
        <Button
          variant="submit"
          onClick={handleReactivate}
          disabled={isReactivating}
        >
          {isReactivating ? 'Reactivating...' : 'Reactivate Account'}
        </Button>
      </div>
    </div>
  );
}
