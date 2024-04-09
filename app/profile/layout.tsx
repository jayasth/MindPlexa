import { PropsWithChildren, Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { Toaster } from '@/components/ui/Toasts/toaster';

export default async function ProfileLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container mx-auto">{children}</main>
        <Footer />
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
