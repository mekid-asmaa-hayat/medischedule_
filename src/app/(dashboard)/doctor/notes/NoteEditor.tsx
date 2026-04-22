// src/app/(dashboard)/doctor/notes/NoteEditor.tsx
"use client";
import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { saveConsultationNoteAction } from "@/actions/appointments";
import { toast } from "@/hooks/use-toast";
import type { ConsultationNote } from "@/lib/prisma-types";

interface NoteEditorProps {
  appointmentId: string;
  existingNote: ConsultationNote | null | undefined;
}

export function NoteEditor({ appointmentId, existingNote }: NoteEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(!!existingNote);
  const [fields, setFields] = useState({
    subjective: existingNote?.subjective ?? "",
    objective: existingNote?.objective ?? "",
    assessment: existingNote?.assessment ?? "",
    plan: existingNote?.plan ?? "",
    prescription: existingNote?.prescription ?? "",
    followUpDate: existingNote?.followUpDate
      ? new Date(existingNote.followUpDate).toISOString().split("T")[0]
      : "",
  });

  const set = (key: string, val: string) => setFields((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveConsultationNoteAction({ appointmentId, ...fields });
      if (result.success) {
        toast({ title: "Note saved successfully", variant: "default" });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  if (!expanded) {
    return (
      <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
        {existingNote ? "Edit Note" : "Add SOAP Note"}
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">S — Subjective</Label>
          <Textarea
            placeholder="Patient's chief complaint, symptoms, history…"
            value={fields.subjective}
            onChange={(e) => set("subjective", e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-green-700 uppercase tracking-wide">O — Objective</Label>
          <Textarea
            placeholder="Vitals, physical exam findings, lab results…"
            value={fields.objective}
            onChange={(e) => set("objective", e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">A — Assessment</Label>
          <Textarea
            placeholder="Diagnosis, differential diagnosis…"
            value={fields.assessment}
            onChange={(e) => set("assessment", e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">P — Plan</Label>
          <Textarea
            placeholder="Treatment plan, referrals, patient education…"
            value={fields.plan}
            onChange={(e) => set("plan", e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Prescription</Label>
          <Textarea
            placeholder="Medications and dosage…"
            value={fields.prescription}
            onChange={(e) => set("prescription", e.target.value)}
            rows={2}
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Follow-up Date</Label>
          <Input
            type="date"
            value={fields.followUpDate}
            onChange={(e) => set("followUpDate", e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? "Saving…" : "Save Note"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
          Collapse
        </Button>
      </div>
    </div>
  );
}
