'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    async function loadRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setRole(data.profile?.role || 'user');
        }
      } catch (err) {
        // ignore
      }
    }
    loadRole();
  }, [pathname]);

  const navLinks = [
    { name: 'Job Board', href: '/' },
    { name: 'Profile', href: '/profile' },
    { name: 'Resumes', href: '/resumes' },
  ];

  if (role === 'admin') {
    navLinks.push({ name: 'Admin Jobs', href: '/admin/jobs' });
  }

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-syne)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Eviternship /
          <br />
          <span style={{ color: 'var(--orange)' }}>Job YARD</span>
        </h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                color: isActive ? 'white' : 'var(--text2)',
                backgroundColor: isActive ? 'var(--orange)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
