import AppShell from "@/app/components/AppShell"
import SessionDetailClient from "@/app/components/SessionDetailClient"

export const metadata = {
  title: "Session | SESHN",
}

export default async function SessionPage({ params }) {
  const { id } = await params

  return (
    <AppShell title="session detail" eyebrow="review">
      <SessionDetailClient id={id} />
    </AppShell>
  )
}
