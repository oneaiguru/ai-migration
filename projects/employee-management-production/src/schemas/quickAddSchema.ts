import { z } from 'zod';

export const quickAddEmployeeSchema = z
  .object({
    login: z
      .string()
      .trim()
      .min(1, 'Укажите логин')
      .regex(/^[a-zA-Z0-9._-]{3,}$/u, 'Минимум 3 символа (латиница, цифры, ._- )'),
    password: z.string().trim().min(6, 'Пароль от 6 символов'),
    confirm: z.string().trim().min(1, 'Повторите пароль'),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirm) {
      ctx.addIssue({
        path: ['confirm'],
        code: z.ZodIssueCode.custom,
        message: 'Пароли должны совпадать',
      });
    }
  });

export type QuickAddEmployeeFormValues = z.infer<typeof quickAddEmployeeSchema>;

export const createQuickAddDefaults = (): QuickAddEmployeeFormValues => ({
  login: '',
  password: '',
  confirm: '',
});
