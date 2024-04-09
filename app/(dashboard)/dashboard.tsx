import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import BoardList from './_components/BoardList';
import EmptyBoards from './_components/EmptyBoards';

const fetchBoards = async (userId: string) => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch boards');
  }

  return data;
};

const DashboardPage = () => {
  const user = useUser();
  const userId = user?.id;

  const {
    data: boards,
    isLoading,
    isError
  } = useQuery(['boards', userId], () => fetchBoards(userId!), {
    enabled: !!userId
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading boards.</div>;
  }

  return (
    <>
      {boards && boards.length > 0 ? (
        <BoardList boards={boards} />
      ) : (
        <EmptyBoards />
      )}
    </>
  );
};

export default DashboardPage;
