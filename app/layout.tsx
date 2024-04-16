import { generateMetadata } from '@/utils/metadata';
import { Toaster } from '@/ui/Toasts/toaster';
import 'styles/globals.css';

export const metadata = generateMetadata();

export default function RootLayout({
  children,
  documentTitle
}: {
  children: React.ReactNode;
  documentTitle: string;
}) {
  return (
    <html lang="en">
      <head>
        <title>{documentTitle}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href={metadata.favicon} />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:type" content={metadata.type} />
        <meta property="og:site_name" content={metadata.siteName} />
      </head>
      <body className="bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
