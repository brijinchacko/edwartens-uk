import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
  title: "My Profile | EDWartens Admin",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employeeProfile: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
        <p className="text-text-muted mt-1">Update your personal and professional information</p>
      </div>

      <ProfileForm
        userId={user.id}
        name={user.name}
        email={user.email}
        phone={user.phone || ""}
        bio={user.employeeProfile?.bio || ""}
        department={user.employeeProfile?.department || ""}
        specialization={user.employeeProfile?.specialization || ""}
        designation={user.employeeProfile?.designation || ""}
        zadarmaNumber={user.employeeProfile?.zadarmaNumber || ""}
      />
    </div>
  );
}
