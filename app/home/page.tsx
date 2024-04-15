import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/utils/supabase/supabaseServer';
import LandingLayout from '@/app/home/landingLayout';

export default async function LandingPage() {
  const supabase = createClient();

  // Get user data and subscription details
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
      <Pricing
        user={user}
        products={products ?? []}
        subscription={subscription}
      />
      {/* Additional components can be added here */}
    </LandingLayout>
  );
}
