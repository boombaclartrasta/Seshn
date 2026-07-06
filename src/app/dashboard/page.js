import AppShell from "@/app/components/AppShell"
import DashboardClient from "@/app/components/DashboardClient"

export const metadata = {
  title: "Dashboard | SESHN",
}

export default function DashboardPage() {
  return (
    <AppShell title="dashboard" eyebrow="study tracking">
      <DashboardClient />
    </AppShell>
  )
}
