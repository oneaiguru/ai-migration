import React from 'react';

export interface EmployeeItem {
  id: string;
  name: string;
}

interface EmployeeChecklistProps {
  employees: EmployeeItem[];
  selectedIds: string[];
  onChange: (nextSelected: string[]) => void;
  ariaLabel?: string;
  dark?: boolean;
  borderColor?: string;
}

const EmployeeChecklist: React.FC<EmployeeChecklistProps> = ({
  employees,
  selectedIds,
  onChange,
  ariaLabel = 'Список сотрудников',
  dark = false,
  borderColor,
}) => {
  const handleToggle = (id: string, checked: boolean) => {
    const next = checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id);
    onChange(next);
  };

  const textColor = dark ? '#f9fafb' : '#111827';
  const containerBorder = borderColor ?? (dark ? '#374151' : '#e5e7eb');

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        border: `1px solid ${containerBorder}`,
        borderRadius: '6px',
        padding: '8px',
        maxHeight: '120px',
        overflow: 'auto',
        backgroundColor: dark ? '#1f2937' : 'white',
      }}
    >
      {employees.map((employee) => (
        <label
          key={employee.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            color: textColor,
          }}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(employee.id)}
            onChange={(e) => handleToggle(employee.id, e.target.checked)}
            style={{ width: '16px', height: '16px' }}
            aria-label={`Выбрать ${employee.name}`}
          />
          {employee.name}
        </label>
      ))}
    </div>
  );
};

export default EmployeeChecklist;

