// src/app/(dashboard)/patient/appointments/PatientAppointmentActions.tsx
"use client";
import { useTransition } from "react";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { cancelAppointmentAction } from "@/actions/appointments";
import { toast } from "@/hooks/use-toast";
import type { AppointmentWithRelations } from "@/types";

export function PatientAppointmentActions({ appointment }: { appointment: AppointmentWithRelations }) {
  const [, startTransition] = useTransition();

  const handleCancel = (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    startTransition(async () => {
      const result = await cancelAppointmentAction(id);
      if (result.success) {
        toast({ title: "Appointment cancelled" });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  const isCancellable = ["PENDING", "CONFIRMED"].includes(appointment.status);

  return (
    <AppointmentCard
      appointment={appointment}
      showActions={isCancellable}
      onCancel={isCancellable ? handleCancel : undefined}
    />
  );
}
