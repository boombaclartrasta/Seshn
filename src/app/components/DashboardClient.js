"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  calculateStats,
  formatDuration,
  getProfile,
  getSessions,
} from "@/lib/seshnStore"

export default function DashboardClient() {
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProfile(getProfile())
      setSessions(getSessions())
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  const stats = calculateStats(sessions)
  const latestSession = sessions[0]

  return (
    <div className="grid gap-5">
      {!profile ? (
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/62">
            Create a local profile to prototype the app flow on this device.
          </p>
          <Link
            href="/signin"
            className="w-fit rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
          >
            sign in
          </Link>
        </div>
      ) : (
        <p className="text-sm text-white/52">
          signed in locally as <span className="text-white">{profile.email}</span>
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="sessions" value={stats.sessions} />
        <StatCard label="time studied" value={formatDuration(stats.totalSeconds)} />
        <StatCard label="avg focus" value={`${stats.focusAverage}%`} />
        <StatCard label="streak" value={`${stats.streak} days`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-white/10 bg-white/[0.04]">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h2 className="text-lg font-semibold">recent sessions</h2>
            <Link href="/sessions/new" className="text-sm text-white/62 hover:text-white">
              add session
            </Link>
          </div>
          {sessions.length > 0 ? (
            <div className="divide-y divide-white/8">
              {sessions.slice(0, 6).map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="grid gap-2 p-4 hover:bg-white/[0.03] sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="mt-1 text-sm text-white/44">
                      {session.subject} / {(session.topics ?? []).join(", ")}
                    </p>
                  </div>
                  <div className="text-sm text-white/52 sm:text-right">
                    <p>{formatDuration(session.durationSeconds)}</p>
                    <p>{session.focus}% focus</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 p-4 text-sm text-white/52">
              <p>No sessions yet. Start with one complete study session.</p>
              <Link
                href="/sessions/new"
                className="w-fit rounded-md bg-white px-4 py-2 font-semibold text-[#101010]"
              >
                start a session
              </Link>
            </div>
          )}
        </section>

        <aside className="rounded-lg border border-white/10 bg-[#171717] p-4">
          <h2 className="text-lg font-semibold">share photo</h2>
          {latestSession ? (
            <div className="mt-4 grid gap-3">
              <p className="text-sm text-white/52">
                Add a photo and apply a share design to your latest session.
              </p>
              <Link
                href={`/share/${latestSession.id}`}
                className="rounded-md border border-white/12 px-4 py-3 text-center text-sm font-medium hover:bg-white/8"
              >
                create share photo
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/44">
              Complete a session and this panel will link to its share studio.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/36">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}
