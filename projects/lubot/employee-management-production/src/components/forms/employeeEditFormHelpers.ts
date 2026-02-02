import { Employee } from '../../types/employee';
import { stripRichTextToPlain, toRichText } from '../../utils/importExport';
import { createTaskEntry } from '../../utils/task';
import {
  employeeEditSchema,
  type EmployeeEditFormValues,
} from '../../schemas/employeeEditSchema';
import { zodResolver } from '@hookform/resolvers/zod';

export const mapEmployeeToForm = (employee: Employee): EmployeeEditFormValues => ({
  personalInfo: {
    lastName: employee.personalInfo.lastName,
    firstName: employee.personalInfo.firstName,
    middleName: employee.personalInfo.middleName ?? '',
    email: employee.personalInfo.email,
    phone: employee.personalInfo.phone,
    address: employee.personalInfo.address ?? '',
    dateOfBirth: employee.personalInfo.dateOfBirth
      ? employee.personalInfo.dateOfBirth.toISOString().slice(0, 10)
      : '',
  },
  credentials: {
    wfmLogin: employee.credentials.wfmLogin,
    externalLogins: employee.credentials.externalLogins.join(', '),
    password: '',
  },
  orgPlacement: {
    orgUnit: employee.orgPlacement.orgUnit,
    office: employee.orgPlacement.office,
    timeZone: employee.orgPlacement.timeZone,
    hourNorm: employee.orgPlacement.hourNorm.toString(),
    workScheme: employee.orgPlacement.workScheme?.name ?? '',
  },
  workInfo: {
    position: employee.workInfo.position,
    hireDate: employee.workInfo.hireDate
      .toISOString()
      .slice(0, 10),
  },
  preferences: {
    preferredShifts: employee.preferences.preferredShifts.join(', '),
    schemePreferences: (employee.preferences.schemePreferences ?? []).join(', '),
  },
  additional: {
    personnelNumber: employee.personnelNumber ?? '',
    actualAddress: employee.actualAddress ?? employee.personalInfo.address ?? '',
    tasks: toRichText(employee.tasks?.map((task) => task.message).join('\n') ?? ''),
  },
  tags: employee.tags.join(', '),
  status: employee.status,
});

export const createEmployeeEditDefaultValues = (): EmployeeEditFormValues => ({
  personalInfo: {
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  },
  credentials: {
    wfmLogin: '',
    externalLogins: '',
    password: '',
  },
  orgPlacement: {
    orgUnit: '',
    office: '',
    timeZone: '',
    hourNorm: '40',
    workScheme: '',
  },
  workInfo: {
    position: '',
    hireDate: '',
  },
  preferences: {
    preferredShifts: '',
    schemePreferences: '',
  },
  additional: {
    personnelNumber: '',
    actualAddress: '',
    tasks: toRichText(''),
  },
  tags: '',
  status: 'active',
});

export const mapFormToEmployee = (
  values: EmployeeEditFormValues,
  current: Employee,
): Employee => {
  const externalLogins = values.credentials.externalLogins
    .split(',')
    .map((login) => login.trim())
    .filter(Boolean);

  const preferredShifts = values.preferences.preferredShifts
    .split(',')
    .map((shift) => shift.trim())
    .filter(Boolean);

  const schemePreferences = values.preferences.schemePreferences
    .split(',')
    .map((scheme) => scheme.trim())
    .filter(Boolean);

  const newTaskMessages = stripRichTextToPlain(values.additional.tasks)
    .split(/\r?\n/)
    .map((task) => task.trim())
    .filter(Boolean);

  const updatedTasks =
    newTaskMessages.length > 0
      ? [
          ...(current.tasks ?? []),
          ...newTaskMessages.map((message) => createTaskEntry(message, 'manual')),
        ]
      : current.tasks ?? [];

  return {
    ...current,
    status: values.status,
    personalInfo: {
      ...current.personalInfo,
      lastName: values.personalInfo.lastName.trim(),
      firstName: values.personalInfo.firstName.trim(),
      middleName: values.personalInfo.middleName.trim(),
      email: values.personalInfo.email.trim(),
      phone: values.personalInfo.phone.trim(),
      address: values.personalInfo.address.trim(),
      dateOfBirth: values.personalInfo.dateOfBirth
        ? new Date(values.personalInfo.dateOfBirth)
        : undefined,
    },
    credentials: {
      ...current.credentials,
      wfmLogin: values.credentials.wfmLogin.trim(),
      externalLogins,
      passwordSet:
        current.credentials.passwordSet || values.credentials.password.trim().length > 0,
      passwordLastUpdated:
        values.credentials.password.trim().length > 0
          ? new Date()
          : current.credentials.passwordLastUpdated,
    },
    orgPlacement: {
      ...current.orgPlacement,
      orgUnit: values.orgPlacement.orgUnit.trim(),
      office: values.orgPlacement.office.trim(),
      timeZone: values.orgPlacement.timeZone.trim(),
      hourNorm: Number(values.orgPlacement.hourNorm),
      workScheme: values.orgPlacement.workScheme.trim()
        ? {
            ...(current.orgPlacement.workScheme ?? { id: 'manual', type: 'custom' }),
            name: values.orgPlacement.workScheme.trim(),
            effectiveFrom:
              current.orgPlacement.workScheme?.effectiveFrom ?? new Date(),
          }
        : undefined,
    },
    workInfo: {
      ...current.workInfo,
      position: values.workInfo.position.trim(),
      hireDate: values.workInfo.hireDate
        ? new Date(values.workInfo.hireDate)
        : current.workInfo.hireDate,
    },
    preferences: {
      ...current.preferences,
      preferredShifts:
        preferredShifts.length > 0
          ? preferredShifts
          : current.preferences.preferredShifts,
      schemePreferences:
        schemePreferences.length > 0
          ? schemePreferences
          : current.preferences.schemePreferences,
    },
    personnelNumber: values.additional.personnelNumber.trim() || undefined,
    actualAddress: values.additional.actualAddress.trim() || undefined,
    tasks: updatedTasks,
    tags: values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    metadata: {
      ...current.metadata,
      updatedAt: new Date(),
      lastModifiedBy: 'agent',
    },
  };
};

export const employeeEditResolver = employeeEditSchema;
export const employeeEditFormResolver = zodResolver(employeeEditSchema);
