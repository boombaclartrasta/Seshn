"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  calculateStats,
  formatDuration,
  getProfile,
  getSessions,
} from "@/lib/seshnStore"

export default function DashboardClient() {
  const heroRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [overviewVisible, setOverviewVisible] = useState(false)
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextProfile = getProfile()

      if (!nextProfile) {
        window.location.replace("/signin")
        return
      }

      setProfile(nextProfile)
      setSessions(getSessions())
      setLoaded(true)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!loaded) {
      return undefined
    }

    let frame = null

    const updateOverviewVisibility = () => {
      if (frame !== null) {
        return
      }

      frame = window.requestAnimationFrame(() => {
        frame = null

        const heroHeight = heroRef.current?.offsetHeight ?? window.innerHeight
        const resetPoint = heroHeight * 0.28
        const revealPoint = heroHeight * 0.62
        const scrollY = window.scrollY

        setOverviewVisible((currentVisibility) => {
          if (scrollY <= resetPoint) {
            return false
          }

          if (scrollY >= revealPoint) {
            return true
          }

          return currentVisibility
        })
      })
    }

    updateOverviewVisibility()
    window.addEventListener("scroll", updateOverviewVisibility, { passive: true })
    window.addEventListener("resize", updateOverviewVisibility)

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
      }

      window.removeEventListener("scroll", updateOverviewVisibility)
      window.removeEventListener("resize", updateOverviewVisibility)
    }
  }, [loaded])

  if (!loaded || !profile) {
    return <p className="text-sm text-white/44">loading dashboard...</p>
  }

  const stats = calculateStats(sessions)
  const latestSession = sessions[0]
  const displayName = profile.name || "Study athlete"
  const [greetingLead, greetingTime] = getGreetingParts()

  return (
    <div className="-mx-4 -my-4 grid gap-0 bg-[#222222] sm:-mx-6 lg:-mx-8">
      <section
        ref={heroRef}
        className="grid min-h-svh content-between gap-8 bg-[linear-gradient(180deg,#111111_0%,#111111_42%,#181818_72%,#222222_100%)] px-4 pb-5 pt-16 sm:px-6 lg:px-8"
      >
        <div className="grid gap-0">
          <p className="text-[5rem] leading-[0.92] text-white/16 sm:text-[8rem]">
            {greetingLead}
          </p>
          <p className="text-[5rem] leading-[0.92] text-white/16 sm:text-[8rem]">
            {greetingTime}
          </p>
          <h1 className="mt-8 max-w-full break-words text-[4rem] font-semibold uppercase leading-[0.9] tracking-normal text-white sm:text-[7rem]">
            {displayName}
          </h1>
        </div>

        <a
          href="#dashboard-overview"
          className="mx-auto grid h-10 w-10 place-items-center"
          aria-label="scroll to dashboard stats"
        >
          <span className="h-4 w-4 rotate-45 border-b border-r border-white/72" />
        </a>
      </section>

      <section
        id="dashboard-overview"
        className={`grid scroll-mt-6 gap-5 px-4 pb-12 pt-6 transition duration-700 ease-out sm:px-6 lg:px-8 ${
          overviewVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="sessions" value={stats.sessions} />
          <StatCard label="time studied" value={formatStatDuration(stats.totalSeconds)} />
          <StatCard label="avg focus" value={`${stats.focusAverage}%`} />
          <StatCard label="streak" value={`${stats.streak} days`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-sm text-white/44">next session</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  start studying
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/52">
                  Begin a timed session, then add details and create a share card
                  after you finish.
                </p>
              </div>
              <Link
                href="/sessions/new"
                className="rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-[#101010]"
              >
                start new session
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#171717] p-4 sm:p-5">
            <p className="text-sm text-white/44">previous session</p>
            {latestSession ? (
              <div className="mt-3 grid gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {latestSession.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/48">
                    {latestSession.subject}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric
                    label="duration"
                    value={formatDuration(latestSession.durationSeconds)}
                  />
                  <MiniMetric
                    label="focus"
                    value={`${latestSession.focus ?? 0}%`}
                  />
                  <MiniMetric
                    label="target"
                    value={`${latestSession.targetFocus ?? 0}%`}
                  />
                  <MiniMetric
                    label="date"
                    value={formatSessionDate(latestSession.completedAt)}
                  />
                </div>
                <div className="grid gap-2">
                  <Link
                    href={`/sessions/${latestSession.id}`}
                    className="rounded-md border border-white/12 px-4 py-3 text-center text-sm font-medium text-white/72 hover:bg-white/8"
                  >
                    view details
                  </Link>
                  <Link
                    href={`/share/${latestSession.id}`}
                    className="rounded-md border border-white/12 px-4 py-3 text-center text-sm font-medium text-white/72 hover:bg-white/8"
                  >
                    create share photo
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-white/44">
                Complete one session and its stats will appear here.
              </p>
            )}
          </section>
        </div>

        {sessions.length > 1 ? (
          <section className="rounded-lg border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 p-4">
              <h2 className="text-lg font-semibold">recent sessions</h2>
            </div>
            <div className="divide-y divide-white/8">
              {sessions.slice(1, 5).map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="grid gap-2 p-4 hover:bg-white/[0.03] sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="mt-1 text-sm text-white/44">
                      {session.subject}
                    </p>
                  </div>
                  <div className="text-sm text-white/52 sm:text-right">
                    <p>{formatDuration(session.durationSeconds)}</p>
                    <p>{session.focus ?? 0}% focus</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
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

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/18 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-white/36">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function getGreetingParts() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return ["Good", "Morning"]
  }

  if (hour < 17) {
    return ["Good", "Afternoon"]
  }

  return ["Good", "Evening"]
}

function formatStatDuration(totalSeconds) {
  if (!totalSeconds) {
    return "0m"
  }

  return formatDuration(totalSeconds)
}

function formatSessionDate(value) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}
