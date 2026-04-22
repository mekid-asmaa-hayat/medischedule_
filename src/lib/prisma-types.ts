// src/lib/prisma-types.ts
// Mirrors Prisma model types so the project typechecks before `prisma generate` runs.
// After running `prisma generate`, these can be replaced by @prisma/client imports.

import type { Role, AppointmentStatus, DayOfWeek } from "./prisma-enums";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  image: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth: Date | null;
  gender: string | null;
  bloodType: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  address: string | null;
  emergencyContact: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialtyId: string;
  licenseNumber: string;
  bio: string | null;
  experience: number | null;
  consultationFee: unknown | null; // Decimal in Prisma
  rating: number | null;
  isAcceptingPatients: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Specialty {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeOff {
  id: string;
  doctorId: string;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  specialtyId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationNote {
  id: string;
  appointmentId: string;
  doctorId: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  prescription: string | null;
  followUpDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}
