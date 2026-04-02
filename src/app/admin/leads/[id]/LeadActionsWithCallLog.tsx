"use client";

import { useState } from "react";
import LeadActions from "./LeadActions";
import CallLogModal from "./CallLogModal";

interface LeadActionsWithCallLogProps {
  leadId: string;
  leadName: string;
  currentStatus: string;
  isConverted: boolean;
  courseInterest: string | null;
  phone: string | null;
  email: string;
  followUpDate: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  userRole: string;
  employees: { id: string; name: string }[];
  category: string | null;
}

export default function LeadActionsWithCallLog({
  leadId,
  leadName,
  currentStatus,
  isConverted,
  courseInterest,
  phone,
  email,
  followUpDate,
  assignedToId,
  assignedToName,
  userRole,
  employees,
  category,
}: LeadActionsWithCallLogProps) {
  const [showCallLog, setShowCallLog] = useState(false);

  return (
    <>
      <LeadActions
        leadId={leadId}
        currentStatus={currentStatus}
        isConverted={isConverted}
        courseInterest={courseInterest}
        phone={phone}
        email={email}
        followUpDate={followUpDate}
        onLogCall={() => setShowCallLog(true)}
        assignedToId={assignedToId}
        assignedToName={assignedToName}
        userRole={userRole}
        employees={employees}
        category={category}
      />
      <CallLogModal
        leadId={leadId}
        leadName={leadName}
        currentStatus={currentStatus}
        isOpen={showCallLog}
        onClose={() => setShowCallLog(false)}
      />
    </>
  );
}
