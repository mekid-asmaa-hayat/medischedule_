// src/lib/prisma-enums.ts
// These mirror the Prisma schema enums exactly.
// Once `prisma generate` runs, you can import directly from "@prisma/client" instead.

export const Role = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  STAFF: "STAFF",
  PATIENT: "PATIENT",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const AppointmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  NO_SHOW: "NO_SHOW",
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const DayOfWeek = {
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY",
} as const;
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];
