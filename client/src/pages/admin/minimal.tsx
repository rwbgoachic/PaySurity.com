// Minimal test page for React functionality without complex dependencies

import React from 'react';

export default function MinimalReactPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          color: '#333',
          marginTop: 0,
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          Minimal React Test Page
        </h1>
        
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          color: '#047857',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>React Test</p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            If you can see this page with styling, React is rendering correctly.
          </p>
        </div>
        
        <div style={{
          backgroundColor: '#dbeafe',
          border: '1px solid #3b82f6',
          color: '#1e40af',
          padding: '1rem',
          borderRadius: '6px'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Inline Styles Test</p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            This page uses inline styles instead of Tailwind CSS or external stylesheets.
          </p>
        </div>
      </div>
    </div>
  );
}