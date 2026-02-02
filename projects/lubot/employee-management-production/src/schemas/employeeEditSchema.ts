import { z } from 'zod';
import type { EmployeeStatus } from '../types/employee';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+?[0-9()\s-]{7,})$/;

export const employeeStatusValues: EmployeeStatus[] = [
  'active',
  'probation',
  'vacation',
  'inactive',
  'terminated',
];

const optionalTrimmedString = () => z.string().trim().optional().default('');

export const employeeEditSchema = z.object({
  personalInfo: z.object({
    lastName: z.string().trim().min(1, 'Укажите фамилию'),
    firstName: z.string().trim().min(1, 'Укажите имя'),
    middleName: optionalTrimmedString(),
    email: z
      .string()
      .trim()
      .min(1, 'Укажите email')
      .regex(emailPattern, 'Неверный формат email'),
    phone: z
      .string()
      .trim()
      .min(1, 'Укажите телефон')
      .regex(phonePattern, 'Неверный формат телефона'),
    address: optionalTrimmedString(),
    dateOfBirth: optionalTrimmedString(),
  }),
  credentials: z.object({
    wfmLogin: z.string().trim().min(1, 'Укажите логин WFM'),
    externalLogins: z.string().trim().min(1, 'Укажите внешние логины'),
    password: optionalTrimmedString(),
  }),
  orgPlacement: z.object({
    orgUnit: z.string().trim().min(1, 'Укажите точку оргструктуры'),
    office: z.string().trim().min(1, 'Укажите офис'),
    timeZone: z.string().trim().min(1, 'Укажите часовой пояс'),
    hourNorm: z
      .string()
      .trim()
      .min(1, 'Укажите норму часов')
      .refine((value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0;
      }, 'Укажите положительное число'),
    workScheme: optionalTrimmedString(),
  }),
  workInfo: z.object({
    position: z.string().trim().min(1, 'Укажите должность'),
    hireDate: optionalTrimmedString(),
  }),
  preferences: z.object({
    preferredShifts: optionalTrimmedString(),
    schemePreferences: optionalTrimmedString(),
  }),
  additional: z.object({
    personnelNumber: optionalTrimmedString(),
    actualAddress: optionalTrimmedString(),
    tasks: optionalTrimmedString(),
  }),
  tags: optionalTrimmedString(),
  status: z.enum(employeeStatusValues),
});

export type EmployeeEditFormValues = z.infer<typeof employeeEditSchema>;
