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
  contractId: z.string(),
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

export const UpdateContractDto = z.object({
  name: z.string().min(1).optional(),
  price: z.number().optional(),
  cycle: CycleSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  debitDayOfMonth: z.number().min(1).max(28).optional(),
  category: CategorySchema.optional(),
});

export const CreateContractDto = z.object({
  name: z.string(),
  price: z.number(),
  cycle: CycleSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  category: CategorySchema,
  debitDayOfMonth: z.number().min(1).max(28),
  isActive: z.boolean(),
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

export type ContractDTO = z.infer<typeof ContractDTO>;
export type CreateContractDto = z.infer<typeof CreateContractDto>;
