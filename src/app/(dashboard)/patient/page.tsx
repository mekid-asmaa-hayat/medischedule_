// src/app/(dashboard)/patient/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import type { AppointmentWithRelations } from "@/types";

export default async function PatientDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PATIENT") redirect("/dashboard");

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!patientProfile) redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcomingCount, completedCount, cancelledCount, nextAppts] = await Promise.all([
    prisma.appointment.count({
      where: { patientId: patientProfile.id, date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
    }),
    prisma.appointment.count({
      where: { patientId: patientProfile.id, status: "COMPLETED" },
    }),
    prisma.appointment.count({
      where: { patientId: patientProfile.id, status: "CANCELLED" },
    }),
    prisma.appointment.findMany({
      where: { patientId: patientProfile.id, date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
      take: 3,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
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
        title={`Hello, ${session.user.name?.split(" ")[0]}!`}
        description="Here's your health summary."
        action={
          <Button size="sm" asChild>
            <Link href="/patient/book"><Calendar className="mr-2 h-4 w-4" />Book Appointment</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard title="Upcoming" value={upcomingCount} icon={Clock} />
        <StatsCard title="Completed" value={completedCount} icon={CheckCircle} />
        <StatsCard title="Cancelled" value={cancelledCount} icon={XCircle} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Upcoming Appointments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/patient/appointments">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {nextAppts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming appointments"
              description="Book your first appointment to get started."
              action={
                <Button size="sm" asChild>
                  <Link href="/patient/book">Book Now</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(nextAppts as AppointmentWithRelations[]).map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt as AppointmentWithRelations}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
