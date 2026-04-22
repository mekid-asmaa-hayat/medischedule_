// src/app/(dashboard)/admin/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import {
  Users, UserCheck, Calendar, CalendarCheck, CalendarClock, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppointmentWithRelations } from "@/types";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    recentAppointments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, specialty: true } },
        specialty: true,
        consultationNote: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome back! Here's what's happening today, ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.`}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard title="Total Patients" value={totalPatients} icon={Users} className="xl:col-span-1" />
        <StatsCard title="Total Doctors" value={totalDoctors} icon={UserCheck} className="xl:col-span-1" />
        <StatsCard title="All Appointments" value={totalAppointments} icon={Calendar} className="xl:col-span-1" />
        <StatsCard title="Today" value={todayAppointments} icon={CalendarCheck} className="xl:col-span-1" />
        <StatsCard title="Pending" value={pendingAppointments} icon={CalendarClock} className="xl:col-span-1" />
        <StatsCard title="Completed" value={completedAppointments} icon={Activity} className="xl:col-span-1" />
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AppointmentTable
            appointments={recentAppointments as AppointmentWithRelations[]}
            userRole="ADMIN"
          />
        </CardContent>
      </Card>
    </div>
  );
}
