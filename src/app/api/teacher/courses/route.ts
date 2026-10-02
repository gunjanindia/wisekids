import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const teacher = await requireTeacherOrAdmin();
    const courses = await prisma.course.findMany({
      where: teacher.role === "ADMIN" ? {} : { teacherId: teacher.id },
      include: {
        category: true,
        modules: {
          include: {
            lessons: true,
            assignments: true,
            quizzes: true,
          },
          orderBy: { order: "asc" },
        },
        batches: true,
        _count: { select: { enrollments: true, assignments: true, quizzes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.category.findMany();

    return NextResponse.json({ courses, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const teacher = await requireTeacherOrAdmin();
    const body = await request.json();
    const {
      title,
      description,
      shortDesc,
      thumbnail,
      price,
      isFree,
      level,
      ageGroup,
      durationWeeks,
      categoryId,
      modules,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 6);

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDesc: shortDesc || description.slice(0, 120),
        thumbnail:
          thumbnail ||
          "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
        price: isFree ? 0 : parseFloat(price) || 0,
        isFree: !!isFree,
        level: level || "Beginner",
        status: "PUBLISHED",
        ageGroup: ageGroup || "8-14 Years",
        durationWeeks: parseInt(durationWeeks) || 8,
        categoryId: categoryId || null,
        teacherId: teacher.id,
      },
    });

    // Create modules & lessons if provided
    if (modules && Array.isArray(modules)) {
      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const m = modules[mIdx];
        const moduleRecord = await prisma.module.create({
          data: {
            courseId: course.id,
            title: m.title || `Module ${mIdx + 1}`,
            description: m.description || "",
            order: mIdx + 1,
          },
        });

        if (m.lessons && Array.isArray(m.lessons)) {
          for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
            const l = m.lessons[lIdx];
            await prisma.lesson.create({
              data: {
                moduleId: moduleRecord.id,
                title: l.title || `Lesson ${lIdx + 1}`,
                contentType: l.contentType || "VIDEO",
                contentUrl: l.contentUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
                contentText: l.contentText || "Lesson notes and exercise overview.",
                durationMinutes: parseInt(l.durationMinutes) || 15,
                isFreePreview: !!l.isFreePreview,
                order: lIdx + 1,
              },
            });
          }
        }
      }
    }

    await createAuditLog({
      userId: teacher.id,
      action: "TEACHER_CREATE_COURSE",
      entity: "Course",
      entityId: course.id,
      details: { title: course.title, teacher: teacher.name },
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    console.error("Course create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
