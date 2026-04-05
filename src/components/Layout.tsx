import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-brand-cream text-[#2D2A2A] font-sans selection:bg-brand-lavender/30">
      <main className="w-full h-full min-h-screen">
        {children}
      </main>
    </div>
  );
}
