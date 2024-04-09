import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@supabase/auth-helpers-react';

interface PresenceUser {
  id: string;
  name: string;
  cursor: { x: number; y: number } | null;
}

const Presence = ({ boardId }: { boardId: string }) => {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const user = useUser();

  useEffect(() => {
    // Subscribe to presence changes
    const channel = supabase.channel(`board:${boardId}`);

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const updatedUsers: PresenceUser[] = [];

      presenceState.forEach((state) => {
        updatedUsers.push({
          id: state.user_id,
          name: state.user_info.name,
          cursor: state.user_info.cursor
        });
      });

      setUsers(updatedUsers);
    });

    // Track the current user's presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user!.id)
          .single();

        const presenceTrackStatus = await channel.track({
          user_id: user!.id,
          user_info: {
            name: data.name,
            cursor: null
          }
        });

        if (presenceTrackStatus === 'ERROR') {
          console.error('Failed to track presence');
        }
      }
    });

    // Clean up the subscription when the component unmounts
    return () => {
      channel.unsubscribe();
    };
  }, [boardId, user]);

  return (
    <div>
      <h3>Presence</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}
            {user.cursor && (
              <span>
                {' '}
                - Cursor: ({user.cursor.x}, {user.cursor.y})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Presence;
