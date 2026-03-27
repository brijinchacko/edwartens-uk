import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import StudentSidebar from "@/components/StudentSidebar";
import { LogOut } from "lucide-react";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) redirect("/login");

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    onboarded: boolean;
  };

  if (user.role !== "STUDENT") redirect("/login");

  if (!user.onboarded) redirect("/student/onboarding");

  const userName = user.name || "Student";
  const userEmail = user.email || "";
  const onboarded = user.onboarded;

  return (
    <div className="flex h-screen bg-dark-primary overflow-hidden">
      <StudentSidebar
        userName={userName}
        userEmail={userEmail}
        onboarded={onboarded}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-dark-secondary/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-text-primary">
              Student Portal
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">
              {userName}
            </span>
            <a
              href="/api/auth/signout"
              className="flex items-center gap-2 text-sm text-text-muted hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
