// src/app/(dashboard)/staff/appointments/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { AppointmentWithRelations } from "@/types";
import type { AppointmentStatus } from "@/lib/prisma-enums";
import { StaffBookDialog } from "./StaffBookDialog";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function StaffAppointmentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/dashboard");

  const { status, search } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status as AppointmentStatus;
  if (search) {
    where.OR = [
      { patient: { user: { name: { contains: search, mode: "insensitive" } } } },
      { doctor: { user: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [appointments, doctors, patients, specialties] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
      take: 50,
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, specialty: true } },
        specialty: true,
        consultationNote: true,
      },
    }),
    prisma.doctorProfile.findMany({
      include: { user: { select: { name: true } }, specialty: true, availability: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.patientProfile.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={`${appointments.length} appointment${appointments.length !== 1 ? "s" : ""}`}
        action={
          <StaffBookDialog doctors={doctors} patients={patients} specialties={specialties} />
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ label, value }) => (
          <a
            key={value}
            href={`/staff/appointments?status=${value}`}
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
            userRole="STAFF"
          />
        </CardContent>
      </Card>
    </div>
  );
}
