// src/components/doctors/DoctorCard.tsx
import { Star, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import type { DoctorCardData } from "@/types";

interface DoctorCardProps {
  doctor: DoctorCardData;
  showBookButton?: boolean;
}

export function DoctorCard({ doctor, showBookButton = true }: DoctorCardProps) {
  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 border-2 border-primary/10">
            <AvatarImage src={doctor.image ?? undefined} alt={doctor.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{doctor.name}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {doctor.specialty}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {doctor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{doctor.bio}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          {doctor.rating !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{doctor.rating.toFixed(1)}</span>
            </div>
          )}
          {doctor.experience !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{doctor.experience}y exp.</span>
            </div>
          )}
          {doctor.consultationFee !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>${doctor.consultationFee}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            {doctor.isAcceptingPatients ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600 text-xs">Accepting</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-red-500 text-xs">Not accepting</span>
              </>
            )}
          </div>
        </div>

        {showBookButton && doctor.isAcceptingPatients && (
          <Button className="w-full" size="sm" asChild>
            <Link href={`/patient/book?doctorId=${doctor.id}`}>Book Appointment</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
