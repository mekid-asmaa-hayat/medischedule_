// src/app/api/availability/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { generateTimeSlots } from "@/lib/utils/date";

/**
 * GET /api/availability?doctorId=xxx&date=YYYY-MM-DD
 * Returns available time slots for a doctor on a given date,
 * excluding already-booked slots.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctorId");
  const dateStr = searchParams.get("date");

  if (!doctorId || !dateStr) {
    return errorResponse("doctorId and date are required");
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return errorResponse("Invalid date format");

  const dayName = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  // Get the doctor's weekly availability for this day
  const availability = await prisma.availability.findFirst({
    where: { doctorId, dayOfWeek: dayName as never, isActive: true },
  });

  if (!availability) {
    return successResponse({ slots: [], message: "Doctor is not available on this day" });
  }

  // Check for time-off on this date
  const timeOff = await prisma.timeOff.findFirst({
    where: {
      doctorId,
      startDate: { lte: date },
      endDate: { gte: date },
    },
  });

  if (timeOff) {
    return successResponse({ slots: [], message: "Doctor is on time-off on this date" });
  }

  // Generate all slots
  const allSlots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration
  );

  // Get booked slots for this doctor on this date
  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date,
      status: { notIn: ["CANCELLED"] },
    },
    select: { startTime: true },
  });

  const bookedTimes = new Set(bookedAppointments.map((a: { startTime: string }) => a.startTime));

  // Filter out booked slots
  const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

  return successResponse({
    slots: availableSlots,
    slotDuration: availability.slotDuration,
    startTime: availability.startTime,
    endTime: availability.endTime,
  });
}
