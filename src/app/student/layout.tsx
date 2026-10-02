import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac";
import { PortalShell } from "@/components/layout/portal-shell";

export const metadata = {
  title: "Student Portal | WiseKids Academy",
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/student");
  }

  return (
    <PortalShell
      role="STUDENT"
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
