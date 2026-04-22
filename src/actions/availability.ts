// src/actions/availability.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { ActionResult } from "@/types";
import type { DayOfWeek } from "@/lib/prisma-enums";

const availabilitySchema = z.object({
  dayOfWeek: z.enum([
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().int().min(15).max(120).default(30),
  isActive: z.boolean().default(true),
});

const timeOffSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().optional(),
});

export async function upsertAvailabilityAction(
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOCTOR") {
    return { success: false, error: "Only doctors can manage availability" };
  }

  const parsed = availabilitySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Validation failed" };
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return { success: false, error: "Doctor profile not found" };

  const availability = await prisma.availability.upsert({
    where: {
      doctorId_dayOfWeek: {
        doctorId: doctorProfile.id,
        dayOfWeek: parsed.data.dayOfWeek as DayOfWeek,
      },
    },
    update: parsed.data,
    create: {
      doctorId: doctorProfile.id,
      ...parsed.data,
    },
  });

  revalidatePath("/doctor/availability");

  return { success: true, data: availability };
}

export async function deleteAvailabilityAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOCTOR") {
    return { success: false, error: "Forbidden" };
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return { success: false, error: "Doctor profile not found" };

  await prisma.availability.delete({
    where: { id, doctorId: doctorProfile.id },
  });

  revalidatePath("/doctor/availability");
  return { success: true };
}

export async function createTimeOffAction(data: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !["DOCTOR", "ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Forbidden" };
  }

  const parsed = timeOffSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Validation failed" };

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return { success: false, error: "Doctor profile not found" };

  const timeOff = await prisma.timeOff.create({
    data: {
      doctorId: doctorProfile.id,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      reason: parsed.data.reason,
    },
  });

  revalidatePath("/doctor/availability");
  return { success: true, data: timeOff };
}

export async function deleteTimeOffAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  await prisma.timeOff.delete({ where: { id } });
  revalidatePath("/doctor/availability");
  return { success: true };
}
