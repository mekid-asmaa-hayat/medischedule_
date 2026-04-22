// src/lib/validations/doctor.ts
import { z } from "zod";

export const createDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  specialtyId: z.string().min(1, "Specialty is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  bio: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  isAcceptingPatients: z.boolean().default(true),
});

export const updateDoctorSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  specialtyId: z.string().optional(),
  bio: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  isAcceptingPatients: z.boolean().optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
