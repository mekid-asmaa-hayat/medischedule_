// src/app/(dashboard)/settings/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getRoleLabel } from "@/lib/utils/permissions";
import { formatDate } from "@/lib/utils/date";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      patientProfile: true,
      doctorProfile: { include: { specialty: true } },
    },
  });
  if (!user) redirect("/login");

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Manage your account and profile." />

      {/* Profile overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
                {user.doctorProfile && (
                  <Badge variant="outline">{user.doctorProfile.specialty.name}</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phone ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Member Since</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            {user.patientProfile?.bloodType && (
              <div>
                <p className="text-muted-foreground">Blood Type</p>
                <p className="font-medium">{user.patientProfile.bloodType}</p>
              </div>
            )}
            {user.patientProfile?.gender && (
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="font-medium">{user.patientProfile.gender}</p>
              </div>
            )}
            {user.doctorProfile && (
              <>
                <div>
                  <p className="text-muted-foreground">License</p>
                  <p className="font-medium font-mono text-xs">{user.doctorProfile.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{user.doctorProfile.experience ?? "—"} years</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
