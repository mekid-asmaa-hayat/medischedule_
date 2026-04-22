// src/app/(dashboard)/staff/appointments/StaffBookDialog.tsx
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import type { Specialty } from "@/lib/prisma-types";

interface Doctor {
  id: string;
  userId: string;
  user: { name: string };
  specialty: Specialty;
  availability: { dayOfWeek: string; startTime: string; endTime: string; slotDuration: number }[];
}

interface Patient {
  id: string;
  user: { name: string };
}

interface Props {
  doctors: Doctor[];
  patients: Patient[];
  specialties: Specialty[];
}

export function StaffBookDialog({ doctors, patients, specialties }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>
        <AppointmentForm
          doctors={doctors}
          patients={patients}
          specialties={specialties}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
