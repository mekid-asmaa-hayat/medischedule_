
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Bone,
} from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "Easy Scheduling",
    desc: "Book appointments online 24/7 with instant confirmation.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your health data is protected with enterprise-grade security.",
  },
  {
    icon: Clock,
    title: "No Wait Times",
    desc: "Choose your preferred time slot and doctor for a seamless experience.",
  },
  {
    icon: Star,
    title: "Rated Doctors",
    desc: "Browse verified doctors with patient reviews and credentials.",
  },
];

const SPECIALTY_ICONS: Record<string, React.ElementType> = {
  Cardiology: Heart,
  Neurology: Brain,
  Pediatrics: Baby,
  Orthopedics: Bone,
  default: Stethoscope,
};

export default async function Page() {
  const [specialties, doctorCount, appointmentCount] = await Promise.all([
    prisma.specialty.findMany({
      take: 6,
      include: {
        _count: {
          select: { doctors: true },
        },
      },
    }),
    prisma.user.count({
      where: { role: "DOCTOR" },
    }),
    prisma.appointment.count({
      where: { status: "COMPLETED" },
    }),
  ]);

  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section
        className="relative overflow-hidden bg-cover bg-center text-white py-10"
        style={{ backgroundImage: "url('/images/HomePage.jpg')" }}
      >
        <div className="container relative z-10">
          <div className="max-w-2xl space-y-6">

            <div className="inline-flex items-center gap-2 rounded-full bg-stone-200 px-4 py-1.5 text-sm backdrop-blur text-stone-900">
              <Stethoscope className="h-4 w-4" />
              Trusted by thousands of patients
            </div>

            <h1 className="text-5xl font-extrabold leading-tight md:text-6xl text-stone-900">
              Your Health,<br />Our Priority
            </h1>

            <p className="text-xl text-stone-900 leading-relaxed">
              Book appointments with top-rated doctors, manage your health
              records, and get the care you deserve — all in one place.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
                asChild
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
                asChild
              >
                <Link href="/doctors">Browse Doctors</Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b pt-2 mt-3">
        <div className="container">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: `${doctorCount}+`, label: "Expert Doctors" },
              { value: `${specialties.length}+`, label: "Specialties" },
              { value: `${appointmentCount}+`, label: "Appointments Completed" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-primary">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-muted/30">
        <div className="container">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose MediSchedule?</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              We make healthcare accessible and convenient for everyone.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card
                key={title}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-8 pb-6">

                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{title}</h3>

                  <p className="text-sm text-muted-foreground">{desc}</p>

                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="py-20">
        <div className="container">

          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Medical Specialties</h2>
              <p className="text-muted-foreground mt-2">
                Find the specialist you need
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link href="/specialties">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((s: any) => {
              const Icon =
                SPECIALTY_ICONS[s.name] ?? SPECIALTY_ICONS.default;

              return (
                <Card
                  key={s.id}
                  className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <CardContent className="flex items-center gap-4 p-5">

                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {s._count.doctors} doctor
                        {s._count.doctors !== 1 ? "s" : ""}
                      </p>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center space-y-6">

          <h2 className="text-3xl font-bold">
            Ready to take control of your health?
          </h2>

          <p className="text-primary-foreground/80 max-w-lg mx-auto">
            Join thousands of patients who trust MediSchedule for their
            healthcare needs.
          </p>

          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold"
            asChild
          >
            <Link href="/register">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

        </div>
      </section>

    </div>
  );
}