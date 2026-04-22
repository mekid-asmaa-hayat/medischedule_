// src/components/layout/DashboardHeader.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRoleLabel } from "@/lib/utils/permissions";
import { Badge } from "@/components/ui/badge";

export async function DashboardHeader() {
  const session = await auth();
  if (!session?.user) return null;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ]);

  const initials = (session.user.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="md:hidden font-semibold text-primary text-sm">MediSchedule</div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
        <div className="hidden sm:flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium leading-tight">{session.user.name}</p>
            <Badge variant="outline" className="text-xs py-0 h-4 mt-0.5">
              {getRoleLabel(session.user.role)}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
