import { IconRail } from "@/components/shared/icon-rail";
import { Topbar } from "@/components/shared/topbar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-dvh w-full bg-bg-primary p-3">
      <div className="kf-shell-glow relative flex h-full w-full overflow-hidden rounded-3xl border border-border-default bg-bg-secondary">
        <IconRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
