// src/app/(dashboard)/admin/specialties/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { SpecialtyActions } from "./SpecialtyActions";
import { CreateSpecialtyDialog } from "./CreateSpecialtyDialog";

export default async function AdminSpecialtiesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { doctors: true, appointments: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Specialties"
        description={`${specialties.length} medical specialties`}
        action={<CreateSpecialtyDialog />}
      />

      {specialties.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No specialties yet" description="Add your first medical specialty." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Description</th>
                    <th className="px-4 py-3 text-left font-medium">Doctors</th>
                    <th className="px-4 py-3 text-left font-medium">Appointments</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {specialties.map((s: {id:string;name:string;description:string|null;_count:{doctors:number;appointments:number}}) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-sm truncate">
                        {s.description ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{s._count.doctors} doctor{s._count.doctors !== 1 ? "s" : ""}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s._count.appointments}</td>
                      <td className="px-4 py-3 text-right">
                        <SpecialtyActions specialtyId={s.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
