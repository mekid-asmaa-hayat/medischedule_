// src/app/(dashboard)/admin/appointments/page.tsx
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Card, CardContent } from "@/components/ui/card";
import type { AppointmentWithRelations } from "@/types";
import type { AppointmentStatus } from "@/lib/prisma-enums";

const PAGE_SIZE = 15;

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

export default async function AdminAppointmentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const { page: pageStr, status, search } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status as AppointmentStatus;
  if (search) {
    where.OR = [
      { patient: { user: { name: { contains: search, mode: "insensitive" } } } },
      { doctor: { user: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, specialty: true } },
        specialty: true,
        consultationNote: true,
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const STATUS_FILTERS: { label: string; value: string }[] = [
    { label: "All", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "No Show", value: "NO_SHOW" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={`${total} appointment${total !== 1 ? "s" : ""} total`}
      />

      <Card>
        <CardContent className="pt-4 pb-2">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SearchFilter placeholder="Search patient or doctor…" />
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map(({ label, value }) => (
                <a
                  key={value}
                  href={`/admin/appointments?status=${value}&page=1`}
                  className={`px-3 py-1 rounded-full text-xs border font-medium transition-colors ${
                    (status ?? "") === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <AppointmentTable
            appointments={appointments as AppointmentWithRelations[]}
            userRole="ADMIN"
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={() => {}} // handled via URL params
          />
        </CardContent>
      </Card>
    </div>
  );
}
