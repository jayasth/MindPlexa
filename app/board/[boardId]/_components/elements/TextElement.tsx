import { useState } from 'react';
import { User } from '@supabase/supabase-js';

interface TextElementProps {
  element: {
    id: string;
    content: { text: string };
    position: { x: number; y: number };
    lastUpdatedBy: string | null;
  };
  selected: boolean;
  onUpdate: (
    content: { text: string },
    position: { x: number; y: number }
  ) => void;
  onDelete: () => void;
  user: User | null;
}

const TextElement = ({
  element,
  selected,
  onUpdate,
  onDelete,
  user
}: TextElementProps) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(element.content.text);
  const [position, setPosition] = useState(element.position);

  const handleDoubleClick = () => {
    if (!editing && user?.id === element.lastUpdatedBy) {
      setEditing(true);
    }
  };

  const handleBlur = () => {
    setEditing(false);
    onUpdate({ text }, position);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditing(false);
      onUpdate({ text }, position);
    }
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <div
      style={{
        border: selected ? '2px solid blue' : 'none',
        padding: '4px',
        cursor: 'pointer',
        backgroundColor:
          user?.id === element.lastUpdatedBy
            ? 'rgba(0, 0, 255, 0.1)'
            : 'transparent'
      }}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ) : (
        <div>{text}</div>
      )}
      {selected && <button onClick={handleDelete}>Delete</button>}
    </div>
  );
};

export default TextElement;
