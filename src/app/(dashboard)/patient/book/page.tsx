// src/app/(dashboard)/patient/book/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";

export default async function PatientBookPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PATIENT") redirect("/dashboard");

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });
  if (!patientProfile) redirect("/dashboard");

  const [doctors, specialties] = await Promise.all([
    prisma.doctorProfile.findMany({
      where: { isAcceptingPatients: true },
      include: {
        user: { select: { name: true } },
        specialty: true,
        availability: { where: { isActive: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Book an Appointment"
        description="Schedule a visit with one of our doctors."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            doctors={doctors}
            patients={[{ id: patientProfile.id, user: { name: patientProfile.user.name } }]}
            specialties={specialties}
            defaultPatientId={patientProfile.id}
            onSuccess={() => { window.location.href = "/patient/appointments"; }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
