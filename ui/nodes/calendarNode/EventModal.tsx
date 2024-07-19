import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import styles from './EventModal.module.css';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import moment from 'moment-timezone';

interface EventModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: any) => void;
  onDelete: (eventToDelete: any) => void;
  defaultTimezone: string;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  defaultTimezone
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [timezone, setTimezone] = useState(event?.timezone || defaultTimezone);

  useEffect(() => {
    if (event?.start) {
      setStart(formatDateTimeForInput(event.start, timezone));
    }
    if (event?.end) {
      setEnd(formatDateTimeForInput(event.end, timezone));
    }
  }, [event, timezone]);

  const formatDateTimeForInput = (date: Date, tz: string) => {
    return moment(date).tz(tz).format('YYYY-MM-DDTHH:mm');
  };

  const handleSave = () => {
    const updatedEvent = {
      ...event,
      title,
      start: moment.tz(start, timezone).toDate(),
      end: moment.tz(end, timezone).toDate(),
      timezone
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
          onChange={(value) => setTitle(value)}
          placeholder="Event Title"
          variant="slim"
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <Input
          type="datetime-local"
          value={start}
          onChange={(value) => setStart(value)}
          variant="slim"
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <Input
          type="datetime-local"
          value={end}
          onChange={(value) => setEnd(value)}
          variant="slim"
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <Dropdown
          value={timezone}
          onChange={(value) => setTimezone(value)}
          variant="slim"
          className={styles.input}
        >
          {moment.tz.names().map((tz) => (
            <option key={tz} value={tz}>
              {tz}
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
