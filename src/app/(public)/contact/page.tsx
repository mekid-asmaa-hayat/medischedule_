// src/app/(public)/contact/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Us" };

const CONTACT_INFO = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["123 Medical Center Drive", "Suite 400", "New York, NY 10001"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["Main: (555) 123-4567", "Emergency: (555) 911-0000"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["info@medischedule.com", "Rdv@medischedule.com"],
  },
  {
    icon: Clock,
    title: "Hours",
    lines: ["Mon – Fri: 8:00 AM – 6:00 PM", "Saturday: 9:00 AM – 2:00 PM", "Sunday: Closed"],
  },
];

export default function ContactPage() {
  return (
    <div className="container py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          We&apos;re here to help. Reach out with any questions or to schedule an appointment.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
        {/* Contact info cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACT_INFO.map(({ icon: Icon, title, lines }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                {lines.map((line) => (
                  <p key={line} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact form */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Smith" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Appointment inquiry" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="How can we help you?" />
              </div>
              <button className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                Send Message
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
