import z from 'zod';

export const CycleSchema = z.enum([
  'MONTHLY',
  'QUARTERLY',
  'HALF_YEARLY',
  'YEARLY',
]);
export type Cycle = z.infer<typeof CycleSchema>;

export const CategorySchema = z.enum([
  'INSURANCE',
  'ENERGY',
  'INTERNET',
  'PHONE',
  'STREAMING',
  'FOOD',
  'TRANSPORT',
  'HEALTH',
  'EDUCATION',
  'SUBSCRIPTION',
  'OTHER',
]);
export type Category = z.infer<typeof CategorySchema>;

export const ContractDTO = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  price: z.number(),
  cycle: CycleSchema,
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  isActive: z.boolean(),
  debitDayOfMonth: z.number().min(1).max(28),
  category: CategorySchema,
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      data: z.string(),
      type: z.string(),
      uploadDate: z.string(), // ISO string
    }),
  ),
});

export const CreateContractDto = z.object({
  name: z.string(),
  price: z.number(),
  cycle: CycleSchema,
  startDate: z.string(),
  endDate: z.date().nullable().optional(),
  debitDayOfMonth: z.number().min(1).max(28),
  category: CategorySchema,
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      data: z.string(),
      type: z.string(),
      uploadDate: z.string(), // ISO string
    }),
  ),
  isActive: z.boolean(),
});

export type ContractDTO = z.infer<typeof ContractDTO>;
export type CreateContractDto = z.infer<typeof CreateContractDto>;
