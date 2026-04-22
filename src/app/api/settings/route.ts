// src/app/api/settings/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/utils/response";
import { z } from "zod";

const updateSettingsSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  // Patient fields
  address: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  // Doctor fields
  bio: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const body = await req.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Validation failed");

  const { name, phone, address, allergies, emergencyContact, bio } = parsed.data;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // Update user base fields
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          ...(name && { name }),
          ...(phone !== undefined && { phone: phone || null }),
        },
      });

      // Update patient profile if applicable
      if (session.user.role === "PATIENT") {
        await tx.patientProfile.updateMany({
          where: { userId: session.user.id },
          data: {
            ...(address !== undefined && { address: address || null }),
            ...(allergies !== undefined && { allergies: allergies || null }),
            ...(emergencyContact !== undefined && { emergencyContact: emergencyContact || null }),
          },
        });
      }

      // Update doctor profile if applicable
      if (session.user.role === "DOCTOR") {
        await tx.doctorProfile.updateMany({
          where: { userId: session.user.id },
          data: {
            ...(bio !== undefined && { bio: bio || null }),
          },
        });
      }
    });

    return successResponse({ updated: true });
  } catch (err) {
    console.error("Settings update error:", err);
    return errorResponse("Failed to update settings", 500);
  }
}
