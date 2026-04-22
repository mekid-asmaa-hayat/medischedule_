// src/components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, UserCheck, Stethoscope,
  Clock, FileText, Settings, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";
import { useState } from "react";
import type { Role } from "@/lib/prisma-enums";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/doctors", label: "Doctors", icon: UserCheck },
    { href: "/admin/patients", label: "Patients", icon: Users },
    { href: "/admin/specialties", label: "Specialties", icon: Stethoscope },
  ],
  DOCTOR: [
    { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctor/availability", label: "Availability", icon: Clock },
    { href: "/doctor/notes", label: "Notes", icon: FileText },
  ],
  STAFF: [
    { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
    { href: "/staff/appointments", label: "Appointments", icon: Calendar },
    { href: "/staff/patients", label: "Patients", icon: Users },
  ],
  PATIENT: [
    { href: "/patient", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/appointments", label: "My Appointments", icon: Calendar },
    { href: "/patient/book", label: "Book Appointment", icon: Stethoscope },
  ],
};

interface SidebarProps {
  role: Role;
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV_BY_ROLE[role] ?? [];

  const initials = (user.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-white transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2 px-4 py-5 font-bold text-primary", collapsed && "justify-center")}>
        <Stethoscope className="h-6 w-6 flex-shrink-0" />
        {!collapsed && <span className="text-lg">MediSchedule</span>}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && href !== "/doctor" && href !== "/staff" && href !== "/patient" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        <div className="pt-2">
          <Separator className="mb-2" />
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>

      <Separator />

      {/* User info + logout */}
      <div className={cn("p-3", collapsed && "flex justify-center")}>
        {collapsed ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>

      {/* Collapse toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full shadow-sm bg-white"
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
  );
}
