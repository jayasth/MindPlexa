import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import LandingPageContent from '@/components/ui/Homepage/LandingPageContent';

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <LandingPageContent />;
}
