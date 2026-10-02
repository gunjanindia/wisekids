import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireTeacherOrAdmin } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await requireTeacherOrAdmin();
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireTeacherOrAdmin();
    const body = await request.json();
    const { name, bio, qualifications, subjectsTaught, phone, newPassword } = body;

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
        qualifications,
        subjectsTaught,
        phone,
      },
      create: {
        userId: user.id,
        bio,
        qualifications,
        subjectsTaught,
        phone,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
