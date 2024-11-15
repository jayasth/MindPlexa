import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import LandingLayout from '@/app/home/landingLayout';
import LandingPageContent from '@/app/home/LandingPageContent';

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/workspace');
  }

  return (
    <LandingLayout>
      <LandingPageContent />
    </LandingLayout>
  );
}
