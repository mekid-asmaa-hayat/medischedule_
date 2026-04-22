// src/components/appointments/AppointmentTable.tsx
"use client";
import { useState, useTransition } from "react";
import { MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatTime } from "@/lib/utils/date";
import {
  updateAppointmentStatusAction,
  cancelAppointmentAction,
} from "@/actions/appointments";
import { toast } from "@/hooks/use-toast";
import type { AppointmentWithRelations } from "@/types";
import type { AppointmentStatus, Role } from "@/lib/prisma-enums";

interface AppointmentTableProps {
  appointments: AppointmentWithRelations[];
  userRole: Role;
}

export function AppointmentTable({ appointments, userRole }: AppointmentTableProps) {
  const [, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const canManage = ["ADMIN", "DOCTOR", "STAFF"].includes(userRole);

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    setProcessingId(id);
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(id, status);
      if (result.success) {
        toast({ title: "Status updated", variant: "default" });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
      setProcessingId(null);
    });
  };

  const handleCancel = (id: string) => {
    setProcessingId(id);
    startTransition(async () => {
      const result = await cancelAppointmentAction(id);
      if (result.success) {
        toast({ title: "Appointment cancelled" });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
      setProcessingId(null);
    });
  };

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">No appointments found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Patient</th>
            <th className="px-4 py-3 text-left font-medium">Doctor</th>
            <th className="px-4 py-3 text-left font-medium">Date & Time</th>
            <th className="px-4 py-3 text-left font-medium">Specialty</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            {canManage && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium">{appt.patient.user.name}</td>
              <td className="px-4 py-3 text-muted-foreground">Dr. {appt.doctor.user.name}</td>
              <td className="px-4 py-3">
                <div>{formatDate(appt.date)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline">{appt.specialty.name}</Badge>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={appt.status} />
              </td>
              {canManage && (
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={processingId === appt.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {appt.status === "PENDING" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(appt.id, "CONFIRMED")}>
                          Confirm
                        </DropdownMenuItem>
                      )}
                      {appt.status === "CONFIRMED" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(appt.id, "COMPLETED")}>
                          Mark Completed
                        </DropdownMenuItem>
                      )}
                      {appt.status === "CONFIRMED" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(appt.id, "NO_SHOW")}>
                          Mark No-Show
                        </DropdownMenuItem>
                      )}
                      {["PENDING", "CONFIRMED"].includes(appt.status) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleCancel(appt.id)}
                          >
                            Cancel
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
