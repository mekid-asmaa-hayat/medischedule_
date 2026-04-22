// src/app/(dashboard)/admin/doctors/DoctorActions.tsx
"use client";
import { useTransition } from "react";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDoctorAction } from "@/actions/doctors";
import { toast } from "@/hooks/use-toast";

export function AdminDoctorActions({ doctorId, userId }: { doctorId: string; userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteDoctorAction(userId);
      if (result.success) {
        toast({ title: "Doctor deleted", variant: "default" });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/admin/doctors/${doctorId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
