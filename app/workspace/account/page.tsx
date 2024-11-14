import CustomerPortalForm from '@/ui/account/CustomerPortalForm';
import EmailForm from '@/ui/account/EmailForm';
import NameForm from '@/ui/account/NameForm';
import DeleteAccountForm from '@/ui/account/DeleteAccountForm';
import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import styles from './Account.module.css';
import DeactivatedAccountBanner from '@/ui/account/DeactivatedAccountBanner';

export default async function Account() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.log(error);
  }

  if (!user) {
    return redirect('/signin');
  }

  // Check if user is deactivated
  const isDeactivated = userDetails?.is_deactivated;

  return (
    <section className={styles.accountContainer}>
      <div className={styles.contentWrapper}>
        {isDeactivated && <DeactivatedAccountBanner />}
        <div className={styles.header}>
          <h1 className={styles.title}>Account</h1>
          <p className={styles.subtitle}>
            Manage your account settings and subscription.
          </p>
        </div>
        <div className={styles.formContainer}>
          {!isDeactivated && (
            <>
              <CustomerPortalForm subscription={subscription} />
              <NameForm userName={userDetails?.full_name ?? ''} />
              <EmailForm userEmail={user.email} />
              <DeleteAccountForm />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
