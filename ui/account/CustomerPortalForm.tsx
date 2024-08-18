'use client';

import Button from '@/ui/Button/Button';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { createStripePortal } from '@/utils/stripe/stripeServer';
import Link from 'next/link';
import Card from '@/ui/Card';
import { Tables } from '@/types_db';

type Subscription = Tables<'subscriptions'>;
type Price = Tables<'prices'>;
type Product = Tables<'products'>;

type SubscriptionWithPriceAndProduct = Subscription & {
  prices:
    | (Price & {
        products: Product | null;
      })
    | null;
};

interface Props {
  subscription: SubscriptionWithPriceAndProduct | null;
}

export default function CustomerPortalForm({ subscription }: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription?.prices?.currency!,
      minimumFractionDigits: 0
    }).format((subscription?.prices?.unit_amount || 0) / 100);

  const handleStripePortalRequest = async () => {
    setIsSubmitting(true);
    const redirectUrl = await createStripePortal(currentPath);
    setIsSubmitting(false);
    return router.push(redirectUrl);
  };

  return (
    <Card
      title="Your Plan"
      description={
        subscription
          ? `You are currently on the ${subscription?.prices?.products?.name} plan.`
          : 'You are not currently subscribed to any plan.'
      }
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="text-xs text-light-text/70 dark:text-dark-text/70 mb-2 sm:mb-0">
            Manage your subscription on Stripe.
          </p>
          <Button
            variant="sleek"
            onClick={handleStripePortalRequest}
            loading={isSubmitting}
          >
            Open customer portal
          </Button>
        </div>
      }
    >
      <div className="mt-4 mb-2 text-lg font-semibold text-light-text dark:text-dark-text">
        {subscription ? (
          `${subscriptionPrice}/${subscription?.prices?.interval}`
        ) : (
          <Link href="/" className="text-lavender-500 hover:underline">
            Choose your plan
          </Link>
        )}
      </div>
    </Card>
  );
}
