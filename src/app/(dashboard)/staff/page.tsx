// src/app/(dashboard)/staff/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { AppointmentWithRelations } from "@/types";

export default async function StaffDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalPatients, todayAppts, pendingAppts, completedAppts, todayAppointments] =
    await Promise.all([
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        orderBy: [{ startTime: "asc" }],
        take: 10,
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
        title="Staff Dashboard"
        description={`Welcome, ${session.user.name?.split(" ")[0]}! Here's today's overview.`}
        action={
          <Button size="sm" asChild>
            <Link href="/staff/appointments">
              <Calendar className="mr-2 h-4 w-4" />Manage Appointments
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Patients" value={totalPatients} icon={Users} />
        <StatsCard title="Today's Appointments" value={todayAppts} icon={Calendar} />
        <StatsCard title="Pending Approval" value={pendingAppts} icon={Clock} />
        <StatsCard title="Completed" value={completedAppts} icon={CheckCircle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AppointmentTable
            appointments={todayAppointments as AppointmentWithRelations[]}
            userRole="STAFF"
          />
        </CardContent>
      </Card>
    </div>
  );
}
