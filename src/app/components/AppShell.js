import Link from "next/link"

export default function AppShell({ children, title, eyebrow }) {
  return (
    <main className="min-h-screen bg-[#101010] text-[#f4f4f0]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.22em]">
            SESHN
          </Link>
          <nav className="flex items-center gap-2 text-sm text-white/62">
            <Link
              href="/dashboard"
              className="rounded-full px-3 py-2 hover:bg-white/8 hover:text-white"
            >
              dashboard
            </Link>
            <Link
              href="/sessions/new"
              className="rounded-full bg-white px-3 py-2 font-medium text-[#101010]"
            >
              new session
            </Link>
          </nav>
        </header>

        <section className="grid gap-5 py-6 sm:py-8">
          <div>
            {eyebrow ? (
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/36">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
          </div>
          {children}
        </section>
      </div>
    </main>
  )
}
