'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WeekendSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const fetchSessions = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });

      const res = await fetch(`/api/weekend-sessions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setPagination(data.pagination || { page: 1, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkProfile = async () => {
    try {
      const profileRes = await fetch('/api/profile').catch(() => null);
      if (profileRes && profileRes.ok) {
        setIsLoggedIn(true);
        const profileData = await profileRes.json();
        const p = profileData.profile;
        const complete = Boolean(p && p.full_name && p.phone && p.college && p.degree && p.graduation_year);
        setIsProfileComplete(complete);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkProfile();
    fetchSessions(1);
  }, []);

  const handleJoinSession = (link_url: string) => {
    if (!isLoggedIn) {
      router.push('/login?next=/weekend-sessions');
      return;
    }
    
    if (!isProfileComplete) {
      alert('Please complete your profile details before joining sessions.');
      router.push('/profile');
      return;
    }

    // Opens the session in a new tab if validation passes
    window.open(link_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Weekend Sessions</h1>
        <p style={{ color: 'var(--text2)' }}>Enroll in our exclusive weekend cohorts. Join live classes focusing on advanced topics, portfolio building, and career transitioning!</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>
          No weekend sessions available currently. Check back soon!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map((session) => (
            <div key={session.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 800 }}>
                    {session.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className="badge badge-orange">
                      Added {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                {session.description}
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleJoinSession(session.link_url)} 
                  className="btn btn-primary"
                >
                  Join Session
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button
                className="btn btn-outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchSessions(pagination.page - 1)}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text2)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSessions(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
