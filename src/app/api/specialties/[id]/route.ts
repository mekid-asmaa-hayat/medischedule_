// src/app/api/specialties/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/utils/response";
import { updateSpecialtySchema } from "@/lib/validations/specialty";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const specialty = await prisma.specialty.findUnique({
    where: { id },
    include: {
      doctors: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      _count: { select: { doctors: true, appointments: true } },
    },
  });

  if (!specialty) return notFoundResponse("Specialty");
  return successResponse(specialty);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  if (session.user.role !== "ADMIN") return forbiddenResponse();

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSpecialtySchema.safeParse(body);
  if (!parsed.success) {
    return successResponse({ error: "Validation failed" });
  }

  const specialty = await prisma.specialty.update({ where: { id }, data: parsed.data });
  return successResponse(specialty);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  if (session.user.role !== "ADMIN") return forbiddenResponse();

  const { id } = await params;

  const doctorsCount = await prisma.doctorProfile.count({ where: { specialtyId: id } });
  if (doctorsCount > 0) {
    return successResponse({ error: "Cannot delete specialty with assigned doctors" });
  }

  await prisma.specialty.delete({ where: { id } });
  return successResponse({ deleted: true });
}
