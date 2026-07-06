"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  formatDuration,
  formatTrackedDuration,
  getSession,
} from "@/lib/seshnStore"

export default function SessionDetailClient({ id }) {
  const [session, setSession] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSession(getSession(id))
      setLoaded(true)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [id])

  if (!loaded) {
    return <p className="text-sm text-white/44">loading session...</p>
  }

  if (!session) {
    return (
      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-white/62">This session only exists on the device where it was created.</p>
        <Link href="/sessions/new" className="w-fit rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#101010]">
          create session
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-white/44">{session.subject}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{session.title}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="duration" value={formatDuration(session.durationSeconds)} />
          <Metric label="focus" value={`${session.focus}%`} />
          <Metric label="target focus" value={`${session.targetFocus ?? "-"}%`} />
          <Metric
            label="target length"
            value={formatDuration(session.targetDurationSeconds)}
          />
          <Metric
            label="face-up time"
            value={formatTrackedDuration(session.faceUpSeconds)}
          />
          <Metric
            label="tracking"
            value={
              session.focusTrackingEnabled
                ? session.focusTrackingSource ?? "on"
                : "off"
            }
          />
          <Metric label="topics" value={session.topics?.length ?? 0} />
        </div>
        {session.notes ? (
          <div className="mt-5 rounded-md border border-white/10 bg-black/18 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/36">
              notes
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/70">
              {session.notes}
            </p>
          </div>
        ) : null}
      </section>

      <aside className="grid content-start gap-3 rounded-lg border border-white/10 bg-[#171717] p-4">
        <Link
          href={`/share/${session.id}`}
          className="rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-[#101010]"
        >
          create share photo
        </Link>
        <Link
          href="/sessions/new"
          className="rounded-md border border-white/12 px-4 py-3 text-center text-sm font-medium text-white/72"
        >
          start another
        </Link>
      </aside>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/18 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/36">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  )
}
