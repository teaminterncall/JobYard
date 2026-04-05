'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminJobsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    job_type: 'Full-time',
    apply_url: '',
    expires_at: '',
    is_active: true
  });

  useEffect(() => {
    async function checkAdminAndLoadJobs() {
      try {
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile?.role === 'admin') {
            setIsAdmin(true);
            await loadJobs();
          } else {
            router.push('/');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndLoadJobs();
  }, [router]);

  const loadJobs = async () => {
    try {
      // By default this gets active jobs but admin would ideally want all jobs.
      // Current API doc: GET /api/jobs -> Response: { jobs: [...] }. Let's just fetch it.
      // We will loop through lots of pages if pagination is small, but for now we just fetch page 1 limit 50.
      const res = await fetch('/api/jobs?limit=50');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...formData };
      if (payload.expires_at) {
        payload.expires_at = new Date(payload.expires_at).toISOString();
      }

      const url = editingJobId ? `/api/jobs/${editingJobId}` : '/api/jobs';
      const method = editingJobId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormData({ title: '', company: '', location: '', description: '', job_type: 'Full-time', apply_url: '', expires_at: '', is_active: true });
        setEditingJobId(null);
        await loadJobs();
      } else {
        const data = await res.json();
        if (data.details) {
          const errorMessages = Object.entries(data.details)
            .filter(([key]) => key !== '_errors')
            .map(([key, val]: any) => `${key}: ${val._errors?.join(', ')}`);
          setError(`Validation Error: ${errorMessages.join(' | ')}`);
        } else {
          setError(data.error || `Failed to ${editingJobId ? 'update' : 'create'} job`);
        }
      }
    } catch (err) {
      setError(`Network error ${editingJobId ? 'updating' : 'creating'} job.`);
    } finally {
      setSaving(false);
    }
  };

  const toggleJobStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        await loadJobs();
      }
    } catch (err) {
      alert('Failed to update job status');
    }
  };

  const handleEdit = (job: any) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location || '',
      description: job.description,
      job_type: job.job_type,
      apply_url: job.apply_url,
      expires_at: job.expires_at ? new Date(job.expires_at).toISOString().split('T')[0] : '',
      is_active: job.is_active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadJobs();
      } else {
        alert('Failed to delete job');
      }
    } catch (err) {
      alert('Network error deleting job');
    }
  };

  const cancelEdit = () => {
    setEditingJobId(null);
    setFormData({ title: '', company: '', location: '', description: '', job_type: 'Full-time', apply_url: '', expires_at: '', is_active: true });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>Checking permissions...</div>;
  if (!isAdmin) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text2)' }}>Manage Job Yard listings.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Create Job Form */}
        <div style={{ flex: '1 1 350px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>
              {editingJobId ? 'Edit Job' : 'Post New Job'}
            </h2>
            
            {error && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Title</label>
                <input type="text" name="title" required className="input-field" value={formData.title} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Company</label>
                <input type="text" name="company" required className="input-field" value={formData.company} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Location</label>
                <input type="text" name="location" required className="input-field" value={formData.location} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Job Type</label>
                <select name="job_type" required className="input-field" value={formData.job_type} onChange={handleChange}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="label">Apply URL</label>
                <input type="url" name="apply_url" required className="input-field" value={formData.apply_url} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Expiration Date</label>
                <input type="date" name="expires_at" required className="input-field" value={formData.expires_at} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Is Active</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                  <span style={{ fontSize: '0.875rem' }}>Job is open for applications</span>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea name="description" required className="input-field" rows={5} value={formData.description} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, padding: '0.75rem' }}>
                  {saving ? (editingJobId ? 'Updating...' : 'Creating...') : (editingJobId ? 'Update Job' : 'Create Job Post')}
                </button>
                {editingJobId && (
                  <button type="button" className="btn btn-outline" onClick={cancelEdit} style={{ padding: '0.75rem' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Existing Jobs List */}
        <div style={{ flex: '2 1 500px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Existing Listings</h2>
            
            {jobs.length === 0 ? (
              <p style={{ color: 'var(--text2)' }}>No jobs found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {jobs.map(job => (
                  <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface2)' }}>
                    <div style={{ overflow: 'hidden', paddingRight: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text2)', margin: 0 }}>
                        {job.company} • {job.is_active ? 'Active' : 'Closed'}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => handleEdit(job)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`btn ${job.is_active ? 'btn-danger' : 'btn-outline'}`}
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => toggleJobStatus(job.id, job.is_active)}
                      >
                        {job.is_active ? 'Close' : 'Re-open'}
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => handleDelete(job.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
