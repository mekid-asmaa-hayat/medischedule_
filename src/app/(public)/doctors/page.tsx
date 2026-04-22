// src/app/(public)/doctors/page.tsx
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { UserCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Our Doctors" };

interface PageProps {
  searchParams: Promise<{ search?: string; specialtyId?: string }>;
}

async function DoctorsList({ search, specialtyId }: { search?: string; specialtyId?: string }) {
  const doctors = await prisma.doctorProfile.findMany({
    where: {
      isAcceptingPatients: true,
      ...(specialtyId && { specialtyId }),
      ...(search && { user: { name: { contains: search, mode: "insensitive" } } }),
    },
    include: {
      user: { select: { name: true, email: true, image: true } },
      specialty: true,
    },
    orderBy: { rating: "desc" },
  });

  if (doctors.length === 0) {
    return (
      <EmptyState
        icon={UserCheck}
        title="No doctors found"
        description={search ? `No results for "${search}". Try a different search.` : "No doctors available at this time."}
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {doctors.map((d: {id:string;bio:string|null;experience:number|null;consultationFee:unknown|null;rating:number|null;isAcceptingPatients:boolean;user:{name:string;email:string;image:string|null};specialty:{name:string}}) => (
        <DoctorCard
          key={d.id}
          doctor={{
            id: d.id,
            name: d.user.name,
            email: d.user.email,
            image: d.user.image,
            specialty: d.specialty.name,
            experience: d.experience,
            consultationFee: d.consultationFee ? Number(d.consultationFee) : null,
            rating: d.rating,
            isAcceptingPatients: d.isAcceptingPatients,
            bio: d.bio,
          }}
        />
      ))}
    </div>
  );
}

export default async function DoctorsPage({ searchParams }: PageProps) {
  const { search, specialtyId } = await searchParams;
  const specialties = await prisma.specialty.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">Our Doctors</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Browse our team of qualified, experienced medical professionals.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <SearchFilter placeholder="Search doctors…" />
        <div className="flex flex-wrap gap-2">
          <a
            href="/doctors"
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${!specialtyId ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
          >
            All
          </a>
          {specialties.map((s: {id:string;name:string}) => (
            <a
              key={s.id}
              href={`/doctors?specialtyId=${s.id}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${specialtyId === s.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
            >
              {s.name}
            </a>
          ))}
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading doctors…" />}>
        <DoctorsList search={search} specialtyId={specialtyId} />
      </Suspense>
    </div>
  );
}
