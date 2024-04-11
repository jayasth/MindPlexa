import { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/globals.css';
import { Providers } from '@/app/providers';

const meta = {
  title: 'MindPlexa: Navigating Ideas from Conception to Completion',
  description:
    'MindPlexa is an AI-powered platform that helps you navigate and develop your ideas from conception to completion. With features like brainstorming, task management, and collaboration, MindPlexa empowers you to bring your ideas to life.',
  cardImage: '/og.png',
  robots: 'follow, index',
  favicon: '/favicon.ico',
  url: getURL()
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: 'origin-when-cross-origin',
    keywords: [
      'MindPlexa',
      'AI',
      'Brainstorming',
      'Task Management',
      'Collaboration'
    ],
    authors: [{ name: 'MindPlexa', url: '' }],
    creator: 'MindPlexa',
    publisher: 'MindPlexa',
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
      type: 'website',
      siteName: meta.title
    },
    twitter: {
      card: 'summary_large_image',
      site: '@MindPlexa',
      creator: '@MindPlexa',
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage]
    }
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <main
            id="skip"
            className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
          >
            {children}
          </main>
          <Suspense>
            <Toaster />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
