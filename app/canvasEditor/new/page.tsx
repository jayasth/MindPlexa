// app/canvasEditor/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import styles from '@/ui/Modal/Modal.module.css';

type Canvas = Tables<'canvases'>;

export default function NewCanvasPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [canvasTitle, setCanvasTitle] = useState('');
  const supabase = createClient();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasTitle(e.target.value);
  };

  const handleCreateCanvas = async () => {
    if (canvasTitle.trim() !== '') {
      const insertResponse = await supabase
        .from('canvases')
        .insert({ name: canvasTitle });

      console.log('Insert response:', insertResponse);

      const { data, error } = await supabase
        .from('canvases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('Select data:', data);
      console.log('Select error:', error);

      if (error) {
        console.error('Error fetching canvas:', error);
      } else if (data && data[0]) {
        console.log('Redirecting to new canvas...');
        setIsModalOpen(false);
        router.push(`/canvasEditor/${data[0].id}?new=true`);
      } else {
        console.log('Fetch operation returned no data');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/workspace/canvases');
  };

  return (
    <>
      {isModalOpen && (
        <Modal open={isModalOpen} onClose={handleCloseModal} center>
          <div className={styles.modal}>
            <h2 className={styles.modalHeader}>Create New Canvas</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Canvas Title:</label>
              <Input
                type="text"
                placeholder="Enter canvas title"
                value={canvasTitle}
                onChange={(value: string) =>
                  handleTitleChange({
                    target: { value }
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                variant="slim"
                className={styles.inputWide}
              />
            </div>
            <div className={styles.actions}>
              <Button variant="submit" onClick={handleCreateCanvas}>
                Create
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
