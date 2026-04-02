"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface Booking {
  id: string;
  status: string;
  invitedAt: string;
  respondedAt: string | null;
  cancelReason: string | null;
  practicalSession: {
    id: string;
    title: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    location: string;
    capacity: number;
    bookingDeadline: string | null;
    trainer: {
      user: { name: string };
    } | null;
    batch: {
      id: string;
      name: string;
    };
  };
}

const STATUS_STYLES: Record<string, string> = {
  INVITED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  ACCEPTED: "bg-green-500/10 text-green-400 border-green-500/20",
  DECLINED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  ATTENDED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
};

export default function StudentPracticalPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/student/practical-booking");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRespond = async (bookingId: string, action: "accept" | "decline", reason?: string) => {
    setResponding(bookingId);
    try {
      const res = await fetch("/api/student/practical-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action, reason }),
      });

      if (res.ok) {
        setShowDeclineModal(null);
        setDeclineReason("");
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to respond");
      }
    } catch {
      alert("Failed to respond to invitation");
    } finally {
      setResponding(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "INVITED");
  const otherBookings = bookings.filter((b) => b.status !== "INVITED");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-neon-blue" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Practical Sessions</h1>
        <p className="text-sm text-text-muted mt-1">
          View and respond to practical session invitations
        </p>
      </div>

      {/* Pending Invitations */}
      {pendingBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
            <AlertTriangle size={14} />
            Pending Invitations ({pendingBookings.length})
          </h2>

          {pendingBookings.map((booking) => {
            const ps = booking.practicalSession;
            const deadlinePassed = ps.bookingDeadline && new Date(ps.bookingDeadline) < new Date();

            return (
              <div
                key={booking.id}
                className="glass-card overflow-hidden border-l-4 border-l-yellow-500"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{ps.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{ps.batch.name}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Calendar size={14} className="text-neon-blue shrink-0" />
                      <span>
                        {new Date(ps.date).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Europe/London",
                        })}
                      </span>
                    </div>
                    {(ps.startTime || ps.endTime) && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Clock size={14} className="text-neon-blue shrink-0" />
                        <span>{ps.startTime || "-"} - {ps.endTime || "-"}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin size={14} className="text-neon-blue shrink-0" />
                      <span>{ps.location}</span>
                    </div>
                    {ps.trainer && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <User size={14} className="text-neon-blue shrink-0" />
                        <span>{ps.trainer.user.name}</span>
                      </div>
                    )}
                  </div>

                  {ps.bookingDeadline && (
                    <div className={`text-xs ${deadlinePassed ? "text-red-400" : "text-yellow-400"} flex items-center gap-1`}>
                      <Clock size={12} />
                      Booking deadline:{" "}
                      {new Date(ps.bookingDeadline).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Europe/London",
                      })}
                      {deadlinePassed && " (EXPIRED)"}
                    </div>
                  )}

                  {/* Warning */}
                  <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-xs text-text-secondary">
                    <strong className="text-yellow-400">Important:</strong> Once booked, cancellation will mean no future free sessions will be offered. Please only accept if you are certain you can attend.
                  </div>

                  {/* Action Buttons */}
                  {!deadlinePassed && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRespond(booking.id, "accept")}
                        disabled={responding === booking.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {responding === booking.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Accept Invitation
                      </button>
                      <button
                        onClick={() => setShowDeclineModal(booking.id)}
                        disabled={responding === booking.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Other Bookings */}
      {otherBookings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Your Bookings</h2>
          {otherBookings.map((booking) => {
            const ps = booking.practicalSession;
            return (
              <div key={booking.id} className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{ps.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(ps.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {(ps.startTime || ps.endTime) && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {ps.startTime || "-"} - {ps.endTime || "-"}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {ps.location}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLES[booking.status] || STATUS_STYLES.INVITED}`}>
                    {booking.status}
                  </span>
                </div>

                {booking.status === "ACCEPTED" && (
                  <div className="mt-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10 space-y-2">
                    <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                      <CheckCircle size={12} /> Booking Confirmed
                    </p>
                    <p className="text-xs text-text-muted">
                      Venue: {ps.location}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(ps.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neon-blue hover:underline"
                    >
                      <ExternalLink size={10} /> View on Google Maps
                    </a>
                  </div>
                )}

                {booking.cancelReason && (
                  <p className="mt-2 text-xs text-text-muted">
                    Reason: {booking.cancelReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {bookings.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Calendar size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">No practical session invitations yet.</p>
          <p className="text-xs text-text-muted mt-1">
            When your batch schedules a practical session, you will see the invitation here.
          </p>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Decline Invitation</h3>
            <p className="text-sm text-text-secondary">
              Are you sure you want to decline? Please provide a reason (optional).
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/30"
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeclineModal(null);
                  setDeclineReason("");
                }}
                className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleRespond(showDeclineModal, "decline", declineReason)
                }
                disabled={responding === showDeclineModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {responding === showDeclineModal ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
