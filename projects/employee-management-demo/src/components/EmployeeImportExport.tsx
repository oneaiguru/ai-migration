// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeImportExport.tsx

import React, { useState, useRef } from 'react';
import { Employee, Team, Skill } from '../types/employee';

// ========================
// EMPLOYEE IMPORT/EXPORT - CSV/Excel functionality
// Based on Chat 6 form patterns with robust data handling
// ========================

interface EmployeeImportExportProps {
  teams: Team[];
  onImportComplete: (employees: Employee[]) => void;
  onExport: (selectedIds?: string[]) => void;
  selectedEmployees?: string[];
  isOpen: boolean;
  onClose: () => void;
}

interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface ImportPreview {
  valid: Employee[];
  errors: ImportError[];
  total: number;
}

const EmployeeImportExport: React.FC<EmployeeImportExportProps> = ({
  teams,
  onImportComplete,
  onExport,
  selectedEmployees = [],
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importStep, setImportStep] = useState(1);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
  const [exportOptions, setExportOptions] = useState({
    includeSkills: true,
    includePerformance: true,
    includePersonalInfo: true,
    selectedOnly: selectedEmployees.length > 0
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Sample CSV template for download
  const csvTemplate = `firstName,lastName,email,phone,position,team,manager,hireDate,contractType
Иван,Иванов,ivan.ivanov@company.com,+996555000001,Оператор,Группа поддержки,Менеджер Петров,2024-01-15,full-time
Мария,Петрова,maria.petrova@company.com,+996555000002,Старший оператор,Группа продаж,Менеджер Сидоров,2023-06-10,full-time`;

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  // Parse CSV data
  const parseCSV = (csvText: string) => {
    setIsProcessing(true);
    
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      
      setImportedData(data);
      validateImportData(data);
      setImportStep(2);
    } catch (error) {
      console.error('Error parsing CSV:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Validate imported data
  const validateImportData = (data: any[]) => {
    const validEmployees: Employee[] = [];
    const errors: ImportError[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header

      // Validate required fields
      if (!row.firstName) {
        errors.push({
          row: rowNumber,
          field: 'firstName',
          value: row.firstName,
          message: 'Имя обязательно для заполнения'
        });
      }

      if (!row.lastName) {
        errors.push({
          row: rowNumber,
          field: 'lastName',
          value: row.lastName,
          message: 'Фамилия обязательна для заполнения'
        });
      }

      if (!row.email) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: row.email,
          message: 'Email обязателен для заполнения'
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: row.email,
          message: 'Неверный формат email'
        });
      }

      if (!row.position) {
        errors.push({
          row: rowNumber,
          field: 'position',
          value: row.position,
          message: 'Должность обязательна для заполнения'
        });
      }

      // Find team
      const team = teams.find(t => t.name === row.team);
      if (!team) {
        errors.push({
          row: rowNumber,
          field: 'team',
          value: row.team,
          message: `Команда "${row.team}" не найдена`
        });
      }

      // If no critical errors, create employee object
      if (row.firstName && row.lastName && row.email && row.position && team) {
        const employee: Employee = {
          id: `imp_${Date.now()}_${index}`,
          employeeId: `EMP${String(index + 1).padStart(3, '0')}`,
          personalInfo: {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone || '',
          },
          workInfo: {
            position: row.position,
            team: team,
            manager: row.manager || 'Не указан',
            hireDate: row.hireDate ? new Date(row.hireDate) : new Date(),
            contractType: (row.contractType as Employee['workInfo']['contractType']) || 'full-time',
            workLocation: 'Офис Бишкек',
            department: team.name.includes('поддержки') ? 'Клиентская поддержка' : 
                       team.name.includes('продаж') ? 'Продажи' : 'Общий'
          },
          skills: [],
          status: 'probation',
          preferences: {
            preferredShifts: ['day'],
            notifications: {
              email: true,
              sms: true,
              push: true,
              scheduleChanges: true,
              announcements: true,
              reminders: true
            },
            language: 'ru',
            workingHours: {
              start: '09:00',
              end: '18:00'
            }
          },
          performance: {
            averageHandleTime: 0,
            callsPerHour: 0,
            qualityScore: 0,
            adherenceScore: 0,
            customerSatisfaction: 0,
            lastEvaluation: new Date()
          },
          certifications: [],
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'import_system',
            lastModifiedBy: 'import_system'
          }
        };

        validEmployees.push(employee);
      }
    });

    setImportPreview({
      valid: validEmployees,
      errors,
      total: data.length
    });
  };

  // Handle import confirmation
  const confirmImport = () => {
    if (importPreview?.valid) {
      onImportComplete(importPreview.valid);
      setImportStep(3);
    }
  };

  // Handle export
  const handleExport = () => {
    const options = {
      ...exportOptions,
      format: exportFormat,
      selectedIds: exportOptions.selectedOnly ? selectedEmployees : undefined
    };
    
    onExport(options.selectedIds);
    onClose();
  };

  // Download CSV template
  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'employee_template.csv';
    link.click();
  };

  // Reset import process
  const resetImport = () => {
    setImportStep(1);
    setImportedData([]);
    setImportPreview(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Импорт/Экспорт сотрудников</h2>
            <p className="text-sm text-gray-500">Массовые операции с данными сотрудников</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('import')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📥 Импорт
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📤 Экспорт
            </button>
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'import' ? (
            // Import Tab
            <div className="space-y-6">
              {importStep === 1 && (
                <>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">📁</div>
                    <h3 className="text-lg font-semibold text-gray-900">Импорт сотрудников</h3>
                    <p className="text-gray-600">Загрузите CSV файл с данными сотрудников</p>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Выберите CSV файл
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Или перетащите файл в эту область
                    </p>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Обработка...' : 'Выбрать файл'}
                    </button>
                  </div>

                  {/* Template Download */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 text-xl">💡</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-1">Нужен шаблон?</h4>
                        <p className="text-blue-800 text-sm mb-3">
                          Скачайте готовый шаблон CSV файла с примерами данных
                        </p>
                        <button
                          onClick={downloadTemplate}
                          className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          📥 Скачать шаблон
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Format Requirements */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Требования к формату:</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• Файл должен быть в формате CSV (разделитель - запятая)</li>
                      <li>• Первая строка должна содержать заголовки столбцов</li>
                      <li>• Обязательные поля: firstName, lastName, email, position, team</li>
                      <li>• Названия команд должны точно совпадать с существующими</li>
                      <li>• Даты в формате YYYY-MM-DD (например: 2024-01-15)</li>
                    </ul>
                  </div>
                </>
              )}

              {importStep === 2 && importPreview && (
                <>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900">Предварительный просмотр</h3>
                    <p className="text-gray-600">Проверьте данные перед импортом</p>
                  </div>

                  {/* Import Statistics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{importPreview.total}</div>
                      <div className="text-sm text-blue-800">Всего записей</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{importPreview.valid.length}</div>
                      <div className="text-sm text-green-800">Валидных</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{importPreview.errors.length}</div>
                      <div className="text-sm text-red-800">Ошибок</div>
                    </div>
                  </div>

                  {/* Errors */}
                  {importPreview.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-red-900 mb-3">Обнаружены ошибки:</h4>
                      <div className="max-h-40 overflow-y-auto">
                        {importPreview.errors.slice(0, 10).map((error, index) => (
                          <div key={index} className="text-sm text-red-800 py-1">
                            Строка {error.row}, поле "{error.field}": {error.message}
                          </div>
                        ))}
                        {importPreview.errors.length > 10 && (
                          <div className="text-sm text-red-600 mt-2">
                            И еще {importPreview.errors.length - 10} ошибок...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Valid Employees Preview */}
                  {importPreview.valid.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-green-900 mb-3">
                        Готовы к импорту ({importPreview.valid.length}):
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        {importPreview.valid.slice(0, 5).map((employee, index) => (
                          <div key={index} className="text-sm text-green-800 py-1">
                            {employee.personalInfo.firstName} {employee.personalInfo.lastName} - {employee.workInfo.position}
                          </div>
                        ))}
                        {importPreview.valid.length > 5 && (
                          <div className="text-sm text-green-600 mt-2">
                            И еще {importPreview.valid.length - 5} сотрудников...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between">
                    <button
                      onClick={resetImport}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Назад
                    </button>
                    
                    <button
                      onClick={confirmImport}
                      disabled={importPreview.valid.length === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Импортировать {importPreview.valid.length} сотрудников
                    </button>
                  </div>
                </>
              )}

              {importStep === 3 && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Импорт завершен!</h3>
                  <p className="text-gray-600 mb-6">
                    Сотрудники успешно добавлены в систему
                  </p>
                  <button
                    onClick={() => {
                      resetImport();
                      onClose();
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Export Tab
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📤</div>
                <h3 className="text-lg font-semibold text-gray-900">Экспорт сотрудников</h3>
                <p className="text-gray-600">Выгрузите данные сотрудников в файл</p>
              </div>

              {/* Export Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Формат файла</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="csv"
                        checked={exportFormat === 'csv'}
                        onChange={(e) => setExportFormat(e.target.value as any)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">CSV</div>
                        <div className="text-sm text-gray-500">Для Excel и Google Sheets</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="xlsx"
                        checked={exportFormat === 'xlsx'}
                        onChange={(e) => setExportFormat(e.target.value as any)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">Excel (XLSX)</div>
                        <div className="text-sm text-gray-500">Формат Microsoft Excel</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Включить данные</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includePersonalInfo}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includePersonalInfo: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Личная информация</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeSkills}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeSkills: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Навыки сотрудников</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includePerformance}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includePerformance: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Показатели производительности</span>
                    </label>
                  </div>
                </div>

                {selectedEmployees.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Объем экспорта</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={!exportOptions.selectedOnly}
                          onChange={() => setExportOptions(prev => ({ ...prev, selectedOnly: false }))}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Все сотрудники</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={exportOptions.selectedOnly}
                          onChange={() => setExportOptions(prev => ({ ...prev, selectedOnly: true }))}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          Только выбранные ({selectedEmployees.length})
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Параметры экспорта:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Формат: {exportFormat.toUpperCase()}</li>
                  <li>• Сотрудники: {exportOptions.selectedOnly ? `${selectedEmployees.length} выбранных` : 'Все'}</li>
                  <li>• Личные данные: {exportOptions.includePersonalInfo ? 'Да' : 'Нет'}</li>
                  <li>• Навыки: {exportOptions.includeSkills ? 'Да' : 'Нет'}</li>
                  <li>• Производительность: {exportOptions.includePerformance ? 'Да' : 'Нет'}</li>
                </ul>
              </div>

              {/* Export Actions */}
              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                
                <button
                  onClick={handleExport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📤 Экспортировать
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeImportExport;