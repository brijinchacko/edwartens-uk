import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user as { role: string }).role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // All count queries in parallel
    const [
      users,
      leads,
      students,
      employees,
      batches,
      documents,
      invoices,
      notifications,
      workSessions,
      activities,
      leadNotes,
      auditLogs,
      kpiRecords,
      stickyNotes,
      salesTargets,
      activeWorkSessions,
      recentAudit,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.student.count(),
      prisma.employee.count(),
      prisma.batch.count(),
      prisma.document.count(),
      prisma.invoice.count(),
      prisma.notification.count(),
      prisma.employeeWorkSession.count(),
      prisma.employeeActivity.count(),
      prisma.leadNote.count(),
      prisma.auditLog.count(),
      prisma.employeeKPI.count(),
      prisma.stickyNote.count(),
      prisma.salesTarget.count(),
      prisma.employeeWorkSession.count({
        where: { status: "CHECKED_IN" },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Format uptime
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime =
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const serverTime = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Approximate DB size from row counts
    const totalRows =
      users +
      leads +
      students +
      employees +
      batches +
      documents +
      invoices +
      notifications +
      workSessions +
      activities +
      leadNotes +
      auditLogs +
      kpiRecords +
      stickyNotes +
      salesTargets;

    return NextResponse.json({
      stats: {
        users,
        leads,
        students,
        employees,
        activeWorkSessions,
        uptime,
        serverTime,
        totalRows,
      },
      tables: [
        { name: "Lead", count: leads },
        { name: "Student", count: students },
        { name: "User", count: users },
        { name: "Employee", count: employees },
        { name: "Batch", count: batches },
        { name: "Document", count: documents },
        { name: "Invoice", count: invoices },
        { name: "Notification", count: notifications },
        { name: "Work Session", count: workSessions },
        { name: "Activity", count: activities },
        { name: "Lead Note", count: leadNotes },
        { name: "Audit Log", count: auditLogs },
        { name: "KPI Record", count: kpiRecords },
        { name: "Sticky Note", count: stickyNotes },
        { name: "Sales Target", count: salesTargets },
      ],
      recentAudit: recentAudit.map((log) => ({
        id: log.id,
        userName: log.userName,
        action: log.action,
        entity: log.entity,
        entityName: log.entityName,
        details: log.details
          ? log.details.length > 120
            ? log.details.slice(0, 120) + "..."
            : log.details
          : null,
        createdAt: log.createdAt.toISOString(),
      })),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(
            process.memoryUsage().heapUsed / 1024 / 1024
          ),
          heapTotal: Math.round(
            process.memoryUsage().heapTotal / 1024 / 1024
          ),
        },
        uptimeSeconds: Math.round(uptimeSeconds),
        pid: process.pid,
      },
    });
  } catch (error) {
    console.error("Monitoring API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
