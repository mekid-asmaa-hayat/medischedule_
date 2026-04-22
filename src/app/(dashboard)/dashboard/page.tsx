// src/app/(dashboard)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardPath } from "@/lib/utils/permissions";

// This page immediately redirects to the role-specific dashboard.
// Middleware also handles this, but this is the fallback.
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(getDashboardPath(session.user.role));
}
