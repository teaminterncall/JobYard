'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function JobBoard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (location) params.append('location', location);
      if (jobType) params.append('job_type', jobType);

      const res = await fetch(`/api/jobs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setPagination(data.pagination || { page: 1, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Explore Opportunities</h1>
        <p style={{ color: 'var(--text2)' }}>Find the perfect role that matches your skills.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="label">Location</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Remote, San Francisco"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label className="label">Job Type</label>
            <select
              className="input-field"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              style={{ paddingRight: '2rem' }}
            >
              <option value="">Any Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem', height: '42px' }}>
              Search
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>
          No jobs found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    <Link href={`/jobs/${job.id}`} style={{ transition: 'color 0.2s' }}>
                      {job.title}
                    </Link>
                  </h2>
                  <div style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>
                    {job.company} • {job.location}
                  </div>
                </div>
                {!job.is_active && (
                  <span className="badge badge-info" style={{ color: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}>
                    Closed
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-info">{job.job_type}</span>
                <span className="badge badge-orange">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Link href={`/jobs/${job.id}`} className="btn btn-outline" style={{ display: 'inline-block' }}>
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button
                className="btn btn-outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchJobs(pagination.page - 1)}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text2)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchJobs(pagination.page + 1)}
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
