import AppShell from "@/app/components/AppShell"
import ShareCardClient from "@/app/components/ShareCardClient"

export const metadata = {
  title: "Share | SESHN",
}

export default async function SharePage({ params }) {
  const { id } = await params

  return (
    <AppShell fullBleed>
      <ShareCardClient id={id} />
    </AppShell>
  )
}
