import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import ProfileFormWrapper from '@/ui/profile/ProfileFormWrapper';
import Card from '@/ui/Card';

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
    <section className="max-w-4xl mx-auto px-4 py-8">
      <Card
        title="Profile"
        description="View and update your profile information"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Current Profile</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Full Name:</span>{' '}
                {profile?.full_name || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Website:</span>{' '}
                {profile?.website || 'N/A'}
              </p>
              {/* Add more profile fields as needed */}
            </div>
          </div>
          <ProfileFormWrapper user={user} profile={profile ?? null} />
        </div>
      </Card>
    </section>
  );
}
