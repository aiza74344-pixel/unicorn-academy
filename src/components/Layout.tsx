import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';
import { ChatWidget } from './ChatWidget';
import { Skeleton } from './Skeleton';

const PageFallback: React.FC = () => (
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 space-y-6">
    <Skeleton className="h-12 w-2/3 max-w-md mx-auto" />
    <Skeleton className="h-6 w-1/2 max-w-lg mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
);

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-[#7C3AED] selection:text-white">
      <Navbar />
      <main className="flex-1 w-full" id="main-content">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {/* Floating Action Buttons: WhatsApp at bottom-end, Chat assistant at bottom-start */}
      <WhatsAppButton />
      <ChatWidget />
    </div>
  );
};
