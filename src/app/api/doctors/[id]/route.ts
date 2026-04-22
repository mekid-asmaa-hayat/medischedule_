// src/app/api/doctors/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/utils/response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const doctor = await prisma.doctorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, phone: true } },
      specialty: true,
      availability: { where: { isActive: true } },
      timeOff: { where: { endDate: { gte: new Date() } } },
      _count: { select: { appointments: true } },
    },
  });

  if (!doctor) return notFoundResponse("Doctor");
  return successResponse(doctor);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { id } = await params;
  const body = await req.json();

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { id },
  });
  if (!doctorProfile) return notFoundResponse("Doctor");

  if (
    session.user.role !== "ADMIN" &&
    doctorProfile.userId !== session.user.id
  ) {
    return forbiddenResponse();
  }

  const { updateDoctorAction } = await import("@/actions/doctors");
  const result = await updateDoctorAction(id, body);

  return successResponse(result);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return unauthorizedResponse();

  const { id } = await params;

  // id here is the user id
  await prisma.user.delete({ where: { id } });
  return successResponse({ deleted: true });
}
