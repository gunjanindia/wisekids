import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const user = await getCurrentUser();
    const role = user?.role || "STUDENT";

    // 1. Search Courses
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 5,
    });

    // 2. Search Assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        title: { contains: q },
      },
      include: { course: true },
      take: 5,
    });

    // 3. Search Announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      take: 3,
    });

    // Build unified results
    const results: any[] = [];

    courses.forEach((c) => {
      let link = `/student/courses/${c.id}/learn`;
      if (role === "ADMIN") link = `/admin/courses`;
      if (role === "TEACHER") link = `/teacher/courses`;

      results.push({
        type: "course",
        title: c.title,
        subtitle: `${c.level} • ${c.ageGroup}`,
        link,
      });
    });

    assignments.forEach((a) => {
      let link = `/student/assignments`;
      if (role === "ADMIN") link = `/admin/courses`;
      if (role === "TEACHER") link = `/teacher/assignments`;

      results.push({
        type: "assignment",
        title: a.title,
        subtitle: `Course: ${a.course?.title || "Curriculum"}`,
        link,
      });
    });

    announcements.forEach((an) => {
      let link = `/${role.toLowerCase()}`;
      results.push({
        type: "announcement",
        title: an.title,
        subtitle: "Notice Broadcast",
        link,
      });
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] });
  }
}
