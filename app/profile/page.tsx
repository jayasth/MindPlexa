import { createClient } from '@/utils/supabase/supabaseServer';
import ProfileForm from './_components/ProfileForm';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

  return (
    <section className="mb-32 bg-background">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Profile
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Update your profile information below.
          </p>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Current Profile</h2>
          <p>Email: {user.email}</p>
          <p>Full Name: {profile?.full_name || 'N/A'}</p>
          <p>Website: {profile?.website || 'N/A'}</p>
          {/* Add more profile fields as needed */}
        </div>
        <ProfileForm user={user} profile={profile ?? null} />
        <div className="mt-8">
          <Link href="/account">
            <button className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
              Manage Account
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
