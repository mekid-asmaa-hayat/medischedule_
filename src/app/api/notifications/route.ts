// src/app/api/notifications/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse } from "@/lib/utils/response";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return successResponse({ notifications, unreadCount });
}
