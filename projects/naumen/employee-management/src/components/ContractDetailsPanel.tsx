// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/ContractDetailsPanel.tsx

import React, { useState } from 'react';
import { Employee } from '../types/employee';

// ========================
// CONTRACT DETAILS PANEL - Employment contract management
// Comprehensive contract information display and document management
// ========================

interface ContractDetailsPanelProps {
  employee: Employee;
  onUpdate?: (contractData: ContractData) => void;
  onDocumentUpload?: (file: File, type: string) => void;
  onDocumentDelete?: (documentId: string) => void;
  editable?: boolean;
}

interface ContractData {
  contractNumber: string;
  contractType: 'full-time' | 'part-time' | 'contractor' | 'temporary';
  startDate: Date;
  endDate?: Date;
  probationPeriod?: number; // months
  salary: {
    amount: number;
    currency: string;
    paymentSchedule: 'monthly' | 'weekly' | 'hourly';
  };
  workingHours: {
    hoursPerWeek: number;
    schedule: string;
    overtime: boolean;
  };
  benefits: string[];
  documents: ContractDocument[];
  renewalTerms?: string;
  terminationNotice: number; // days
}

interface ContractDocument {
  id: string;
  name: string;
  type: 'contract' | 'amendment' | 'policy' | 'certificate' | 'other';
  uploadDate: Date;
  size: number;
  url: string;
  signed: boolean;
}

const ContractDetailsPanel: React.FC<ContractDetailsPanelProps> = ({
  employee,
  onUpdate,
  onDocumentUpload,
  onDocumentDelete,
  editable = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  
  // Mock contract data
  const [contractData, setContractData] = useState<ContractData>({
    contractNumber: `CON-${employee.employeeId}-2024`,
    contractType: employee.workInfo.contractType,
    startDate: employee.workInfo.hireDate,
    probationPeriod: 3,
    salary: {
      amount: employee.workInfo.salary || 50000,
      currency: 'KGS',
      paymentSchedule: 'monthly'
    },
    workingHours: {
      hoursPerWeek: 40,
      schedule: 'Пн-Пт 9:00-18:00',
      overtime: true
    },
    benefits: [
      'Медицинская страховка',
      'Оплачиваемый отпуск 24 дня',
      'Обучение и развитие',
      'Компенсация проезда'
    ],
    documents: [
      {
        id: 'doc1',
        name: 'Трудовой договор',
        type: 'contract',
        uploadDate: employee.workInfo.hireDate,
        size: 245760,
        url: '#',
        signed: true
      },
      {
        id: 'doc2',
        name: 'Должностная инструкция',
        type: 'policy',
        uploadDate: employee.workInfo.hireDate,
        size: 156800,
        url: '#',
        signed: true
      }
    ],
    terminationNotice: 14
  });

  const getContractTypeLabel = (type: ContractData['contractType']): string => {
    const labels = {
      'full-time': 'Полная занятость',
      'part-time': 'Частичная занятость',
      'contractor': 'Подрядчик',
      'temporary': 'Временный'
    };
    return labels[type];
  };

  const getDocumentTypeIcon = (type: ContractDocument['type']): string => {
    const icons = {
      contract: '📄',
      amendment: '📝',
      policy: '📋',
      certificate: '🏆',
      other: '📎'
    };
    return icons[type];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const DocumentUploadModal: React.FC = () => {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<ContractDocument['type']>('other');

    if (!showDocumentUpload) return null;

    const handleFileSelect = (file: File) => {
      setSelectedFile(file);
    };

    const handleUpload = () => {
      if (selectedFile) {
        onDocumentUpload?.(selectedFile, documentType);
        setShowDocumentUpload(false);
        setSelectedFile(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900">Загрузить документ</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип документа</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as ContractDocument['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="contract">Договор</option>
                <option value="amendment">Дополнительное соглашение</option>
                <option value="policy">Политика/Инструкция</option>
                <option value="certificate">Сертификат</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = Array.from(e.dataTransfer.files);
                if (files[0]) handleFileSelect(files[0]);
              }}
            >
              {selectedFile ? (
                <div>
                  <div className="text-4xl text-green-500 mb-2">📄</div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-4xl text-gray-400 mb-4">📁</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Выберите файл</p>
                  <p className="text-sm text-gray-600 mb-4">или перетащите файл сюда</p>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Выбрать файл
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDocumentUpload(false);
                setSelectedFile(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Загрузить
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Детали контракта</h2>
            <p className="text-gray-600">
              {employee.personalInfo.firstName} {employee.personalInfo.lastName} - {employee.employeeId}
            </p>
          </div>
          
          {editable && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isEditing ? 'Отмена' : 'Редактировать'}
              </button>
              {isEditing && (
                <button
                  onClick={() => {
                    onUpdate?.(contractData);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Сохранить
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Contract Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Основная информация
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер договора</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={contractData.contractNumber}
                    onChange={(e) => setContractData(prev => ({ ...prev, contractNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{contractData.contractNumber}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип договора</label>
                {isEditing ? (
                  <select
                    value={contractData.contractType}
                    onChange={(e) => setContractData(prev => ({ ...prev, contractType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-time">Полная занятость</option>
                    <option value="part-time">Частичная занятость</option>
                    <option value="contractor">Подрядчик</option>
                    <option value="temporary">Временный</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{getContractTypeLabel(contractData.contractType)}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                <p className="text-gray-900">{contractData.startDate.toLocaleDateString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Испытательный срок</label>
                <p className="text-gray-900">{contractData.probationPeriod} месяцев</p>
              </div>
            </div>

            {/* Salary Info */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Оплата труда</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Оклад</label>
                  <p className="text-gray-900 font-semibold">
                    {contractData.salary.amount.toLocaleString()} {contractData.salary.currency}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Периодичность</label>
                  <p className="text-gray-900">
                    {contractData.salary.paymentSchedule === 'monthly' ? 'Ежемесячно' :
                     contractData.salary.paymentSchedule === 'weekly' ? 'Еженедельно' : 'Почасовая'}
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Рабочее время</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Часов в неделю</label>
                  <p className="text-gray-900">{contractData.workingHours.hoursPerWeek}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">График</label>
                  <p className="text-gray-900">{contractData.workingHours.schedule}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Сверхурочные</label>
                  <p className="text-gray-900">{contractData.workingHours.overtime ? 'Разрешены' : 'Не разрешены'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits and Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Льготы и документы
            </h3>
            
            {/* Benefits */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Льготы и компенсации</h4>
              <div className="space-y-2">
                {contractData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Документы</h4>
                {editable && (
                  <button
                    onClick={() => setShowDocumentUpload(true)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Добавить
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {contractData.documents.map(document => (
                  <div key={document.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDocumentTypeIcon(document.type)}</span>
                        <div>
                          <h5 className="font-medium text-gray-900">{document.name}</h5>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(document.size)} • {document.uploadDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {document.signed && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Подписан
                          </span>
                        )}
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          📥
                        </button>
                        {editable && (
                          <button
                            onClick={() => onDocumentDelete?.(document.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract Terms */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Условия расторжения</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">Уведомление об увольнении</label>
                <p className="text-gray-900">{contractData.terminationNotice} дней</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal />
    </div>
  );
};

export default ContractDetailsPanel;