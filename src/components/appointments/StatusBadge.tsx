// src/components/appointments/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/lib/prisma-enums";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }
> = {
  PENDING:   { label: "Pending",   variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "info" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  NO_SHOW:   { label: "No Show",   variant: "secondary" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, variant } = STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
