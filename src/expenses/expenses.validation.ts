import z, { ZodType } from 'zod';

export class ExpensesValidation {
  static readonly CREATE: ZodType = z.object({
    title: z.string().min(1).max(100),
    amount: z.string().min(1).max(100),
    expense_date: z.string().min(1).max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(100),
    amount: z.string().min(1).max(100),
    expense_date: z.string().min(1).max(100),
  });

  static readonly SEARCH: ZodType = z.object({
    title: z.string().min(1).optional(),
    amount: z.string().min(1).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
