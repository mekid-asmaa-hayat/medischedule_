// src/lib/validations/appointment.ts
import { z } from "zod";
import { AppointmentStatus } from "@/lib/prisma-enums";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  specialtyId: z.string().min(1, "Specialty is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().optional(),
  reason: z.string().min(5).optional(),
  date: z.string().optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
});

export const consultationNoteSchema = z.object({
  appointmentId: z.string().min(1),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  prescription: z.string().optional(),
  followUpDate: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type ConsultationNoteInput = z.infer<typeof consultationNoteSchema>;
