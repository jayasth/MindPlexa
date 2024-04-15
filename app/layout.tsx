import { generateMetadata } from '@/utils/metadata';
import Head from 'next/head';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import 'styles/globals.css';

export default function RootLayout({ children }: PropsWithChildren) {
  const metadata = generateMetadata();

  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href={metadata.favicon} />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:type" content={metadata.type} />
        <meta property="og:site_name" content={metadata.siteName} />
      </Head>
      <body className="bg-background loading">
        <main
          id="skip"
          className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
        >
          {children}
        </main>
        <Suspense fallback={<div>Loading...</div>}>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
