'use client';
// @ts-nocheck
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    college: '',
    degree: '',
    graduation_year: '',
    bio: ''
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setFormData({
              full_name: data.profile.full_name || '',
              phone: data.profile.phone || '',
              college: data.profile.college || '',
              degree: data.profile.degree || '',
              graduation_year: data.profile.graduation_year?.toString() || '',
              bio: data.profile.bio || ''
            });
          }
        }
      } catch (err) {
        setMessage({ text: 'Error loading profile', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = { ...formData };
      if (payload.graduation_year) {
        (payload as any).graduation_year = parseInt(payload.graduation_year, 10);
      } else {
        delete (payload as any).graduation_year;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        window.dispatchEvent(new Event('profileUpdated'));
      } else if (res.status === 400) {
        const data = await res.json();
        setMessage({ text: `Validation Error: ${JSON.stringify(data.error || data)}`, type: 'error' });
      } else {
        setMessage({ text: 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text2)' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Profile</h1>
        <p style={{ color: 'var(--text2)' }}>Manage your personal information.</p>
      </div>

      <div className="card">
        {message.text && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: message.type === 'error' ? 'var(--error)' : 'var(--success)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="input-field"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              name="phone"
              className="input-field"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">College</label>
            <input
              type="text"
              name="college"
              className="input-field"
              value={formData.college}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="label">Degree</label>
              <input
                type="text"
                name="degree"
                className="input-field"
                value={formData.degree}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Graduation Year</label>
              <input
                type="number"
                name="graduation_year"
                className="input-field"
                value={formData.graduation_year}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              name="bio"
              className="input-field"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '120px' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
