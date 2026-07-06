import AppShell from "@/app/components/AppShell"
import SessionWorkspace from "@/app/components/SessionWorkspace"

export const metadata = {
  title: "New session | SESHN",
}

export default function NewSessionPage() {
  return (
    <AppShell title="new study session" eyebrow="track focus">
      <SessionWorkspace />
    </AppShell>
  )
}
