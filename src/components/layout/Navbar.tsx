// src/components/layout/Navbar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/specialties", label: "Specialties" },
  { href: "/contact", label: "Contact" },
];

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const dashPath =
    session?.user.role === "ADMIN" ? "/admin"
    : session?.user.role === "DOCTOR" ? "/doctor"
    : session?.user.role === "STAFF" ? "/staff"
    : "/patient";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Stethoscope className="h-6 w-6" />
          MediSchedule
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={dashPath}>Dashboard</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block text-sm font-medium py-1"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t flex flex-col gap-2">
            {session ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={dashPath}>Dashboard</Link>
                </Button>
                <Button size="sm" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild><Link href="/login">Sign In</Link></Button>
                <Button size="sm" asChild><Link href="/register">Get Started</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
