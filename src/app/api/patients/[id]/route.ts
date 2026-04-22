// src/app/api/patients/[id]/route.ts
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
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { id } = await params;

  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, phone: true } },
      appointments: {
        take: 10,
        orderBy: { date: "desc" },
        include: {
          doctor: { include: { user: { select: { name: true } }, specialty: true } },
          specialty: true,
        },
      },
    },
  });

  if (!patient) return notFoundResponse("Patient");

  // Patients can only view their own profile
  if (session.user.role === "PATIENT" && patient.userId !== session.user.id) {
    return forbiddenResponse();
  }

  return successResponse(patient);
}
