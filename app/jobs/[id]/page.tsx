'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [jobRes, profileRes] = await Promise.all([
          fetch(`/api/jobs/${id}`),
          fetch('/api/profile').catch(() => null)
        ]);

        if (profileRes && profileRes.ok) {
          setIsLoggedIn(true);
          const profileData = await profileRes.json();
          if (profileData.profile?.role === 'admin') setIsAdmin(true);
        }

        if (jobRes.ok) {
          const data = await jobRes.json();
          setJob(data.job);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Error loading job details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>Loading job details...</div>;
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{error || 'Not Found'}</h1>
        <Link href="/" className="btn btn-outline">Back to Job Board</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Link href="/" style={{ color: 'var(--orange)', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
          ← Back to Jobs
        </Link>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{job.title}</h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text2)', marginBottom: '1rem' }}>{job.company} • {job.location}</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-info">{job.job_type}</span>
                <span className="badge badge-orange">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
                {!job.is_active && (
                  <span className="badge badge-info" style={{ color: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}>
                    Closed
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {isAdmin && (
                <Link href={`/admin/jobs?edit=${job.id}`} className="btn btn-outline">
                  Edit Job
                </Link>
              )}
              {job.is_active ? (
                <button 
                  onClick={() => {
                    if (isLoggedIn) {
                      window.open(job.apply_url, '_blank', 'noopener,noreferrer');
                    } else {
                      router.push(`/login?next=/jobs/${id}`);
                    }
                  }}
                  className="btn btn-primary" 
                  style={{ padding: '0.75rem 2rem' }}
                >
                  Apply Now
                </button>
              ) : (
                <button className="btn btn-outline" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  No Longer Accepting Applications
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Job Description
        </h2>
        <div style={{ lineHeight: '1.7', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
          {job.description}
        </div>
      </div>
      
      {job.expires_at && (
        <div style={{ fontSize: '0.875rem', color: 'var(--text3)', textAlign: 'right' }}>
          Listing expires: {new Date(job.expires_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
