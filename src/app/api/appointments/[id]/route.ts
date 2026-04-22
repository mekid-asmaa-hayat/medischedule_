// src/app/api/appointments/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/utils/response";
import { updateAppointmentSchema } from "@/lib/validations/appointment";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true, specialty: true } },
      specialty: true,
      consultationNote: true,
    },
  });

  if (!appointment) return notFoundResponse("Appointment");

  // Access control
  const { role, id: userId } = session.user;
  if (role === "PATIENT") {
    const profile = await prisma.patientProfile.findUnique({ where: { userId } });
    if (appointment.patientId !== profile?.id) return forbiddenResponse();
  } else if (role === "DOCTOR") {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (appointment.doctorId !== profile?.id) return forbiddenResponse();
  }

  return successResponse(appointment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  if (!["ADMIN", "DOCTOR", "STAFF"].includes(session.user.role)) {
    return forbiddenResponse();
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateAppointmentSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  const appointment = await prisma.appointment.update({
    where: { id },
    data: parsed.data,
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true, specialty: true } },
      specialty: true,
    },
  });

  return successResponse(appointment);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  if (!["ADMIN"].includes(session.user.role)) return forbiddenResponse();

  const { id } = await params;

  await prisma.appointment.delete({ where: { id } });
  return successResponse({ deleted: true });
}
