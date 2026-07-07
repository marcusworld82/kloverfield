import { TopNav } from "@/components/shared/topnav";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-dvh flex-col bg-bg-primary">
      <TopNav />
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
