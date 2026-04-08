'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pages that should NOT have the sidebar/navbar layout
  const noLayoutRoutes = ['/login', '/auth/callback'];
  
  if (noLayoutRoutes.includes(pathname || '')) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="main-content">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

