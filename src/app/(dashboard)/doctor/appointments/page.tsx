// src/app/(dashboard)/doctor/appointments/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { Card, CardContent } from "@/components/ui/card";
import type { AppointmentWithRelations } from "@/types";
import type { AppointmentStatus } from "@/lib/prisma-enums";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function DoctorAppointmentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOCTOR") redirect("/dashboard");

  const { status } = await searchParams;

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) redirect("/dashboard");

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctorProfile.id,
      ...(status && { status: status as AppointmentStatus }),
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true, specialty: true } },
      specialty: true,
      consultationNote: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My Appointments" description={`${appointments.length} appointment${appointments.length !== 1 ? "s" : ""}`} />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ label, value }) => (
          <a
            key={value}
            href={`/doctor/appointments?status=${value}`}
            className={`px-3 py-1 rounded-full text-xs border font-medium transition-colors ${
              (status ?? "") === value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <AppointmentTable
            appointments={appointments as AppointmentWithRelations[]}
            userRole="DOCTOR"
          />
        </CardContent>
      </Card>
    </div>
  );
}
