import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-[#FAF9F6] text-black font-sans selection:bg-[#F4CCCC]">
      <main className="w-full h-full">
        {children}
      </main>
    </div>
  );
}
