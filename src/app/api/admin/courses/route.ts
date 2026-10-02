import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();
    const courses = await prisma.course.findMany({
      include: {
        category: true,
        teacher: true,
        modules: { include: { lessons: true } },
        _count: { select: { enrollments: true, batches: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.category.findMany();
    return NextResponse.json({ courses, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { id, status, title, price, isFree, level, featured, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isFree !== undefined) updateData.isFree = isFree;
    if (level !== undefined) updateData.level = level;
    if (featured !== undefined) updateData.featured = featured;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_UPDATE_COURSE",
      entity: "Course",
      entityId: course.id,
      details: updateData,
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    await prisma.course.delete({ where: { id } });

    await createAuditLog({
      userId: admin.id,
      action: "ADMIN_DELETE_COURSE",
      entity: "Course",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete course" }, { status: 500 });
  }
}
