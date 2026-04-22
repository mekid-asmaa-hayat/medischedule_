// src/lib/validations/specialty.ts
import { z } from "zod";

export const createSpecialtySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const updateSpecialtySchema = createSpecialtySchema.partial();

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>;
export type UpdateSpecialtyInput = z.infer<typeof updateSpecialtySchema>;
