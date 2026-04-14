'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [category, setCategory] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const fetchResources = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (category) params.append('category', category);

      const res = await fetch(`/api/resources?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
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
    fetchResources(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(1);
  };

  const handleAccessResource = (link_url: string) => {
    if (!isLoggedIn) {
      router.push('/login?next=/resources');
      return;
    }
    
    if (!isProfileComplete) {
      alert('Please complete your profile details before accessing resources.');
      router.push('/profile');
      return;
    }

    // Opens the resource in a new tab if validation passes
    window.open(link_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Preparation Resources</h1>
        <p style={{ color: 'var(--text2)' }}>Access a curated library of learning roadmaps, guides, and tools.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="label">Category</label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ paddingRight: '2rem' }}
            >
              <option value="">All Categories</option>
              <option value="Roadmap">Roadmap</option>
              <option value="Interview Prep">Interview Prep</option>
              <option value="System Design">System Design</option>
              <option value="General">General</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem', height: '42px' }}>
              Filter
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>
          No resources found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resources.map((resource) => (
            <div key={resource.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 800 }}>
                    {resource.title}
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className="badge badge-info">{resource.category}</span>
                    <span className="badge badge-orange">
                      Added {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                {resource.description}
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleAccessResource(resource.link_url)} 
                  className="btn btn-primary"
                >
                  Access Resource
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
                onClick={() => fetchResources(pagination.page - 1)}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text2)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchResources(pagination.page + 1)}
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
