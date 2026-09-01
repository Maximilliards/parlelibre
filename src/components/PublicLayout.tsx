import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { EmergencyBanner } from './EmergencyBanner';
import { FeedbackModal } from './FeedbackModal';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <EmergencyBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FeedbackModal />
    </div>
  );
}
