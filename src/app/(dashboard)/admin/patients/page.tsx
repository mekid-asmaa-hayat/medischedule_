// src/app/(dashboard)/admin/patients/page.tsx
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminPatientsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const { search } = await searchParams;

  const patients = await prisma.patientProfile.findMany({
    where: search
      ? { user: { name: { contains: search, mode: "insensitive" } } }
      : undefined,
    include: {
      user: { select: { id: true, name: true, email: true, image: true, phone: true, createdAt: true } },
      _count: { select: { appointments: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description={`${patients.length} patient${patients.length !== 1 ? "s" : ""} registered`}
      />

      <div className="flex flex-wrap gap-3">
        <SearchFilter placeholder="Search patients…" />
      </div>

      {patients.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" description="No patients match your search." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Patient</th>
                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                    <th className="px-4 py-3 text-left font-medium">DOB</th>
                    <th className="px-4 py-3 text-left font-medium">Blood Type</th>
                    <th className="px-4 py-3 text-left font-medium">Appointments</th>
                    <th className="px-4 py-3 text-left font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {patients.map((patient: {id:string;dateOfBirth:Date|null;bloodType:string|null;user:{id:string;name:string;email:string;image:string|null;phone:string|null;createdAt:Date};_count:{appointments:number}}) => {
                    const initials = patient.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={patient.user.image ?? undefined} />
                              <AvatarFallback className="bg-green-100 text-green-700 text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.user.name}</p>
                              <p className="text-xs text-muted-foreground">{patient.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{patient.user.phone ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {patient.bloodType ? (
                            <Badge variant="outline">{patient.bloodType}</Badge>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{patient._count.appointments}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(patient.user.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
