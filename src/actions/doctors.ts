// src/actions/doctors.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDoctorSchema, updateDoctorSchema } from "@/lib/validations/doctor";
import bcrypt from "bcryptjs";
import type { ActionResult } from "@/types";

export async function createDoctorAction(data: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Only admins can create doctors" };
  }

  const parsed = createDoctorSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, phone, specialtyId, licenseNumber, bio, experience, consultationFee, isAcceptingPatients } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "Email already in use" };

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialtyId,
          licenseNumber,
          bio,
          experience,
          consultationFee,
          isAcceptingPatients,
        },
      },
    },
    include: { doctorProfile: true },
  });

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");

  return { success: true, data: user };
}

export async function updateDoctorAction(
  doctorProfileId: string,
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = updateDoctorSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Validation failed" };
  }

  const { name, phone, specialtyId, bio, experience, consultationFee, isAcceptingPatients } = parsed.data;

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { id: doctorProfileId },
    include: { user: true },
  });

  if (!doctorProfile) return { success: false, error: "Doctor not found" };

  // Doctors can only update their own profile; admins can update any
  if (
    session.user.role === "DOCTOR" &&
    doctorProfile.userId !== session.user.id
  ) {
    return { success: false, error: "Forbidden" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: doctorProfile.userId },
      data: { name, phone },
    }),
    prisma.doctorProfile.update({
      where: { id: doctorProfileId },
      data: { specialtyId, bio, experience, consultationFee, isAcceptingPatients },
    }),
  ]);

  revalidatePath("/admin/doctors");
  revalidatePath("/doctor");
  revalidatePath("/doctors");

  return { success: true };
}

export async function deleteDoctorAction(userId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Only admins can delete doctors" };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");

  return { success: true };
}
