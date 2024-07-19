import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import styles from './EventModal.module.css';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import moment from 'moment';

interface EventModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: any) => void;
  onDelete: (eventToDelete: any) => void;
  eventCategories: any[];
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  eventCategories
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [category, setCategory] = useState(event?.category || '');

  useEffect(() => {
    if (event?.start) {
      setStart(formatDateTimeForInput(event.start));
    }
    if (event?.end) {
      setEnd(formatDateTimeForInput(event.end));
    }
  }, [event]);

  const formatDateTimeForInput = (date: Date) => {
    return moment(date).format('YYYY-MM-DDTHH:mm');
  };

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
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: styles.customModal
      }}
    >
      <h2 className={styles.modalTitle}>
        {event?.title ? 'Edit Event' : 'Add Event'}
      </h2>
      <div className={styles.inputGroup}>
        <Input
          type="text"
          value={title}
          onChange={setTitle}
          placeholder="Event Title"
          variant="slim"
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <Input
          type="datetime-local"
          value={start}
          onChange={setStart}
          variant="slim"
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <Input
          type="datetime-local"
          value={end}
          onChange={setEnd}
          variant="slim"
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <Dropdown
          value={category}
          onChange={setCategory}
          variant="slim"
          className={styles.input}
        >
          <option value="">Select Category</option>
          {eventCategories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </Dropdown>
      </div>
      <div className={styles.buttons}>
        <Button variant="submit" onClick={handleSave}>
          Save
        </Button>
        {event?.title && (
          <Button variant="cancel" onClick={() => onDelete(event)}>
            Delete
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default EventModal;
