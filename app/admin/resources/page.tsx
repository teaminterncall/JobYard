'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminResourcesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Roadmap',
    description: '',
    link_url: '',
    pdf_path: '',
    is_active: true
  });

  useEffect(() => {
    async function checkAdminAndLoadResources() {
      try {
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile?.role === 'admin') {
            setIsAdmin(true);
            await loadResources();
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
    checkAdminAndLoadResources();
  }, [router]);

  const loadResources = async () => {
    try {
      const res = await fetch('/api/resources?limit=50');
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let uploadedPdfPath = formData.pdf_path;

      if (file) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const uploadRes = await fetch('/api/resources/upload', {
          method: 'POST',
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const ud = await uploadRes.json();
          setError(ud.error || 'Failed to upload PDF');
          setSaving(false);
          return;
        }

        const ud = await uploadRes.json();
        uploadedPdfPath = ud.pdf_path;
      }

      if (!formData.link_url && !uploadedPdfPath) {
        setError("You must provide either a Resource Link or upload a PDF.");
        setSaving(false);
        return;
      }

      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        is_active: formData.is_active,
        link_url: formData.link_url || null,
        pdf_path: uploadedPdfPath || null,
      };

      const url = editingResourceId ? `/api/resources/${editingResourceId}` : '/api/resources';
      const method = editingResourceId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormData({ title: '', category: 'Roadmap', description: '', link_url: '', pdf_path: '', is_active: true });
        setFile(null);
        if (document.getElementById('file-input')) {
          (document.getElementById('file-input') as HTMLInputElement).value = '';
        }
        setEditingResourceId(null);
        await loadResources();
      } else {
        const data = await res.json();
        if (data.details) {
          const errorMessages = Object.entries(data.details)
            .filter(([key]) => key !== '_errors')
            .map(([key, val]: any) => `${key}: ${val._errors?.join(', ')}`);
          setError(`Validation Error: ${errorMessages.join(' | ')}`);
        } else {
          setError(data.error || `Failed to ${editingResourceId ? 'update' : 'create'} resource`);
        }
      }
    } catch (err) {
      setError(`Network error ${editingResourceId ? 'updating' : 'creating'} resource.`);
    } finally {
      setSaving(false);
    }
  };

  const toggleResourceStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        await loadResources();
      }
    } catch (err) {
      alert('Failed to update resource status');
    }
  };

  const handleEdit = (resource: any) => {
    setEditingResourceId(resource.id);
    setFormData({
      title: resource.title,
      category: resource.category,
      description: resource.description,
      link_url: resource.link_url || '',
      pdf_path: resource.pdf_path || '',
      is_active: resource.is_active
    });
    setFile(null);
    if (document.getElementById('file-input')) {
      (document.getElementById('file-input') as HTMLInputElement).value = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadResources();
      } else {
        alert('Failed to delete resource');
      }
    } catch (err) {
      alert('Network error deleting resource');
    }
  };

  const cancelEdit = () => {
    setEditingResourceId(null);
    setFormData({ title: '', category: 'Roadmap', description: '', link_url: '', pdf_path: '', is_active: true });
    setFile(null);
    if (document.getElementById('file-input')) {
      (document.getElementById('file-input') as HTMLInputElement).value = '';
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>Checking permissions...</div>;
  if (!isAdmin) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Manage Resources</h1>
        <p style={{ color: 'var(--text2)' }}>Add or update educational resources available to users.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Create Resource Form */}
        <div style={{ flex: '1 1 350px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>
              {editingResourceId ? 'Edit Resource' : 'Post New Resource'}
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
                <label className="label">Category</label>
                <select name="category" required className="input-field" value={formData.category} onChange={handleChange}>
                  <option value="Roadmap">Roadmap</option>
                  <option value="Interview Prep">Interview Prep</option>
                  <option value="System Design">System Design</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="label">Resource Link (URL)</label>
                <input type="url" name="link_url" className="input-field" value={formData.link_url} onChange={handleChange} placeholder="Optional if uploading PDF" />
              </div>

              <div>
                <label className="label">Upload PDF</label>
                <input id="file-input" type="file" accept=".pdf" className="input-field" onChange={handleFileChange} />
                {formData.pdf_path && !file && (
                   <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: '0.25rem' }}>
                     Current PDF: {formData.pdf_path.split('/').pop()}
                   </p>
                )}
              </div>

              <div>
                <label className="label">Is Active</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                  <span style={{ fontSize: '0.875rem' }}>Resource is publicly visible</span>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea name="description" required className="input-field" rows={5} value={formData.description} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, padding: '0.75rem' }}>
                  {saving ? (editingResourceId ? 'Updating...' : 'Creating...') : (editingResourceId ? 'Update Resource' : 'Create Resource')}
                </button>
                {editingResourceId && (
                  <button type="button" className="btn btn-outline" onClick={cancelEdit} style={{ padding: '0.75rem' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Existing Resources List */}
        <div style={{ flex: '2 1 500px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Existing Resources</h2>

            {resources.length === 0 ? (
              <p style={{ color: 'var(--text2)' }}>No resources found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {resources.map(resource => (
                  <div key={resource.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface2)' }}>
                    <div style={{ overflow: 'hidden', paddingRight: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {resource.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text2)', margin: 0 }}>
                        {resource.category} • {resource.is_active ? 'Active' : 'Hidden'} 
                        {' '}• {resource.link_url && resource.pdf_path ? 'Link & PDF' : resource.pdf_path ? 'PDF Only' : 'Link Only'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => handleEdit(resource)}
                      >
                        Edit
                      </button>
                      <button
                        className={`btn ${resource.is_active ? 'btn-danger' : 'btn-outline'}`}
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => toggleResourceStatus(resource.id, resource.is_active)}
                      >
                        {resource.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        onClick={() => handleDelete(resource.id)}
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
