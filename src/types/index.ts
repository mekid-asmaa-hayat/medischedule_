// src/types/index.ts
import type { User, PatientProfile, DoctorProfile, Specialty, Appointment, Availability, ConsultationNote, Notification } from "@/lib/prisma-types"
import type { AppointmentStatus, Role, DayOfWeek } from "@/lib/prisma-enums";

// ── Re-exports ────────────────────────────────────────────────────
export type {
  User,
  PatientProfile,
  DoctorProfile,
  Specialty,
  Appointment,
  Availability,
  ConsultationNote,
  Notification,
  AppointmentStatus,
  Role,
  DayOfWeek,
};

// ── Enriched types used in components ────────────────────────────

export type DoctorWithProfile = User & {
  doctorProfile:
    | (DoctorProfile & {
        specialty: Specialty;
        availability: Availability[];
      })
    | null;
};

export type PatientWithProfile = User & {
  patientProfile: PatientProfile | null;
};

export type AppointmentWithRelations = Appointment & {
  patient: PatientProfile & { user: User };
  doctor: DoctorProfile & { user: User; specialty: Specialty };
  specialty: Specialty;
  consultationNote?: ConsultationNote | null;
};

export type DoctorCardData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  specialty: string;
  experience: number | null;
  consultationFee: number | null;
  rating: number | null;
  isAcceptingPatients: boolean;
  bio: string | null;
};

// ── API response shapes ───────────────────────────────────────────

export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ── Form / action result ──────────────────────────────────────────

export type ActionResult<T = unknown> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Dashboard stats ───────────────────────────────────────────────

export type AdminStats = {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
};

export type DoctorStats = {
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalPatients: number;
};

export type PatientStats = {
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
};
