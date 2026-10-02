import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await requireAuth();
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        enrollments: { include: { course: true, batch: true } },
        payments: { include: { course: true } },
        certificates: { include: { course: true } },
      },
    });
    return NextResponse.json({ user: fullUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, bio, gradeLevel, parentName, parentPhone, newPassword } = body;

    const updateUserData: any = {};
    if (name) updateUserData.name = name;
    if (newPassword && newPassword.length >= 6) {
      updateUserData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateUserData,
      });
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio,
        gradeLevel,
        parentName,
        parentPhone,
      },
      create: {
        userId: user.id,
        bio,
        gradeLevel,
        parentName,
        parentPhone,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
