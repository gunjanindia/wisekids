import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac";
import { PortalShell } from "@/components/layout/portal-shell";

export const metadata = {
  title: "Teacher Portal | WiseKids Academy",
};

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/teacher");
  }

  if (user.role !== "TEACHER" && user.role !== "ADMIN") {
    redirect("/student");
  }

  return (
    <PortalShell
      role="TEACHER"
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
      }}
    >
      {children}
    </PortalShell>
  );
}
