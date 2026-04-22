// src/app/(dashboard)/admin/doctors/page.tsx
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Plus, Star } from "lucide-react";
import { AdminDoctorActions } from "./DoctorActions";

interface PageProps {
  searchParams: Promise<{ search?: string; specialtyId?: string }>;
}

export default async function AdminDoctorsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const { search, specialtyId } = await searchParams;

  const [doctors, specialties] = await Promise.all([
    prisma.doctorProfile.findMany({
      where: {
        ...(specialtyId && { specialtyId }),
        ...(search && { user: { name: { contains: search, mode: "insensitive" } } }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, phone: true } },
        specialty: true,
        _count: { select: { appointments: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description={`${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} registered`}
        action={
          <Button size="sm" asChild>
            <a href="/admin/doctors/new"><Plus className="mr-2 h-4 w-4" />Add Doctor</a>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchFilter placeholder="Search doctors…" />
        <div className="flex flex-wrap gap-2">
          <a href="/admin/doctors" className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${!specialtyId ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>
            All
          </a>
          {specialties.map((s: {id:string;name:string}) => (
            <a key={s.id} href={`/admin/doctors?specialtyId=${s.id}`} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${specialtyId === s.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>
              {s.name}
            </a>
          ))}
        </div>
      </div>

      {doctors.length === 0 ? (
        <EmptyState icon={UserCheck} title="No doctors found" description="Add your first doctor to get started." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Doctor</th>
                    <th className="px-4 py-3 text-left font-medium">Specialty</th>
                    <th className="px-4 py-3 text-left font-medium">License</th>
                    <th className="px-4 py-3 text-left font-medium">Rating</th>
                    <th className="px-4 py-3 text-left font-medium">Appointments</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {doctors.map((doctor: {id:string;licenseNumber:string;isAcceptingPatients:boolean;rating:number|null;user:{id:string;name:string;email:string;image:string|null;phone:string|null};specialty:{name:string};_count:{appointments:number}}) => {
                    const initials = doctor.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <tr key={doctor.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={doctor.user.image ?? undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{doctor.user.name}</p>
                              <p className="text-xs text-muted-foreground">{doctor.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{doctor.specialty.name}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{doctor.licenseNumber}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{doctor.rating?.toFixed(1) ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{doctor._count.appointments}</td>
                        <td className="px-4 py-3">
                          <Badge variant={doctor.isAcceptingPatients ? "success" : "secondary"}>
                            {doctor.isAcceptingPatients ? "Accepting" : "Closed"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AdminDoctorActions doctorId={doctor.id} userId={doctor.user.id} />
                        </td>
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
