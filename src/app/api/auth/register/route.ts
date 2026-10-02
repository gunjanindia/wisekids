import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
  gradeLevel: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  subjectsTaught: z.string().optional(),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      role,
      gradeLevel,
      parentName,
      parentPhone,
      subjectsTaught,
      qualifications,
      bio,
    } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists with this email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Teachers start as PENDING_APPROVAL, students are active immediately
    const status = role === "TEACHER" ? "PENDING_APPROVAL" : "ACTIVE";

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        status,
        image: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        profile: {
          create: {
            bio: bio || (role === "STUDENT" ? "WiseKids Student Explorer" : "Instructor Applicant"),
            gradeLevel,
            parentName,
            parentPhone,
            subjectsTaught,
            qualifications,
          },
        },
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        detailsJson: JSON.stringify({ email: user.email, role: user.role, status: user.status }),
      },
    });

    // Send welcoming notification to student
    if (role === "STUDENT") {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "🚀 Welcome to WiseKids!",
          message: "Explore our catalog to enroll in courses and start learning.",
          type: "SYSTEM",
          link: "/student/catalog",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        role === "TEACHER"
          ? "Instructor application submitted! An administrator will review your account."
          : "Account created successfully! You can now log in.",
      userId: user.id,
      status: user.status,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
