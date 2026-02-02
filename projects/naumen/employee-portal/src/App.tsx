import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'schedule' | 'requests'>('dashboard');

  const views = [
    { id: 'dashboard', label: 'Personal Dashboard', icon: '🏠' },
    { id: 'schedule', label: 'My Schedule', icon: '📅' },
    { id: 'requests', label: 'Time Off Requests', icon: '📝' }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div style={{ padding: '20px' }}>
            <h2>👋 Welcome, Employee!</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>📊 This Week</h3>
                <p>Hours Scheduled: <strong>40</strong></p>
                <p>Overtime: <strong>0</strong></p>
                <p>Next Shift: <strong>Tomorrow 9:00 AM</strong></p>
              </div>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>📋 Requests</h3>
                <p>Pending: <strong>1</strong></p>
                <p>Approved: <strong>3</strong></p>
                <p>Available Days Off: <strong>12</strong></p>
              </div>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div style={{ padding: '20px' }}>
            <h2>📅 My Schedule</h2>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Day</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Shift</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px' }}>Monday</td>
                    <td style={{ padding: '10px' }}>9:00 AM - 5:00 PM</td>
                    <td style={{ padding: '10px' }}>8</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px' }}>Tuesday</td>
                    <td style={{ padding: '10px' }}>9:00 AM - 5:00 PM</td>
                    <td style={{ padding: '10px' }}>8</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px' }}>Wednesday</td>
                    <td style={{ padding: '10px' }}>Off</td>
                    <td style={{ padding: '10px' }}>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'requests':
        return (
          <div style={{ padding: '20px' }}>
            <h2>📝 Time Off Requests</h2>
            <button style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              marginBottom: '20px',
              cursor: 'pointer'
            }}>
              New Request
            </button>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Recent Requests</h3>
              <div style={{ marginTop: '10px' }}>
                <div style={{ 
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Dec 25-26, 2024 - Holiday</span>
                  <span style={{ color: '#4caf50' }}>✅ Approved</span>
                </div>
                <div style={{ 
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Jan 15, 2025 - Personal</span>
                  <span style={{ color: '#ff9800' }}>⏳ Pending</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <header style={{
        background: '#1976d2',
        color: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Employee Portal</h1>
      </header>
      
      <nav style={{
        background: 'white',
        padding: '10px 20px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '20px'
      }}>
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => setCurrentView(view.id as any)}
            style={{
              background: currentView === view.id ? '#e3f2fd' : 'transparent',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: currentView === view.id ? '#1976d2' : '#666'
            }}
          >
            {view.icon} {view.label}
          </button>
        ))}
      </nav>

      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;