import React from 'react';
import AdminLayout from './components/AdminLayout';
import ScheduleGridContainer from './components/ScheduleGridContainer';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <AdminLayout currentTab="schedule">
        <ScheduleGridContainer />
      </AdminLayout>
    </div>
  );
};

export default App;
