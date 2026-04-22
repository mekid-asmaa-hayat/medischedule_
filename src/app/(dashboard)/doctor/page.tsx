// src/app/(dashboard)/doctor/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppointmentWithRelations } from "@/types";

export default async function DoctorDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOCTOR") redirect("/dashboard");

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: { specialty: true },
  });
  if (!doctorProfile) redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppts, upcomingAppts, completedCount, uniquePatients, nextAppts] =
    await Promise.all([
      prisma.appointment.count({
        where: { doctorId: doctorProfile.id, date: { gte: today, lt: tomorrow } },
      }),
      prisma.appointment.count({
        where: { doctorId: doctorProfile.id, date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.appointment.count({
        where: { doctorId: doctorProfile.id, status: "COMPLETED" },
      }),
      prisma.appointment.findMany({
        where: { doctorId: doctorProfile.id },
        select: { patientId: true },
        distinct: ["patientId"],
      }),
      prisma.appointment.findMany({
        where: {
          doctorId: doctorProfile.id,
          date: { gte: today },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        take: 4,
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
        title={`Good ${getGreeting()}, ${session.user.name?.split(" ")[0]}!`}
        description={`${doctorProfile.specialty.name} · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Today's Appointments" value={todayAppts} icon={Calendar} />
        <StatsCard title="Upcoming" value={upcomingAppts} icon={Clock} />
        <StatsCard title="Total Patients" value={uniquePatients.length} icon={Users} />
        <StatsCard title="Completed" value={completedCount} icon={CheckCircle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {nextAppts.length === 0 ? (
            <EmptyState icon={Calendar} title="No upcoming appointments" description="Your schedule is clear for now." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {nextAppts.map((appt: Parameters<typeof AppointmentCard>[0]["appointment"]) => (
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
