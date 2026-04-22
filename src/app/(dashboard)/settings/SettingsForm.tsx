// src/app/(dashboard)/settings/SettingsForm.tsx
"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    patientProfile: {
      id: string;
      address: string | null;
      allergies: string | null;
      emergencyContact: string | null;
    } | null;
    doctorProfile: {
      id: string;
      bio: string | null;
      consultationFee: unknown;
    } | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");

  // Role-specific fields
  const [address, setAddress] = useState(user.patientProfile?.address ?? "");
  const [allergies, setAllergies] = useState(user.patientProfile?.allergies ?? "");
  const [emergencyContact, setEmergencyContact] = useState(user.patientProfile?.emergencyContact ?? "");
  const [bio, setBio] = useState(user.doctorProfile?.bio ?? "");

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            // role-specific
            ...(user.patientProfile && { address, allergies, emergencyContact }),
            ...(user.doctorProfile && { bio }),
          }),
        });

        if (res.ok) {
          toast({ title: "Settings saved", variant: "default" });
        } else {
          toast({ title: "Error saving settings", variant: "destructive" });
        }
      } catch {
        toast({ title: "Network error", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
        </div>
      </div>

      {/* Patient-specific fields */}
      {user.patientProfile && (
        <>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Allergies</Label>
            <Textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="List any known allergies…"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Emergency Contact</Label>
            <Input
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Name and phone number"
            />
          </div>
        </>
      )}

      {/* Doctor-specific fields */}
      {user.doctorProfile && (
        <div className="space-y-2">
          <Label>Professional Bio</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Briefly describe your background and expertise…"
            rows={4}
          />
        </div>
      )}

      <Button onClick={handleSave} disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
