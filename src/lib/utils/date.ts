// src/lib/utils/date.ts
import { format, parseISO, isToday, isFuture, isPast } from "date-fns";

export function formatDate(date: Date | string, fmt = "MMM d, yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatTime(time: string) {
  // Convert "HH:MM" 24hr to "h:mm AM/PM"
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function formatDateTime(date: Date | string, time: string) {
  return `${formatDate(date)} at ${formatTime(time)}`;
}

export function isAppointmentToday(date: Date | string) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isToday(d);
}

export function isAppointmentUpcoming(date: Date | string) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isFuture(d) || isToday(d);
}

export function isAppointmentPast(date: Date | string) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isPast(d) && !isToday(d);
}

/** Generate 30-minute time slots between start and end */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration = 30
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + slotDuration <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    current += slotDuration;
  }

  return slots;
}

export function getDayOfWeekName(date: Date): string {
  return format(date, "EEEE").toUpperCase();
}
