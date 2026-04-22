// src/app/(dashboard)/admin/specialties/SpecialtyActions.tsx
"use client";
import { useTransition } from "react";
import { Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSpecialtyAction } from "@/actions/specialties";
import { toast } from "@/hooks/use-toast";

export function SpecialtyActions({ specialtyId }: { specialtyId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Delete this specialty? This will fail if doctors are assigned to it.")) return;
    startTransition(async () => {
      const result = await deleteSpecialtyAction(specialtyId);
      if (result.success) {
        toast({ title: "Specialty deleted" });
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
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
