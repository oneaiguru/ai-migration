import React, { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import ScheduleGridContainer from './components/ScheduleGridContainer';
import ShiftTemplateManager from './components/ShiftTemplateManager';
import SchemaBuilder from './components/SchemaBuilder';
import ExceptionManager from './components/ExceptionManager';
import ReferenceDataConfigurationUI from './modules/reference-data-management/components/ReferenceDataConfigurationUI';
import AdvancedUIManager from './modules/advanced-ui-ux/components/AdvancedUIManager';
import EnhancedEmployeeProfilesUI from './modules/employee-management-enhanced/components/EnhancedEmployeeProfilesUI';
import ReportBuilderUI from './modules/reporting-analytics/components/ReportBuilderUI';
import LoadPlanningUI from './modules/forecasting-ui/components/LoadPlanningUI';
import ScheduleOptimizationUI from './modules/schedule-optimization/components/ScheduleOptimizationUI';
import TimeAttendanceUI from './modules/time-attendance/components/TimeAttendanceUI';
import IntegrationDashboardUI from './modules/integration-ui/components/IntegrationDashboardUI';
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
      case 'reference-data':
        return <ReferenceDataConfigurationUI />;
      case 'ui/advanced':
        return <AdvancedUIManager />;
      case 'employees/enhanced-profiles':
        return <EnhancedEmployeeProfilesUI />;
      case 'reports/builder':
        return <ReportBuilderUI />;
      case 'forecasting/load-planning':
        return <LoadPlanningUI />;
      case 'scheduling/optimization':
        return <ScheduleOptimizationUI />;
      case 'time-attendance/dashboard':
        return <TimeAttendanceUI />;
      case 'integrations/dashboard':
        return <IntegrationDashboardUI />;
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