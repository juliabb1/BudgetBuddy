import z from "zod";

enum Cycle {
  MONTHLY,
  QUARTERLY,
  HALF_YEARLY,
  YEARLY,
}

enum Category {
  INSURANCE,
  ENERGY,
  INTERNET,
  PHONE,
  STREAMING,
  FOOD,
  TRANSPORT,
  HEALTH,
  EDUCATION,
  SUBSCRIPTION,
  OTHER,
}

export const ContractDTO = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  price: z.number(),
  cycle: z.enum(Cycle),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  isActive: z.boolean(),
  debitDayOfMonth: z.number().min(1).max(28),
  category: z.enum(Category),
});

export type ContractDTO = z.infer<typeof ContractDTO>;
