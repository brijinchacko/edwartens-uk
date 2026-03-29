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
