// src/app/api/specialties/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/utils/response";

export async function GET(_req: NextRequest) {
  const specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { doctors: true } },
    },
  });

  return successResponse(specialties);
}
