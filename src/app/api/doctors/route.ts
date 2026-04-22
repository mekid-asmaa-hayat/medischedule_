// src/app/api/doctors/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
} from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "12");
  const specialtyId = searchParams.get("specialtyId");
  const search = searchParams.get("search");
  const accepting = searchParams.get("accepting");

  const skip = (page - 1) * pageSize;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (specialtyId) where.specialtyId = specialtyId;
  if (accepting === "true") where.isAcceptingPatients = true;
  if (search) {
    where.user = {
      name: { contains: search, mode: "insensitive" },
    };
  }

  const [doctorProfiles, total] = await Promise.all([
    prisma.doctorProfile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { user: { name: "asc" } },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, phone: true },
        },
        specialty: true,
        availability: true,
        _count: { select: { appointments: true } },
      },
    }),
    prisma.doctorProfile.count({ where }),
  ]);

  return successResponse({
    data: doctorProfiles,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST handled via Server Action, but provide API route for external clients
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return unauthorizedResponse();

  // Delegate to the same logic as server action
  const body = await req.json();
  const { createDoctorAction } = await import("@/actions/doctors");
  const result = await createDoctorAction(body);

  return successResponse(result, result.success ? 201 : 400);
}
