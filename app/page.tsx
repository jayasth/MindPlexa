import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    // Redirect authenticated users to dashboard
    return redirect('/workspace');
  } else {
    // Redirect non-authenticated users to the landing page
    return redirect('/home');
  }
}
