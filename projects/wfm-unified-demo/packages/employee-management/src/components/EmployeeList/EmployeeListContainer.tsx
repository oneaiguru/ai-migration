import type { FC } from 'react';
import EmployeeEditDrawer from '../EmployeeEditDrawer';
import type { EmployeeListContainerProps } from './useEmployeeListState';
import { useEmployeeListState } from './useEmployeeListState';
import { Toolbar } from './Toolbar';
import { Filters } from './Filters';
import { Table } from './Table';
import { BulkEditDrawer } from './BulkEditDrawer';
import { TagManagerOverlay } from './TagManagerOverlay';
import { ColumnSettingsOverlay } from './ColumnSettingsOverlay';
import { ImportExportModals } from './ImportExportModals';

const EmployeeListContainer: FC<EmployeeListContainerProps> = (props) => {
  const state = useEmployeeListState(props);
  return (
    <>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={state.importInputRef}
        className="sr-only"
        onChange={state.handleImportChange}
      />

      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="sr-only" aria-live="polite">{state.liveMessage}</div>
        <Toolbar state={state} />
        <Filters state={state} />
        <Table state={state} />
      </div>

      <BulkEditDrawer state={state} />
      <TagManagerOverlay state={state} />
      <ColumnSettingsOverlay state={state} />
      <ImportExportModals state={state} />

      <EmployeeEditDrawer
        employee={state.activeEmployee}
        isOpen={Boolean(state.activeEmployee)}
        mode="edit"
        isLoading={state.isDrawerLoading}
        onClose={state.handleDrawerClose}
        onSave={state.handleDrawerSave}
        onDismiss={state.handleDismissEmployee}
        onRestore={state.handleRestoreEmployee}
      />
    </>
  );
};

export default EmployeeListContainer;
