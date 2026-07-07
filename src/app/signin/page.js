import AppShell from "@/app/components/AppShell"
import SignInClient from "@/app/components/SignInClient"

export const metadata = {
  title: "Sign in | SESHN",
}

export default function SignInPage() {
  return (
    <AppShell title="sign in" eyebrow="profile setup" showNav={false}>
      <SignInClient />
    </AppShell>
  )
}
