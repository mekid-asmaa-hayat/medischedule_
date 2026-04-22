// src/actions/patients.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPatientSchema, updatePatientSchema } from "@/lib/validations/patient";
import bcrypt from "bcryptjs";
import type { ActionResult } from "@/types";

export async function createPatientAction(data: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return { success: false, error: "Forbidden" };
  }

  const parsed = createPatientSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, phone, dateOfBirth, ...profileData } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "Email already in use" };

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role: "PATIENT",
      patientProfile: {
        create: {
          ...profileData,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      },
    },
    include: { patientProfile: true },
  });

  revalidatePath("/admin/patients");
  revalidatePath("/staff/patients");

  return { success: true, data: user };
}

export async function updatePatientAction(
  patientProfileId: string,
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = updatePatientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Validation failed" };
  }

  const { name, phone, dateOfBirth, ...profileData } = parsed.data;

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { id: patientProfileId },
    include: { user: true },
  });

  if (!patientProfile) return { success: false, error: "Patient not found" };

  // Patients can only update their own profile
  if (
    session.user.role === "PATIENT" &&
    patientProfile.userId !== session.user.id
  ) {
    return { success: false, error: "Forbidden" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: patientProfile.userId },
      data: { ...(name && { name }), ...(phone && { phone }) },
    }),
    prisma.patientProfile.update({
      where: { id: patientProfileId },
      data: {
        ...profileData,
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      },
    }),
  ]);

  revalidatePath("/admin/patients");
  revalidatePath("/patient");

  return { success: true };
}
