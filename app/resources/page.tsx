export default function ResourcesPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh', 
      fontFamily: 'var(--font-inter)', 
      color: 'var(--text)',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--orange)' }}>
        Preparation Resources
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text2)', maxWidth: '600px', marginBottom: '2rem' }}>
        Access a comprehensive library of learning roadmaps, technical interview preparation guides, system design basics, and curated industry knowledge to help you succeed.
      </p>
      <div style={{ 
        padding: '0.5rem 1.5rem', 
        backgroundColor: 'rgba(255, 102, 0, 0.1)', 
        border: '1px solid var(--orange)',
        borderRadius: '20px',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--orange)'
      }}>
        🚀 Coming soon...
      </div>
    </div>
  );
}
