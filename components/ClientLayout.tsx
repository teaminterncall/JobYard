'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that should NOT have the sidebar/navbar layout
  const noLayoutRoutes = ['/login', '/auth/callback'];
  
  if (noLayoutRoutes.includes(pathname || '')) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
