'use client';

import Link from 'next/link';
import Button from '@/ui/Button/Button';
import type { Tables } from 'types_db';
import { getStripe } from '@/utils/stripe/stripeClient';
import { checkoutWithStripe } from '@/utils/stripe/stripeServer';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Pricing.module.css';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  return (
    <section className={styles.pricingSection}>
      <div className={styles.pricingContainer}>
        <h2 className={styles.sectionTitle}>Choose Your Plan</h2>
        <p className={styles.sectionDescription}>
          Start with our free plan or upgrade for advanced features
        </p>

        <div className={styles.pricingGrid}>
          {products.map((product) => {
            const price = product?.prices?.find(
              (price) => price.interval === billingInterval
            );
            if (!price) return null;
            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency!,
              minimumFractionDigits: 0
            }).format((price?.unit_amount || 0) / 100);

            return (
              <div
                key={product.id}
                className={cn(styles.pricingCard, {
                  [styles.activePlan]: subscription
                    ? product.name === subscription?.prices?.products?.name
                    : product.name === 'Freelancer'
                })}
              >
                <h3 className={styles.planName}>{product.name}</h3>
                <p className={styles.planPrice}>
                  {priceString}
                  <span className={styles.billingInterval}>
                    /{billingInterval}
                  </span>
                </p>
                <p className={styles.planDescription}>{product.description}</p>
                <Button
                  variant="sleek"
                  loading={priceIdLoading === price.id}
                  onClick={() => handleStripeCheckout(price)}
                  className={styles.planButton}
                >
                  {subscription ? 'Manage' : 'Subscribe'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
