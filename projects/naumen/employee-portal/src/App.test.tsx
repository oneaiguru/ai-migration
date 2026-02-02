import React from 'react';

// Simple test component to verify React works
function App() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{color: '#2e7d32'}}>✅ Employee Portal - React Working!</h1>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Employee Portal Demo</h2>
        <p>Time: {new Date().toLocaleString()}</p>
        <p>Status: React is rendering successfully!</p>
        <button 
          onClick={() => alert('Button works!')}
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;