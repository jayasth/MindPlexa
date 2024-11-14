import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';

export function useDeactivationCheck() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkDeactivation = async () => {
      const { data: userDetails } = await supabase
        .from('users')
        .select('is_deactivated')
        .single();

      if (userDetails?.is_deactivated) {
        router.push('/workspace/account');
      }
    };

    checkDeactivation();

    // Set up real-time subscription
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        checkDeactivation
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);
}
