// src/components/notifications/NotificationBell.tsx
"use client";
import { useState, useTransition } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "@/actions/notifications";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import type { Notification } from "@/lib/prisma-types";

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
}

export function NotificationBell({ notifications: initial, unreadCount: initialCount }: NotificationBellProps) {
  const [items, setItems] = useState(initial);
  const [unread, setUnread] = useState(initialCount);
  const [, startTransition] = useTransition();

  const markRead = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id);
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    });
  };

  const markAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await deleteNotificationAction(id);
      const removed = items.find((n) => n.id === id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      if (removed && !removed.isRead) setUnread((prev) => Math.max(0, prev - 1));
    });
  };

  const typeColor: Record<string, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={markAllRead}>
              <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  !n.isRead && "bg-primary/5"
                )}
                onSelect={(e) => e.preventDefault()}
              >
                <div className={cn("mt-1.5 h-2 w-2 rounded-full flex-shrink-0", typeColor[n.type] ?? "bg-gray-400")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markRead(n.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => remove(n.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
