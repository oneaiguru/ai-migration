import React, { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import ScheduleGridContainer from './components/ScheduleGridContainer';
import ShiftTemplateManager from './components/ShiftTemplateManager';
import SchemaBuilder from './components/SchemaBuilder';
import ExceptionManager from './components/ExceptionManager';
import './index.css';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('schedule');

  const renderContent = () => {
    switch (currentTab) {
      case 'schedule':
        return <ScheduleGridContainer />;
      case 'shifts':
        return <ShiftTemplateManager />;
      case 'schemas':
        return <SchemaBuilder />;
      case 'exceptions':
        return <ExceptionManager />;
      default:
        return <ScheduleGridContainer />;
    }
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    console.log(`🔄 Switched to tab: ${tab}`);
  };

  return (
    <div className="App">
      <AdminLayout currentTab={currentTab} onTabChange={handleTabChange}>
        {renderContent()}
      </AdminLayout>
    </div>
  );
};

export default App;