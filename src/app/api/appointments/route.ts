// src/app/api/appointments/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/utils/response";
import { createAppointmentSchema } from "@/lib/validations/appointment";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10");
  const status = searchParams.get("status");
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const date = searchParams.get("date");

  const skip = (page - 1) * pageSize;

  // Build where clause based on role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (status) where.status = status;
  if (date) where.date = new Date(date);

  // Role-based data scoping
  if (session.user.role === "DOCTOR") {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!doctorProfile) return errorResponse("Doctor profile not found", 404);
    where.doctorId = doctorProfile.id;
  } else if (session.user.role === "PATIENT") {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!patientProfile) return errorResponse("Patient profile not found", 404);
    where.patientId = patientProfile.id;
  } else {
    // Admin/Staff: allow filtering
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
      include: {
        patient: { include: { user: { select: { name: true, email: true, image: true } } } },
        doctor: {
          include: {
            user: { select: { name: true, email: true, image: true } },
            specialty: true,
          },
        },
        specialty: true,
        consultationNote: true,
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return successResponse({
    data: appointments,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  if (!["ADMIN", "STAFF", "PATIENT"].includes(session.user.role)) {
    return forbiddenResponse();
  }

  const body = await req.json();
  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0].message);
  }

  const { patientId, doctorId, date, startTime } = parsed.data;

  // Check double booking
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: new Date(date),
      startTime,
      status: { notIn: ["CANCELLED"] },
    },
  });

  if (conflict) {
    return errorResponse("This time slot is already booked.");
  }

  const appointment = await prisma.appointment.create({
    data: {
      ...parsed.data,
      date: new Date(date),
      status: "PENDING",
      createdById: session.user.id,
    },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true, specialty: true } },
      specialty: true,
    },
  });

  return successResponse(appointment, 201);
}
