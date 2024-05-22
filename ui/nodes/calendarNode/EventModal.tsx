import React, { useState } from 'react';
import styles from './EventModal.module.css';

const EventModal = ({ event, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(event.start);
  const [end, setEnd] = useState(event.end);

  const handleSave = () => {
    onSave({ ...event, title, start, end });
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Edit Event</h2>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Start:
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          End:
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <div className={styles.buttons}>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => onDelete(event)}>Delete</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
