// src/app/(dashboard)/patient/appointments/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { PatientAppointmentActions } from "./PatientAppointmentActions";
import type { AppointmentWithRelations } from "@/types";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_FILTERS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function PatientAppointmentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PATIENT") redirect("/dashboard");

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!patientProfile) redirect("/dashboard");

  const { status } = await searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { patientId: patientProfile.id };
  if (status === "upcoming") {
    where.date = { gte: today };
    where.status = { in: ["PENDING", "CONFIRMED"] };
  } else if (status) {
    where.status = status;
  }

  const appointments = await prisma.appointment.findMany({
    where,
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
      <PageHeader
        title="My Appointments"
        description={`${appointments.length} appointment${appointments.length !== 1 ? "s" : ""}`}
        action={
          <Button size="sm" asChild>
            <Link href="/patient/book"><Calendar className="mr-2 h-4 w-4" />Book New</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ label, value }) => (
          <a
            key={value}
            href={`/patient/appointments?status=${value}`}
            className={`px-3 py-1 rounded-full text-xs border font-medium transition-colors ${
              (status ?? "") === value || (!status && value === "upcoming")
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments"
          description="You have no appointments matching this filter."
          action={<Button size="sm" asChild><Link href="/patient/book">Book Now</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(appointments as AppointmentWithRelations[]).map((appt) => (
            <PatientAppointmentActions
              key={appt.id}
              appointment={appt as AppointmentWithRelations}
            />
          ))}
        </div>
      )}
    </div>
  );
}
