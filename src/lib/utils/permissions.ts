// src/lib/utils/permissions.ts
import type { Role } from "@/lib/prisma-enums";

export function canAccessAdmin(role: Role) {
  return role === "ADMIN";
}

export function canAccessDoctor(role: Role) {
  return role === "DOCTOR" || role === "ADMIN";
}

export function canAccessStaff(role: Role) {
  return role === "STAFF" || role === "ADMIN";
}

export function canManageAppointments(role: Role) {
  return role === "ADMIN" || role === "STAFF" || role === "DOCTOR";
}

export function canViewPatientData(role: Role) {
  return role === "ADMIN" || role === "STAFF" || role === "DOCTOR";
}

export function getDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "DOCTOR":
      return "/doctor";
    case "STAFF":
      return "/staff";
    case "PATIENT":
      return "/patient";
    default:
      return "/dashboard";
  }
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "DOCTOR":
      return "Doctor";
    case "STAFF":
      return "Staff";
    case "PATIENT":
      return "Patient";
  }
}
