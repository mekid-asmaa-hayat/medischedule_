// src/actions/appointments.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  consultationNoteSchema,
} from "@/lib/validations/appointment";
import type { ActionResult } from "@/types";
import type { AppointmentStatus } from "@/lib/prisma-enums";

export async function createAppointmentAction(
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = createAppointmentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { patientId, doctorId, specialtyId, date, startTime, endTime, reason, notes } =
    parsed.data;

  // Check for double booking
  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: new Date(date),
      startTime,
      status: { notIn: ["CANCELLED"] },
    },
  });

  if (existing) {
    return {
      success: false,
      error: "This time slot is already booked. Please choose another time.",
    };
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      specialtyId,
      date: new Date(date),
      startTime,
      endTime,
      reason,
      notes,
      status: "PENDING",
      createdById: session.user.id,
    },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
    },
  });

  // Notify the doctor
  await prisma.notification.create({
    data: {
      userId: appointment.doctor.userId,
      title: "New Appointment Booked",
      message: `${appointment.patient.user.name} booked an appointment on ${date} at ${startTime}.`,
      type: "info",
      link: "/doctor/appointments",
    },
  });

  // Notify the patient
  await prisma.notification.create({
    data: {
      userId: appointment.patient.userId,
      title: "Appointment Requested",
      message: `Your appointment with ${appointment.doctor.user.name} on ${date} at ${startTime} is pending confirmation.`,
      type: "info",
      link: "/patient/appointments",
    },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/doctor/appointments");
  revalidatePath("/patient/appointments");
  revalidatePath("/staff/appointments");

  return { success: true, data: appointment };
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const role = session.user.role;
  if (!["ADMIN", "DOCTOR", "STAFF"].includes(role)) {
    return { success: false, error: "Forbidden" };
  }

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
    },
  });

  // Notify the patient of status change
  const statusMessages: Record<string, string> = {
    CONFIRMED: "has been confirmed",
    CANCELLED: "has been cancelled",
    COMPLETED: "has been marked as completed",
    NO_SHOW: "was marked as no-show",
  };

  if (statusMessages[status]) {
    await prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        title: `Appointment ${status.charAt(0) + status.slice(1).toLowerCase()}`,
        message: `Your appointment with ${appointment.doctor.user.name} ${statusMessages[status]}.`,
        type: status === "CONFIRMED" ? "success" : status === "CANCELLED" ? "error" : "info",
        link: "/patient/appointments",
      },
    });
  }

  revalidatePath("/admin/appointments");
  revalidatePath("/doctor/appointments");
  revalidatePath("/patient/appointments");
  revalidatePath("/staff/appointments");

  return { success: true, data: appointment };
}

export async function cancelAppointmentAction(
  appointmentId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: { include: { user: true } } },
  });

  if (!appointment) return { success: false, error: "Appointment not found" };

  // Patients can only cancel their own appointments
  if (
    session.user.role === "PATIENT" &&
    appointment.patient.userId !== session.user.id
  ) {
    return { success: false, error: "Forbidden" };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/doctor/appointments");
  revalidatePath("/patient/appointments");
  revalidatePath("/staff/appointments");

  return { success: true };
}

export async function saveConsultationNoteAction(
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOCTOR") {
    return { success: false, error: "Only doctors can save consultation notes" };
  }

  const parsed = consultationNoteSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Validation failed" };
  }

  const { appointmentId, followUpDate, ...rest } = parsed.data;

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return { success: false, error: "Doctor profile not found" };

  const note = await prisma.consultationNote.upsert({
    where: { appointmentId },
    update: {
      ...rest,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    },
    create: {
      appointmentId,
      doctorId: doctorProfile.id,
      ...rest,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    },
  });

  revalidatePath("/doctor/notes");

  return { success: true, data: note };
}
