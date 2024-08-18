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

  if (!products.length) {
    return (
      <section className={styles.pricingSection}>
        <div className={styles.pricingContainer}>
          <p className={styles.noPlansMessage}>
            No subscription pricing plans found. Create them in your{' '}
            <Link
              className={styles.stripeDashboardLink}
              href="https://dashboard.stripe.com/products"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Dashboard
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.pricingSection}>
      <div className={styles.pricingContainer}>
        <div className={styles.pricingHeader}>
          <h2 className={styles.pricingTitle}>Pricing Plans</h2>
          <p className={styles.pricingDescription}>
            Start building for free, then add a site plan to go live. Account
            plans unlock additional features.
          </p>
          <div className={styles.billingToggle}>
            {intervals.includes('month') && (
              <button
                onClick={() => setBillingInterval('month')}
                className={cn(styles.billingButton, {
                  [styles.billingButtonActive]: billingInterval === 'month'
                })}
              >
                Monthly billing
              </button>
            )}
            {intervals.includes('year') && (
              <button
                onClick={() => setBillingInterval('year')}
                className={cn(styles.billingButton, {
                  [styles.billingButtonActive]: billingInterval === 'year'
                })}
              >
                Yearly billing
              </button>
            )}
          </div>
        </div>
        <div className={styles.pricingCards}>
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
                  [styles.pricingCardActive]: subscription
                    ? product.name === subscription?.prices?.products?.name
                    : product.name === 'Freelancer'
                })}
              >
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>
                  {product.description}
                </p>
                <p className={styles.productPrice}>
                  <span className={styles.priceValue}>{priceString}</span>
                  <span className={styles.billingInterval}>
                    /{billingInterval}
                  </span>
                </p>
                <Button
                  variant="sleek"
                  loading={priceIdLoading === price.id}
                  onClick={() => handleStripeCheckout(price)}
                  className={styles.subscribeButton}
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
