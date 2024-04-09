import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@supabase/auth-helpers-react';
import TextElement from './elements/TextElement';

interface BoardElement {
  id: string;
  type: string;
  content: any;
  position: { x: number; y: number };
  lastUpdatedBy: string | null;
}

const Canvas = ({ boardId }: { boardId: string }) => {
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const user = useUser();

  useEffect(() => {
    // Fetch initial board elements
    const fetchElements = async () => {
      const { data, error } = await supabase
        .from('board_elements')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching board elements:', error);
      } else {
        setElements(data as BoardElement[]);
      }
    };

    fetchElements();

    // Set up real-time subscription for board elements
    const subscription = supabase
      .from(`board_elements:board_id=eq.${boardId}`)
      .on('INSERT', (payload) => {
        setElements((prevElements) => [
          ...prevElements,
          payload.new as BoardElement
        ]);
      })
      .on('UPDATE', (payload) => {
        const updatedElement = payload.new as BoardElement;
        setElements((prevElements) =>
          prevElements.map((element) =>
            element.id === updatedElement.id
              ? {
                  ...updatedElement,
                  lastUpdatedBy: payload.new.last_updated_by
                }
              : element
          )
        );
      })
      .on('DELETE', (payload) => {
        setElements((prevElements) =>
          prevElements.filter((element) => element.id !== payload.old.id)
        );
      })
      .subscribe();

    const handleMouseMove = (e: MouseEvent) => {
      const cursor = { x: e.clientX, y: e.clientY };
      supabase
        .channel(`board:${boardId}`)
        .updatePresence({ cursor })
        .catch((err) => console.error('Failed to update presence', err));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Clean up the subscription and event listener when the component unmounts
    return () => {
      supabase.removeSubscription(subscription);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [boardId]);

  const addElement = async (
    type: string,
    content: any,
    position: { x: number; y: number }
  ) => {
    const { data, error } = await supabase.from('board_elements').insert({
      board_id: boardId,
      type,
      content,
      position
    });

    if (error) {
      console.error('Error adding element:', error);
    } else {
      setSelectedElement(data[0].id);
    }
  };

  const updateElement = async (
    id: string,
    content: any,
    position: { x: number; y: number }
  ) => {
    await supabase
      .from('board_elements')
      .update({ content, position, last_updated_by: user!.id })
      .eq('id', id);
  };

  const deleteElement = async (id: string) => {
    await supabase.from('board_elements').delete().eq('id', id);
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  return (
    <div onClick={handleCanvasClick}>
      {elements.map((element) => (
        <div
          key={element.id}
          style={{
            position: 'absolute',
            ...element.position,
            pointerEvents: selectedElement === element.id ? 'auto' : 'none'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleElementClick(element.id);
          }}
        >
          {element.type === 'text' && (
            <TextElement
              element={element}
              selected={selectedElement === element.id}
              onUpdate={(content, position) =>
                updateElement(element.id, content, position)
              }
              onDelete={() => deleteElement(element.id)}
              user={user}
            />
          )}
          {/* Add more element types and rendering logic */}
        </div>
      ))}
      {/* Render element creation buttons */}
      <button
        onClick={() =>
          addElement('text', { text: 'New Text' }, { x: 100, y: 100 })
        }
      >
        Add Text
      </button>
      {/* Add more element creation buttons */}
    </div>
  );
};

export default Canvas;
