import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Canvas from './_components/Canvas';
import BoardHeader from './_components/BoardHeader';
import Presence from './_components/Presence';
import Toolbar from './_components/Toolbar';

const fetchBoard = async (boardId: string) => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();

  if (error) {
    throw new Error('Failed to fetch board');
  }

  return data;
};

const BoardPage = () => {
  const router = useRouter();
  const { boardId } = router.query;
  const user = useUser();

  const {
    data: board,
    isLoading,
    isError
  } = useQuery(['board', boardId], () => fetchBoard(boardId as string), {
    enabled: !!boardId
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading board.</div>;
  }

  const addElement = async (
    type: string,
    content: any,
    position: { x: number; y: number }
  ) => {
    await supabase.from('board_elements').insert({
      board_id: boardId,
      type,
      content,
      position
    });
  };

  return (
    <>
      <BoardHeader board={board} />
      <div className="board-container">
        <Toolbar onAddElement={addElement} />
        <Canvas boardId={boardId as string} />
      </div>
      <Presence boardId={boardId as string} />
    </>
  );
};

export default BoardPage;
