import React, { useState, useEffect } from 'react';
import Modal from '@/ui/Modal/Modal';
import Button from '@/ui/Button/Button';
import Input from '@/ui/Input/Input';
import Dropdown from '@/ui/dropdown/Dropdown';
import moment from 'moment-timezone';
import styles from './EventModal.module.css';

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
      isOpen={isOpen}
      onClose={onClose}
      title={event?.title ? 'Edit Event' : 'Add Event'}
    >
      <div className={styles.content}>
        <Input
          type="text"
          value={title}
          onChange={(value) => setTitle(value)}
          placeholder="Event Title"
          variant="slim"
        />
        <Input
          type="datetime-local"
          value={start}
          onChange={(value) => setStart(value)}
          variant="slim"
        />
        <Input
          type="datetime-local"
          value={end}
          onChange={(value) => setEnd(value)}
          variant="slim"
        />
        <Dropdown
          value={timezone}
          onChange={(value) => setTimezone(value)}
          variant="slim"
        >
          {moment.tz.names().map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </Dropdown>
        <div className={styles.actions}>
          <Button variant="submit" onClick={handleSave}>
            Save
          </Button>
          {event?.title && (
            <Button variant="danger" onClick={() => onDelete(event)}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
