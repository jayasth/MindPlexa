'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCanvas } from '@/utils/canvas/canvasService';
import Modal from '@/ui/Modal/Modal';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import styles from '@/ui/Modal/Modal.module.css';

export default function NewCanvasPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [canvasTitle, setCanvasTitle] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/workspace/canvases');
  };

  const handleCreateCanvas = async () => {
    await createCanvas(canvasTitle, setIsModalOpen, router);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title="Create New Canvas"
    >
      <div className={styles.formGroup}>
        <Input
          type="text"
          placeholder="Enter canvas title"
          value={canvasTitle}
          onChange={(value: string) => setCanvasTitle(value)}
          variant="slim"
          className={styles.inputWide}
        />
      </div>
      <div className={styles.actions}>
        <Button variant="submit" onClick={handleCreateCanvas}>
          Create
        </Button>
      </div>
    </Modal>
  );
}
