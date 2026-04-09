'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { supabase } from '@/lib/supabase-client';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Pages that should NOT have the sidebar/navbar layout
  const noLayoutRoutes = ['/login', '/auth/callback'];
  
  useEffect(() => {
    if (noLayoutRoutes.includes(pathname || '')) {
      setLoading(false);
      return;
    }

    async function checkProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
           const data = await res.json();
           const p = data.profile;
           const isComplete = Boolean(p && p.full_name && p.phone && p.college && p.degree && p.graduation_year);
           setIsProfileComplete(isComplete);
        } else {
           setIsProfileComplete(false);
        }
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    checkProfile();
  }, [pathname, router]);

  if (noLayoutRoutes.includes(pathname || '')) {
    return <>{children}</>;
  }

  if (loading) {
     return <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--text2)' }}>Loading application...</div>;
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isComplete={isProfileComplete} />
      <div className="main-content">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

