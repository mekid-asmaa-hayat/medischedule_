// src/app/(auth)/layout.tsx
import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 text-primary-foreground">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-10 w-10" />
            <span className="text-3xl font-bold">MediSchedule</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Modern Healthcare Management
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Schedule appointments, manage patients, and streamline your clinic operations — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {["Easy Booking", "Doctor Profiles", "Smart Scheduling", "Secure Records"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="lg:hidden mb-8 flex items-center gap-2 font-bold text-xl text-primary">
          <Stethoscope className="h-6 w-6" />
          MediSchedule
        </div>
        <div className="w-full max-w-md">{children}</div>
        <p className="mt-8 text-xs text-muted-foreground text-center">
          <Link href="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
