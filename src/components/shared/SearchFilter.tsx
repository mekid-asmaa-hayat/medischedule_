// src/components/shared/SearchFilter.tsx
"use client";
import { Suspense } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface SearchFilterProps {
  placeholder?: string;
  paramName?: string;
}

function SearchFilterInner({ placeholder = "Search…", paramName = "search" }: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramName) ?? "";

  const updateParam = useCallback(
    (val: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set(paramName, val);
      } else {
        params.delete(paramName);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, paramName]
  );

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        defaultValue={value}
        onChange={(e) => updateParam(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => updateParam("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ✅ Export avec Suspense intégré — toutes les pages sont protégées automatiquement
export function SearchFilter(props: SearchFilterProps) {
  return (
    <Suspense fallback={
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={props.placeholder ?? "Search…"} className="pl-9" disabled />
      </div>
    }>
      <SearchFilterInner {...props} />
    </Suspense>
  );
}