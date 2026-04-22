// src/app/(public)/specialties/page.tsx
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, Heart, Brain, Baby, Bone, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Medical Specialties" };

const ICON_MAP: Record<string, React.ElementType> = {
  Cardiology: Heart,
  Neurology: Brain,
  Pediatrics: Baby,
  Orthopedics: Bone,
  Dermatology: Shield,
  default: Stethoscope,
};

export default async function SpecialtiesPage() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { doctors: true, appointments: true } },
    },
  });

  return (
    <div className="container py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">Medical Specialties</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Our clinic covers a wide range of medical fields with expert specialists.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((specialty: {id:string;name:string;description:string|null;_count:{doctors:number;appointments:number}}) => {
          const Icon = ICON_MAP[specialty.name] ?? ICON_MAP.default;
          return (
            <Card key={specialty.id} className="hover:shadow-lg transition-all group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1">{specialty.name}</h3>
                    {specialty.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {specialty.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {specialty._count.doctors} doctor{specialty._count.doctors !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {specialty._count.appointments} appointments
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/5" asChild>
                    <Link href={`/doctors?specialtyId=${specialty.id}`}>
                      Browse Doctors <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground mb-4">Don&apos;t see your specialty? Contact us.</p>
        <Button asChild>
          <Link href="/contact">Contact the Clinic</Link>
        </Button>
      </div>
    </div>
  );
}
