import { createClient } from '@/utils/supabase/supabaseServer';
import ProfileForm from './_components/ProfileForm';
import { redirect } from 'next/navigation';

export default async function Profile() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.log(error);
  }

  return <ProfileForm user={user} profile={profile ?? null} />;
}
