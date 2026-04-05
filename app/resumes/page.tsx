'use client';

import { useEffect, useState } from 'react';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch (err) {
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const allowTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowTypes.includes(file.type)) {
      setError('Only PDF and DOCX files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Max file size is 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Refresh list
      await fetchResumes();
      e.target.value = ''; // Reset input
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (resumeId: string) => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}/download-url`);
      if (res.ok) {
        const { downloadUrl } = await res.json();
        window.open(downloadUrl, '_blank');
      } else {
        alert('Failed to get download link');
      }
    } catch (err) {
      alert('Error fetching download link');
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchResumes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete resume');
        setLoading(false);
      }
    } catch (err) {
      alert('Error deleting resume');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Resumes</h1>
        <p style={{ color: 'var(--text2)' }}>Manage your uploaded resumes for job applications.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Upload New Resume</h2>
        
        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '2rem', border: '2px dashed var(--border)', borderRadius: '8px', textAlign: 'center' }}>
          <label 
            className={`btn ${uploading ? 'btn-outline' : 'btn-primary'}`} 
            style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
          >
            {uploading ? 'Uploading...' : 'Select PDF or DOCX (Max 5MB)'}
            <input 
              type="file" 
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Your Files</h2>
        {loading ? (
          <div style={{ color: 'var(--text2)' }}>Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text2)', padding: '3rem 0' }}>
            You haven't uploaded any resumes yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {resumes.map(resume => (
              <div key={resume.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--orange)' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {resume.file_path.split('/').pop()}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text2)', margin: '0.25rem 0 0 0' }}>
                      {(resume.file_size / 1024).toFixed(1)} KB • {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => handleDownload(resume.id)}
                  >
                    Download
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ flex: 1 }}
                    onClick={() => handleDelete(resume.id)}
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
  );
}
