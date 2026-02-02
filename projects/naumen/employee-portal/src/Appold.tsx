import React from 'react';
import EmployeePortalDemo from './components/EmployeePortalDemo';

function App() {
  return (
    <div className="App">
      <EmployeePortalDemo 
        theme="light" 
        locale="ru" 
        demoMode={true} 
      />
    </div>
  );
}

export default App;
