// src/components/appointments/AppointmentCard.tsx
"use client";
import { Calendar, Clock, User, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatTime } from "@/lib/utils/date";
import type { AppointmentWithRelations } from "@/types";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  showActions?: boolean;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  showActions = false,
  onCancel,
  onConfirm,
  onComplete,
}: AppointmentCardProps) {
  const { id, date, startTime, endTime, reason, status, patient, doctor, specialty } = appointment;
  const isPending = status === "PENDING";
  const isConfirmed = status === "CONFIRMED";
  const isCancellable = isPending || isConfirmed;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-semibold text-sm line-clamp-1">{reason}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Stethoscope className="h-3 w-3" />
              {specialty.name}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatTime(startTime)} – {formatTime(endTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Dr. {doctor.user.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{patient.user.name}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-1">
            {isPending && onConfirm && (
              <Button size="sm" className="flex-1" onClick={() => onConfirm(id)}>
                Confirm
              </Button>
            )}
            {isConfirmed && onComplete && (
              <Button size="sm" className="flex-1" onClick={() => onComplete(id)}>
                Complete
              </Button>
            )}
            {isCancellable && onCancel && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onCancel(id)}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
