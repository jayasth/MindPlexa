import { generateMetadata } from '@/utils/metadata';
import Head from 'next/head';
import { Toaster } from '@/ui/Toasts/toaster';
import 'styles/globals.css';

export const metadata = generateMetadata();

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
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
      <body className="bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
