// src/app/(dashboard)/doctor/availability/AvailabilityManager.tsx
"use client";
import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, CalendarOff } from "lucide-react";
import { upsertAvailabilityAction, createTimeOffAction, deleteTimeOffAction } from "@/actions/availability";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/date";
import type { Availability, TimeOff } from "@/lib/prisma-types";

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"] as const;
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

interface Props {
  availability: Availability[];
  timeOffs: TimeOff[];
}

export function AvailabilityManager({ availability: initialAvail, timeOffs: initialTimeOffs }: Props) {
  const [isPending, startTransition] = useTransition();
  const [avail, setAvail] = useState(initialAvail);
  const [timeOffs, setTimeOffs] = useState(initialTimeOffs);
  const [newTimeOff, setNewTimeOff] = useState({ startDate: "", endDate: "", reason: "" });

  const getDay = (day: string) => avail.find((a) => a.dayOfWeek === day);

  const handleToggle = (day: string, checked: boolean) => {
    if (!checked) return; // Don't remove on toggle off — just deactivate
    startTransition(async () => {
      const existing = getDay(day);
      const result = await upsertAvailabilityAction({
        dayOfWeek: day,
        startTime: existing?.startTime ?? "09:00",
        endTime: existing?.endTime ?? "17:00",
        slotDuration: existing?.slotDuration ?? 30,
        isActive: checked,
      });
      if (result.success) {
        setAvail((prev) => {
          const filtered = prev.filter((a) => a.dayOfWeek !== day);
          return [...filtered, result.data as Availability];
        });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  const handleSave = (day: string, startTime: string, endTime: string, slotDuration: number) => {
    startTransition(async () => {
      const result = await upsertAvailabilityAction({ dayOfWeek: day, startTime, endTime, slotDuration, isActive: true });
      if (result.success) {
        toast({ title: "Availability saved" });
        setAvail((prev) => {
          const filtered = prev.filter((a) => a.dayOfWeek !== day);
          return [...filtered, result.data as Availability];
        });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  const handleAddTimeOff = () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate) return;
    startTransition(async () => {
      const result = await createTimeOffAction(newTimeOff);
      if (result.success) {
        toast({ title: "Time off added" });
        setTimeOffs((prev) => [...prev, result.data as TimeOff]);
        setNewTimeOff({ startDate: "", endDate: "", reason: "" });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  const handleDeleteTimeOff = (id: string) => {
    startTransition(async () => {
      await deleteTimeOffAction(id);
      setTimeOffs((prev) => prev.filter((t) => t.id !== id));
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((day) => {
            const entry = getDay(day);
            const [start, setStart] = useState(entry?.startTime ?? "09:00");
            const [end, setEnd] = useState(entry?.endTime ?? "17:00");
            const [slot, setSlot] = useState(entry?.slotDuration ?? 30);

            return (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={!!entry?.isActive}
                      onCheckedChange={(c) => handleToggle(day, c)}
                      disabled={isPending}
                    />
                    <span className="text-sm font-medium w-8">{DAY_LABELS[day]}</span>
                  </div>
                  {entry?.isActive && (
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  )}
                </div>
                {entry?.isActive && (
                  <div className="ml-12 grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start</Label>
                      <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End</Label>
                      <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Slot (min)</Label>
                      <Input
                        type="number"
                        value={slot}
                        min={15}
                        max={120}
                        step={15}
                        onChange={(e) => setSlot(Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={() => handleSave(day, start, end, slot)} disabled={isPending}>
                        Save
                      </Button>
                    </div>
                  </div>
                )}
                <Separator />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Time off */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarOff className="h-4 w-4" /> Time Off
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new */}
          <div className="rounded-md border p-3 space-y-3">
            <p className="text-sm font-medium">Add Time Off</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={newTimeOff.startDate} onChange={(e) => setNewTimeOff((p) => ({ ...p, startDate: e.target.value }))} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input type="date" value={newTimeOff.endDate} onChange={(e) => setNewTimeOff((p) => ({ ...p, endDate: e.target.value }))} className="h-8 text-xs" />
              </div>
            </div>
            <Input
              placeholder="Reason (optional)"
              value={newTimeOff.reason}
              onChange={(e) => setNewTimeOff((p) => ({ ...p, reason: e.target.value }))}
              className="h-8 text-xs"
            />
            <Button size="sm" className="w-full" onClick={handleAddTimeOff} disabled={isPending || !newTimeOff.startDate || !newTimeOff.endDate}>
              <Plus className="mr-2 h-3 w-3" /> Add
            </Button>
          </div>

          {/* List */}
          {timeOffs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming time off scheduled.</p>
          ) : (
            <div className="space-y-2">
              {timeOffs.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{formatDate(t.startDate)} — {formatDate(t.endDate)}</p>
                    {t.reason && <p className="text-xs text-muted-foreground">{t.reason}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteTimeOff(t.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
