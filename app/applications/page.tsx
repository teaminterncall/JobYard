'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    location: '',
    platform: 'External',
    apply_url: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await fetch(`/api/applications/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          setEditingId(null);
          setShowForm(false);
          fetchApplications();
        }
      } else {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          setShowForm(false);
          fetchApplications();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (app: any) => {
    setFormData({
      company_name: app.company_name,
      job_title: app.job_title,
      location: app.location || '',
      platform: app.platform || 'External',
      apply_url: app.apply_url || '',
      status: app.status || 'Applied',
      applied_date: new Date(app.applied_date).toISOString().split('T')[0],
      notes: app.notes || ''
    });
    setEditingId(app.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      company_name: '',
      job_title: '',
      location: '',
      platform: 'External',
      apply_url: '',
      status: 'Applied',
      applied_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const statusColors: Record<string, string> = {
    'Applied': 'badge-info',
    'Interviewing': 'badge-orange',
    'Offer': 'badge-success',
    'Rejected': 'badge-error'
  };

  // Add badge-success and badge-error to globals.css conceptually, using inline styles for now if not present
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Applied': return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'Interviewing': return { backgroundColor: 'var(--orange-glow)', color: 'var(--orange)', border: '1px solid rgba(244, 115, 42, 0.2)' };
      case 'Offer': return { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.2)' };
      case 'Rejected': return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      default: return { backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' };
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Job Tracker</h1>
          <p style={{ color: 'var(--text2)' }}>Track applications across JobYard and other platforms.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => { cancelForm(); setShowForm(true); }}
        >
          + Add Application
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--orange)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            {editingId ? 'Edit Application' : 'New Application'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Company Name *</label>
                <input required type="text" name="company_name" className="input-field" value={formData.company_name} onChange={handleInputChange} />
              </div>
              <div>
                <label className="label">Job Title *</label>
                <input required type="text" name="job_title" className="input-field" value={formData.job_title} onChange={handleInputChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Location</label>
                <input type="text" name="location" className="input-field" value={formData.location} onChange={handleInputChange} placeholder="e.g. Remote, NYC" />
              </div>
              <div>
                <label className="label">Platform</label>
                <input type="text" name="platform" className="input-field" value={formData.platform} onChange={handleInputChange} placeholder="e.g. JobYard, LinkedIn" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Status</label>
                <select name="status" className="input-field" value={formData.status} onChange={handleInputChange}>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Accepted">Accepted</option>
                </select>
              </div>
              <div>
                <label className="label">Date Applied</label>
                <input type="date" name="applied_date" className="input-field" value={formData.applied_date} onChange={handleInputChange} />
              </div>
              <div>
                <label className="label">Link to Posting</label>
                <input type="url" name="apply_url" className="input-field" value={formData.apply_url} onChange={handleInputChange} placeholder="https://..." />
              </div>
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea name="notes" className="input-field" rows={3} value={formData.notes} onChange={handleInputChange} placeholder="Interview details, contact emails, etc." />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={cancelForm}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'} Application</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>
          You haven't tracked any applications yet. Click "Add Application" to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app) => (
            <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {app.job_title}
                    <span className="badge" style={{ fontSize: '0.7rem', ...getBadgeStyle(app.status) }}>
                      {app.status}
                    </span>
                  </h2>
                  <div style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>
                    {app.company_name} {app.location && `• ${app.location}`}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(app)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Edit</button>
                  <button onClick={() => handleDelete(app.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Delete</button>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text3)' }}>Platform: <span style={{ color: 'var(--text)' }}>{app.platform}</span></span>
                <span style={{ color: 'var(--border2)' }}>|</span>
                <span style={{ color: 'var(--text3)' }}>Applied: <span style={{ color: 'var(--text)' }}>{new Date(app.applied_date).toLocaleDateString()}</span></span>
                {app.apply_url && (
                  <>
                    <span style={{ color: 'var(--border2)' }}>|</span>
                    <a href={app.apply_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)', textDecoration: 'underline' }}>
                      View Posting
                    </a>
                  </>
                )}
              </div>

              {app.notes && (
                <div style={{ backgroundColor: 'var(--surface2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>
                  {app.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
