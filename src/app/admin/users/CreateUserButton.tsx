"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import CreateUserModal from "./CreateUserModal";

export default function CreateUserButton({ userRole }: { userRole: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium w-fit"
      >
        <UserPlus size={16} />
        Create User
      </button>
      <CreateUserModal open={open} onClose={() => setOpen(false)} userRole={userRole} />
    </>
  );
}
