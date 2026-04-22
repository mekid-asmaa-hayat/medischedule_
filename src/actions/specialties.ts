// src/actions/specialties.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSpecialtySchema, updateSpecialtySchema } from "@/lib/validations/specialty";
import type { ActionResult } from "@/types";

export async function createSpecialtyAction(data: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Only admins can manage specialties" };
  }

  const parsed = createSpecialtySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.specialty.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { success: false, error: "Specialty already exists" };

  const specialty = await prisma.specialty.create({ data: parsed.data });

  revalidatePath("/admin/specialties");
  revalidatePath("/specialties");

  return { success: true, data: specialty };
}

export async function updateSpecialtyAction(
  id: string,
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  const parsed = updateSpecialtySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Validation failed" };

  const specialty = await prisma.specialty.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/specialties");
  revalidatePath("/specialties");

  return { success: true, data: specialty };
}

export async function deleteSpecialtyAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  const doctors = await prisma.doctorProfile.count({ where: { specialtyId: id } });
  if (doctors > 0) {
    return { success: false, error: "Cannot delete specialty with assigned doctors" };
  }

  await prisma.specialty.delete({ where: { id } });

  revalidatePath("/admin/specialties");
  revalidatePath("/specialties");

  return { success: true };
}
