import Pricing from '@/ui/Pricing/Pricing';
import { createClient } from '@/utils/supabase/supabaseServer';
import LandingLayout from '@/app/home/landingLayout';
import LandingPageContent from '@/app/home/LandingPageContent';

export default async function LandingPage() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  if (subscriptionError || productsError) {
    console.error('Error fetching data:', subscriptionError || productsError);
    return <div>Error loading data. Please try again.</div>;
  }

  return (
    <LandingLayout>
      <LandingPageContent />
      <Pricing
        user={user}
        products={products ?? []}
        subscription={subscription}
      />
    </LandingLayout>
  );
}
