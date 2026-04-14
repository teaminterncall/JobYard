'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminWeekendSessionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link_url: '',
    is_active: true
  });

  useEffect(() => {
    async function checkAdminAndLoadSessions() {
      try {
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile?.role === 'admin') {
            setIsAdmin(true);
            await loadSessions();
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
    checkAdminAndLoadSessions();
  }, [router]);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/weekend-sessions?limit=50');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...formData };

      const url = editingSessionId ? `/api/weekend-sessions/${editingSessionId}` : '/api/weekend-sessions';
      const method = editingSessionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormData({ name: '', description: '', link_url: '', is_active: true });
        setEditingSessionId(null);
        await loadSessions();
      } else {
        const data = await res.json();
        if (data.details) {
          const errorMessages = Object.entries(data.details)
            .filter(([key]) => key !== '_errors')
            .map(([key, val]: any) => `${key}: ${val._errors?.join(', ')}`);
          setError(`Validation Error: ${errorMessages.join(' | ')}`);
        } else {
          setError(data.error || `Failed to ${editingSessionId ? 'update' : 'create'} session`);
        }
      }
    } catch (err) {
      setError(`Network error ${editingSessionId ? 'updating' : 'creating'} session.`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSessionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/weekend-sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        await loadSessions();
      }
    } catch (err) {
      alert('Failed to update session status');
    }
  };

  const handleEdit = (session: any) => {
    setEditingSessionId(session.id);
    setFormData({
      name: session.name,
      description: session.description,
      link_url: session.link_url,
      is_active: session.is_active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const res = await fetch(`/api/weekend-sessions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadSessions();
      } else {
        alert('Failed to delete session');
      }
    } catch (err) {
      alert('Network error deleting session');
    }
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setFormData({ name: '', description: '', link_url: '', is_active: true });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>Checking permissions...</div>;
  if (!isAdmin) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Manage Weekend Sessions</h1>
        <p style={{ color: 'var(--text2)' }}>Add or update weekend cohort learning sessions.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Create Session Form */}
        <div style={{ flex: '1 1 350px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>
              {editingSessionId ? 'Edit Session' : 'Post New Session'}
            </h2>

            {error && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Session Name</label>
                <input type="text" name="name" required className="input-field" value={formData.name} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Meeting Link (URL)</label>
                <input type="url" name="link_url" required className="input-field" value={formData.link_url} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Is Active</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                  <span style={{ fontSize: '0.875rem' }}>Session is visible to users</span>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea name="description" required className="input-field" rows={5} value={formData.description} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, padding: '0.75rem' }}>
                  {saving ? (editingSessionId ? 'Updating...' : 'Creating...') : (editingSessionId ? 'Update Session' : 'Create Session')}
                </button>
                {editingSessionId && (
                  <button type="button" className="btn btn-outline" onClick={cancelEdit} style={{ padding: '0.75rem' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Existing Sessions List */}
        <div style={{ flex: '2 1 500px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Existing Sessions</h2>

            {sessions.length === 0 ? (
              <p style={{ color: 'var(--text2)' }}>No sessions found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessions.map(session => (
                  <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface2)' }}>
                    <div style={{ overflow: 'hidden', paddingRight: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text2)', margin: 0 }}>
                        {session.is_active ? 'Active' : 'Hidden'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => handleEdit(session)}
                      >
                        Edit
                      </button>
                      <button
                        className={`btn ${session.is_active ? 'btn-danger' : 'btn-outline'}`}
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => toggleSessionStatus(session.id, session.is_active)}
                      >
                        {session.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => handleDelete(session.id)}
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
