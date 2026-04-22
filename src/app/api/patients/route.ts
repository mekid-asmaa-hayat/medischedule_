// src/app/api/patients/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  if (!["ADMIN", "STAFF", "DOCTOR"].includes(session.user.role)) {
    return forbiddenResponse();
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const search = searchParams.get("search");
  const skip = (page - 1) * pageSize;

  const where = search
    ? { user: { name: { contains: search, mode: "insensitive" as const } } }
    : {};

  const [patients, total] = await Promise.all([
    prisma.patientProfile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { user: { name: "asc" } },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, phone: true },
        },
        _count: { select: { appointments: true } },
      },
    }),
    prisma.patientProfile.count({ where }),
  ]);

  return successResponse({
    data: patients,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
