import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";
import { AdminSidebar } from "@/components/AdminSidebar";
import { StickyHeader } from "@/components/StickyHeader";
// WorkTracker removed from layout — header handles timer, dashboard has its own check-in UI
import { WhatsAppTaskPopup } from "@/components/WhatsAppTaskPopup";
import { NewLeadPopup } from "@/components/NewLeadPopup";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-dark-primary theme-bg transition-colors duration-300">
        <AdminSidebar
          userName={userName}
          userRole={userRole}
          userImage={user.image || undefined}
        />
        <main className="flex-1 overflow-y-auto">
          <StickyHeader userRole={userRole} />
          <div className="px-6 lg:px-8 pb-6 lg:pb-8">
            <WhatsAppTaskPopup />
            {children}
          </div>
        </main>
        {userRole !== "HR_MANAGER" && <NewLeadPopup userRole={userRole} />}
        {/* Zadarma WebRTC Phone Widget */}
        <script src="https://my.zadarma.com/webphoneWebRTCWidget/v9/js/loader-phone-lib.js?sub_v=1" async />
        <script src="https://my.zadarma.com/webphoneWebRTCWidget/v9/js/loader-phone-fn.js?sub_v=1" async />
        <script
          dangerouslySetInnerHTML={{
            __html: `
if (window.addEventListener) {
  window.addEventListener('load', function() {
    fetch('/api/admin/zadarma-webrtc')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.key) {
          zadarmaWidgetFn(
            data.key,
            data.sip || '',
            'square',
            'en',
            true,
            {right:'10px',bottom:'5px'}
          );
        }
      })
      .catch(function(e) { console.log('Zadarma widget init skipped:', e); });
  }, false);
}
`,
          }}
        />
      </div>
    </ThemeProvider>
  );
}
