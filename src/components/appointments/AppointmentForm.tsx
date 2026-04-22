// src/components/appointments/AppointmentForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createAppointmentSchema, type CreateAppointmentInput } from "@/lib/validations/appointment";
import { createAppointmentAction } from "@/actions/appointments";
import { generateTimeSlots } from "@/lib/utils/date";
import { toast } from "@/hooks/use-toast";
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

interface AppointmentFormProps {
  doctors: Doctor[];
  patients: Patient[];
  specialties: Specialty[];
  defaultPatientId?: string;
  onSuccess?: () => void;
}

export function AppointmentForm({
  doctors,
  patients,
  specialties,
  defaultPatientId,
  onSuccess,
}: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: { patientId: defaultPatientId ?? "" },
  });

  const selectedDoctorId = watch("doctorId");
  const selectedDate = watch("date");
  const selectedStartTime = watch("startTime");

  // Compute available time slots when doctor + date change
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!doctor) return;

    const dateObj = new Date(selectedDate);
    const dayName = dateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();

    const avail = doctor.availability.find((a) => a.dayOfWeek === dayName);
    if (!avail) {
      setAvailableSlots([]);
      return;
    }
    const slots = generateTimeSlots(avail.startTime, avail.endTime, avail.slotDuration);
    setAvailableSlots(slots);
  }, [selectedDoctorId, selectedDate, doctors]);

  // Auto-set end time (30 min after start)
  useEffect(() => {
    if (!selectedStartTime) return;
    const [h, m] = selectedStartTime.split(":").map(Number);
    const totalMin = h * 60 + m + 30;
    const endH = Math.floor(totalMin / 60).toString().padStart(2, "0");
    const endM = (totalMin % 60).toString().padStart(2, "0");
    setValue("endTime", `${endH}:${endM}`);
  }, [selectedStartTime, setValue]);

  const onSubmit = async (data: CreateAppointmentInput) => {
    setLoading(true);
    try {
      const result = await createAppointmentAction(data);
      if (result.success) {
        toast({ title: "Appointment created", description: "The appointment has been booked successfully.", variant: "default" });
        onSuccess?.();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Patient */}
      <div className="space-y-1.5">
        <Label>Patient</Label>
        <Select
          defaultValue={defaultPatientId}
          onValueChange={(v) => setValue("patientId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.patientId && <p className="text-xs text-destructive">{errors.patientId.message}</p>}
      </div>

      {/* Specialty */}
      <div className="space-y-1.5">
        <Label>Specialty</Label>
        <Select onValueChange={(v) => setValue("specialtyId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.specialtyId && <p className="text-xs text-destructive">{errors.specialtyId.message}</p>}
      </div>

      {/* Doctor */}
      <div className="space-y-1.5">
        <Label>Doctor</Label>
        <Select onValueChange={(v) => setValue("doctorId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                Dr. {d.user.name} — {d.specialty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.doctorId && <p className="text-xs text-destructive">{errors.doctorId.message}</p>}
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input type="date" min={today} {...register("date")} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      {/* Time slot */}
      <div className="space-y-1.5">
        <Label>Time Slot</Label>
        {availableSlots.length > 0 ? (
          <Select onValueChange={(v) => setValue("startTime", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground">
            {selectedDoctorId && selectedDate
              ? "No available slots for this doctor on the selected date."
              : "Select a doctor and date to see available slots."}
          </p>
        )}
        <input type="hidden" {...register("endTime")} />
        {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
      </div>

      {/* Reason */}
      <div className="space-y-1.5">
        <Label>Reason for Visit</Label>
        <Textarea
          placeholder="Briefly describe the reason for this appointment…"
          {...register("reason")}
        />
        {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label>Additional Notes (optional)</Label>
        <Textarea placeholder="Any additional information…" {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Booking…" : "Book Appointment"}
      </Button>
    </form>
  );
}
