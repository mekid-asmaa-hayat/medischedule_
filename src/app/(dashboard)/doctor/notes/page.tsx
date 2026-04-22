// src/app/(dashboard)/doctor/notes/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/date";
import { NoteEditor } from "./NoteEditor";

export default async function DoctorNotesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOCTOR") redirect("/dashboard");

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) redirect("/dashboard");

  // Fetch completed appointments with or without notes
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctorProfile.id,
      status: { in: ["COMPLETED", "CONFIRMED"] },
    },
    orderBy: [{ date: "desc" }],
    include: {
      patient: { include: { user: true } },
      specialty: true,
      consultationNote: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation Notes"
        description="Manage SOAP notes for your appointments."
      />

      {appointments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No appointments to document"
          description="Completed appointments will appear here for documentation."
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((appt: typeof appointments[0]) => (
            <Card key={appt.id} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{appt.patient.user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(appt.date)} · {formatTime(appt.startTime)} · {appt.specialty.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={appt.consultationNote ? "success" : "outline"}>
                      {appt.consultationNote ? "Note saved" : "No note"}
                    </Badge>
                    <Badge variant="secondary">{appt.status}</Badge>
                  </div>
                </div>
                <p className="text-sm mt-1 text-muted-foreground italic">&ldquo;{appt.reason}&rdquo;</p>
              </CardHeader>
              <CardContent className="pt-4">
                <NoteEditor appointmentId={appt.id} existingNote={appt.consultationNote} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
