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

export const DocumentSchema = z.object({
  documentId: z.string(),
  contractId: z.string(),
  originalName: z.string(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  data: z.string(), // Base64 or download URL
  uploadedAt: z.date(),
  // For frontend compatibility
  id: z.string(),
  name: z.string(),
  type: z.string(),
  uploadDate: z.string(),
});

export type Document = z.infer<typeof DocumentSchema>;

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
  documents: z.array(DocumentSchema),
});

export const UpdateContractDto = z.object({
  name: z.string().min(1).optional(),
  price: z.number().optional(),
  cycle: CycleSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  debitDayOfMonth: z.number().min(1).max(28).optional(),
  category: CategorySchema.optional(),
  isActive: z.boolean().optional(),
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
});

export type ContractDTO = z.infer<typeof ContractDTO>;
export type CreateContractDto = z.infer<typeof CreateContractDto>;

export const CATEGORY_LABELS: Record<Category, string> = {
  INSURANCE: 'Versicherung',
  ENERGY: 'Energie',
  INTERNET: 'Internet',
  PHONE: 'Telefon',
  STREAMING: 'Streaming',
  FOOD: 'Lebensmittel',
  TRANSPORT: 'Transport',
  HEALTH: 'Gesundheit',
  EDUCATION: 'Bildung',
  SUBSCRIPTION: 'Abonnement',
  OTHER: 'Sonstiges',
};

export const CYCLE_LABELS: Record<Cycle, string> = {
  MONTHLY: 'Monatlich',
  QUARTERLY: 'Vierteljährlich',
  HALF_YEARLY: 'Halbjährlich',
  YEARLY: 'Jährlich',
};

// Helper functions to get category/cycle options for UI generation
export function getCategoryOptions() {
  return Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as Category,
    label,
  }));
}

export function getCycleOptions() {
  return Object.entries(CYCLE_LABELS).map(([value, label]) => ({
    value: value as Cycle,
    label,
  }));
}
