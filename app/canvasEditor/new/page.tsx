// app/canvasEditor/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCanvas } from '@/utils/canvas/canvasDatabaseOperations';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import styles from '@/ui/Modal/Modal.module.css';

export default function NewCanvasPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [canvasTitle, setCanvasTitle] = useState('');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasTitle(e.target.value);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/workspace/canvases');
  };

  const handleCreateCanvas = async () => {
    await createCanvas(canvasTitle, setIsModalOpen, router);
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
