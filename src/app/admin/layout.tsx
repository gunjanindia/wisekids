import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac";
import { PortalShell } from "@/components/layout/portal-shell";

export const metadata = {
  title: "Admin Portal | WiseKids Academy",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (user.role !== "ADMIN") {
    if (user.role === "TEACHER") redirect("/teacher");
    redirect("/student");
  }

  return (
    <PortalShell
      role="ADMIN"
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
