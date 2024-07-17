import React, { useState } from 'react';
import styles from './EventModal.module.css';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';

interface EventModalProps {
  event: any;
  onClose: () => void;
  onSave: (updatedEvent: any) => void;
  onDelete: (eventToDelete: any) => void;
  eventCategories: any[];
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onSave,
  onDelete,
  eventCategories
}) => {
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(event.start.toISOString().slice(0, 16));
  const [end, setEnd] = useState(event.end.toISOString().slice(0, 16));
  const [category, setCategory] = useState(event.category || '');

  const handleSave = () => {
    const updatedEvent = {
      ...event,
      title,
      start: new Date(start),
      end: new Date(end),
      category
    };
    onSave(updatedEvent);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Edit Event</h2>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Title:
            <Input
              type="text"
              value={title}
              onChange={(value) => setTitle(value)}
              variant="slim"
              className={styles.input}
            />
          </label>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Start:
            <Input
              type="datetime-local"
              value={start}
              onChange={(value) => setStart(value)}
              variant="slim"
              className={styles.input}
            />
          </label>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            End:
            <Input
              type="datetime-local"
              value={end}
              onChange={(value) => setEnd(value)}
              variant="slim"
              className={styles.input}
            />
          </label>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Category:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.input}
            >
              <option value="">Select Category</option>
              {eventCategories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.buttons}>
          <Button variant="submit" onClick={handleSave}>
            Save
          </Button>
          <Button variant="cancel" onClick={() => onDelete(event)}>
            Delete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
