import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    onboarded: boolean;
    image?: string | null;
  };

  if (!isCrmRole(user.role)) redirect("/login");

  const userName = user.name || "Admin";
  const userRole = user.role;

  return (
    <div className="flex h-screen overflow-hidden bg-dark-primary">
      <AdminSidebar
        userName={userName}
        userRole={userRole}
        userImage={user.image || undefined}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
