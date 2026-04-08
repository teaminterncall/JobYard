'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setEmail(session.user.email || '');

      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch (err) {
        // ignore
      }
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // After client signout we likely need to clear cookies for the SSR components
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="top-navbar">
      <button className="hamburger-btn" onClick={onMenuClick} aria-label="Open menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {email ? (
          <>
            <span style={{ fontSize: '0.875rem', color: 'var(--text2)', fontWeight: 500 }}>
              Hi, {profile?.full_name || email}
            </span>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
