'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/supabaseClient';
import Button from '@/ui/Button/Button';
import { toast } from '@/ui/Toasts/use-toast';
import Modal from '@/ui/Modal/Modal';
import { Database } from '@/types_db';
import styles from './FeedbackModal.module.css';

type FeedbackType = Database['public']['Enums']['feedback_type'];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const supabase = createClient();

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<FeedbackType>('bug');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: imageData, error: uploadError } = await supabase.storage
          .from('feedback-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl }
        } = supabase.storage
          .from('feedback-images')
          .getPublicUrl(imageData?.path || '');

        imageUrl = publicUrl;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('feedback').insert({
        content,
        type,
        is_anonymous: isAnonymous,
        image_url: imageUrl,
        user_id: isAnonymous ? null : user?.id
      });

      if (error) throw error;

      toast({
        description: 'We appreciate your help in improving MindPlexa.',
        variant: 'default'
      });

      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error submitting feedback',
        description:
          error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Feedback">
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.header}>
            <select
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
            >
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          <textarea
            className={styles.textarea}
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us what you think..."
            required
          />

          <div className={styles.fileUpload}>
            <span className={styles.label}>Attach Screenshot (optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className={styles.fileInput}
            />
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span>Submit anonymously</span>
          </label>

          <div className={styles.actions}>
            <Button variant="slim" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="sleek" type="submit" loading={isSubmitting}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export const removeAllFeedbackImagesForUser = async (userId: string) => {
  const { data: feedbacks, error } = await supabase
    .from('feedback')
    .select('image_url')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching feedback images:', error);
    return false;
  }

  const paths = feedbacks
    .map((feedback) => feedback.image_url)
    .filter((url): url is string => url !== null);

  if (paths.length > 0) {
    const { error: deleteError } = await supabase.storage
      .from('feedback-images')
      .remove(paths);

    if (deleteError) {
      console.error('Error deleting feedback images:', deleteError);
      return false;
    }
  }

  return true;
};
