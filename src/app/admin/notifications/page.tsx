import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Bell, Mail, AlertTriangle, Info, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications | EDWartens Admin",
  description: "System notifications and email logs",
};

const TYPE_ICONS: Record<string, typeof Bell> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  email: Mail,
};

const TYPE_COLORS: Record<string, string> = {
  info: "text-neon-blue bg-neon-blue/10",
  warning: "text-yellow-400 bg-yellow-400/10",
  success: "text-green-400 bg-green-400/10",
  email: "text-purple bg-purple/10",
};

async function getNotifications() {
  try {
    return await prisma.notification.findMany({
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
        <p className="text-text-muted mt-1">
          System notifications and email logs
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: any) => {
            const IconComponent =
              TYPE_ICONS[notif.type] || Bell;
            const colorClass =
              TYPE_COLORS[notif.type] || "text-text-muted bg-white/[0.03]";

            return (
              <div
                key={notif.id}
                className={`glass-card p-4 flex items-start gap-3 ${notif.read ? "opacity-60" : ""}`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                  <IconComponent size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-text-primary">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-neon-blue shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-text-muted mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-text-muted">
                      To: {notif.user.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
