// src/app/(public)/layout.tsx
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MediSchedule. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
