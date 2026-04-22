// src/app/(dashboard)/doctor/availability/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { AvailabilityManager } from "./AvailabilityManager";

export default async function DoctorAvailabilityPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOCTOR") redirect("/dashboard");

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      availability: { orderBy: { dayOfWeek: "asc" } },
      timeOff: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: "asc" } },
    },
  });
  if (!doctorProfile) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Availability"
        description="Set your weekly schedule and time-off periods."
      />
      <AvailabilityManager
        availability={doctorProfile.availability}
        timeOffs={doctorProfile.timeOff}
      />
    </div>
  );
}
