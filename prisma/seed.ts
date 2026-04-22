// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import { Role, DayOfWeek, AppointmentStatus } from "../src/lib/prisma-enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean slate
  await prisma.notification.deleteMany();
  await prisma.consultationNote.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.user.deleteMany();

  // ── Specialties ────────────────────────────────────────────────
  const specialties = await Promise.all([
    prisma.specialty.create({
      data: {
        name: "General Practice",
        description: "Primary care and general health consultations",
        icon: "stethoscope",
      },
    }),
    prisma.specialty.create({
      data: {
        name: "Cardiology",
        description: "Heart and cardiovascular system specialists",
        icon: "heart",
      },
    }),
    prisma.specialty.create({
      data: {
        name: "Dermatology",
        description: "Skin, hair, and nail conditions",
        icon: "shield",
      },
    }),
    prisma.specialty.create({
      data: {
        name: "Orthopedics",
        description: "Bones, joints, and musculoskeletal system",
        icon: "bone",
      },
    }),
    prisma.specialty.create({
      data: {
        name: "Pediatrics",
        description: "Medical care for infants, children, and adolescents",
        icon: "baby",
      },
    }),
    prisma.specialty.create({
      data: {
        name: "Neurology",
        description: "Nervous system disorders and brain health",
        icon: "brain",
      },
    }),
  ]);

  const [general, cardiology, dermatology, orthopedics, pediatrics, neurology] =
    specialties;

  // ── Admin user ─────────────────────────────────────────────────
  const adminUser = await prisma.user.create({
    data: {
      name: "Dr. Admin",
      email: "admin@medischedule.com",
      password: await bcrypt.hash("Admin1234!", 12),
      role: Role.ADMIN,
      phone: "+1-555-0100",
    },
  });

  // ── Staff user ─────────────────────────────────────────────────
  const staffUser = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "staff@medischedule.com",
      password: await bcrypt.hash("Staff1234!", 12),
      role: Role.STAFF,
      phone: "+1-555-0101",
    },
  });

  // ── Doctors ────────────────────────────────────────────────────
  const doctorData = [
    {
      name: "Dr. James Wilson",
      email: "james.wilson@medischedule.com",
      specialtyId: general.id,
      licenseNumber: "MD-001-2024",
      bio: "Experienced general practitioner with 15 years in primary care.",
      experience: 15,
      consultationFee: 150,
    },
    {
      name: "Dr. Emily Chen",
      email: "emily.chen@medischedule.com",
      specialtyId: cardiology.id,
      licenseNumber: "MD-002-2024",
      bio: "Board-certified cardiologist specializing in preventive cardiology.",
      experience: 12,
      consultationFee: 250,
    },
    {
      name: "Dr. Michael Torres",
      email: "michael.torres@medischedule.com",
      specialtyId: dermatology.id,
      licenseNumber: "MD-003-2024",
      bio: "Dermatologist focused on medical and cosmetic skin treatments.",
      experience: 8,
      consultationFee: 200,
    },
    {
      name: "Dr. Priya Patel",
      email: "priya.patel@medischedule.com",
      specialtyId: orthopedics.id,
      licenseNumber: "MD-004-2024",
      bio: "Orthopedic surgeon specializing in sports medicine and joint replacement.",
      experience: 18,
      consultationFee: 300,
    },
    {
      name: "Dr. Robert Kim",
      email: "robert.kim@medischedule.com",
      specialtyId: pediatrics.id,
      licenseNumber: "MD-005-2024",
      bio: "Caring pediatrician dedicated to children's health from birth through adolescence.",
      experience: 10,
      consultationFee: 175,
    },
  ];

  const doctors = await Promise.all(
    doctorData.map(async (d) => {
      const user = await prisma.user.create({
        data: {
          name: d.name,
          email: d.email,
          password: await bcrypt.hash("Doctor1234!", 12),
          role: Role.DOCTOR,
          phone: "+1-555-0200",
          doctorProfile: {
            create: {
              specialtyId: d.specialtyId,
              licenseNumber: d.licenseNumber,
              bio: d.bio,
              experience: d.experience,
              consultationFee: d.consultationFee,
              rating: 4.5 + Math.random() * 0.5,
              isAcceptingPatients: true,
            },
          },
        },
        include: { doctorProfile: true },
      });
      return user;
    })
  );

  // ── Availability for each doctor (Mon-Fri 9-17) ────────────────
  const weekdays: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];

  for (const doctor of doctors) {
    if (!doctor.doctorProfile) continue;
    await Promise.all(
      weekdays.map((day) =>
        prisma.availability.create({
          data: {
            doctorId: doctor.doctorProfile!.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
            slotDuration: 30,
            isActive: true,
          },
        })
      )
    );
  }

  // ── Patients ────────────────────────────────────────────────────
  const patientData = [
    {
      name: "Alice Morgan",
      email: "alice.morgan@example.com",
      dob: new Date("1990-03-15"),
      gender: "Female",
      bloodType: "A+",
    },
    {
      name: "Bob Chen",
      email: "bob.chen@example.com",
      dob: new Date("1985-07-22"),
      gender: "Male",
      bloodType: "O-",
    },
    {
      name: "Carol Smith",
      email: "carol.smith@example.com",
      dob: new Date("1978-11-08"),
      gender: "Female",
      bloodType: "B+",
    },
    {
      name: "David Park",
      email: "david.park@example.com",
      dob: new Date("1995-01-30"),
      gender: "Male",
      bloodType: "AB+",
    },
    {
      name: "Emma Watson",
      email: "patient@medischedule.com",
      dob: new Date("1992-06-14"),
      gender: "Female",
      bloodType: "O+",
    },
  ];

  const patients = await Promise.all(
    patientData.map(async (p) => {
      const user = await prisma.user.create({
        data: {
          name: p.name,
          email: p.email,
          password: await bcrypt.hash("Patient1234!", 12),
          role: Role.PATIENT,
          phone: "+1-555-0300",
          patientProfile: {
            create: {
              dateOfBirth: p.dob,
              gender: p.gender,
              bloodType: p.bloodType,
              address: "123 Main St, Anytown, ST 12345",
              emergencyContact: "Emergency Contact: +1-555-9999",
            },
          },
        },
        include: { patientProfile: true },
      });
      return user;
    })
  );

  // ── Appointments ────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointmentData = [
    // Past completed
    {
      patientIdx: 0,
      doctorIdx: 0,
      specialtyId: general.id,
      daysOffset: -7,
      startTime: "09:00",
      endTime: "09:30",
      status: AppointmentStatus.COMPLETED,
      reason: "Annual health checkup",
    },
    {
      patientIdx: 1,
      doctorIdx: 1,
      specialtyId: cardiology.id,
      daysOffset: -5,
      startTime: "10:00",
      endTime: "10:30",
      status: AppointmentStatus.COMPLETED,
      reason: "Chest pain evaluation",
    },
    {
      patientIdx: 2,
      doctorIdx: 2,
      specialtyId: dermatology.id,
      daysOffset: -3,
      startTime: "14:00",
      endTime: "14:30",
      status: AppointmentStatus.COMPLETED,
      reason: "Skin rash consultation",
    },
    // Upcoming confirmed
    {
      patientIdx: 0,
      doctorIdx: 1,
      specialtyId: cardiology.id,
      daysOffset: 2,
      startTime: "11:00",
      endTime: "11:30",
      status: AppointmentStatus.CONFIRMED,
      reason: "Follow-up cardiac evaluation",
    },
    {
      patientIdx: 3,
      doctorIdx: 0,
      specialtyId: general.id,
      daysOffset: 3,
      startTime: "09:30",
      endTime: "10:00",
      status: AppointmentStatus.CONFIRMED,
      reason: "General wellness visit",
    },
    {
      patientIdx: 4,
      doctorIdx: 3,
      specialtyId: orthopedics.id,
      daysOffset: 5,
      startTime: "15:00",
      endTime: "15:30",
      status: AppointmentStatus.PENDING,
      reason: "Knee pain assessment",
    },
    {
      patientIdx: 1,
      doctorIdx: 4,
      specialtyId: pediatrics.id,
      daysOffset: 7,
      startTime: "10:30",
      endTime: "11:00",
      status: AppointmentStatus.PENDING,
      reason: "Child wellness checkup",
    },
    // Cancelled
    {
      patientIdx: 2,
      doctorIdx: 0,
      specialtyId: general.id,
      daysOffset: -1,
      startTime: "13:00",
      endTime: "13:30",
      status: AppointmentStatus.CANCELLED,
      reason: "Flu symptoms",
    },
  ];

  const appointments = [];
  for (const appt of appointmentData) {
    const patient = patients[appt.patientIdx];
    const doctor = doctors[appt.doctorIdx];
    if (!patient.patientProfile || !doctor.doctorProfile) continue;

    const apptDate = new Date(today);
    apptDate.setDate(today.getDate() + appt.daysOffset);

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.patientProfile.id,
        doctorId: doctor.doctorProfile.id,
        specialtyId: appt.specialtyId,
        date: apptDate,
        startTime: appt.startTime,
        endTime: appt.endTime,
        status: appt.status,
        reason: appt.reason,
        createdById: adminUser.id,
      },
    });
    appointments.push(appointment);
  }

  // ── Consultation notes for completed appointments ────────────────
  const completedAppts = appointments.filter(
    (a, i) => appointmentData[i]?.status === AppointmentStatus.COMPLETED
  );

  for (const appt of completedAppts) {
    const doctorProfile = await prisma.doctorProfile.findFirst({
      where: { id: appt.doctorId },
    });
    if (!doctorProfile) continue;

    await prisma.consultationNote.create({
      data: {
        appointmentId: appt.id,
        doctorId: doctorProfile.id,
        subjective: "Patient reports mild discomfort. No acute distress noted.",
        objective: "Vitals stable. BP 120/80, HR 72, Temp 98.6°F.",
        assessment: "Patient in good general health. No significant findings.",
        plan: "Continue current medications. Follow up in 3 months.",
        prescription: "Vitamin D 1000 IU daily",
        followUpDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ── Notifications ────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        title: "New Doctor Registered",
        message: "Dr. Robert Kim has joined the platform.",
        type: "info",
        link: "/admin/doctors",
      },
      {
        userId: adminUser.id,
        title: "Appointment Cancelled",
        message: "An appointment was cancelled by the patient.",
        type: "warning",
        link: "/admin/appointments",
      },
      {
        userId: staffUser.id,
        title: "New Appointment Request",
        message: "A new appointment has been requested for tomorrow.",
        type: "info",
        link: "/staff/appointments",
      },
      {
        userId: patients[4].id,
        title: "Appointment Confirmed",
        message: "Your appointment with Dr. Priya Patel is confirmed.",
        type: "success",
        link: "/patient/appointments",
      },
      {
        userId: patients[4].id,
        title: "Reminder",
        message: "You have an appointment in 2 days.",
        type: "info",
        link: "/patient/appointments",
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("\n📧 Test accounts:");
  console.log("  Admin:   admin@medischedule.com   / Admin1234!");
  console.log("  Staff:   staff@medischedule.com   / Staff1234!");
  console.log("  Doctor:  james.wilson@medischedule.com / Doctor1234!");
  console.log("  Patient: patient@medischedule.com / Patient1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
