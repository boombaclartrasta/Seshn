const PROFILE_KEY = "seshn.profile"
const SESSIONS_KEY = "seshn.sessions"

const isBrowser = () => typeof window !== "undefined"

function readJson(key, fallback) {
  if (!isBrowser()) {
    return fallback
  }

  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function createId() {
  if (isBrowser() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `session-${Date.now()}`
}

export function getProfile() {
  return readJson(PROFILE_KEY, null)
}

export function saveProfile(profile) {
  writeJson(PROFILE_KEY, {
    ...profile,
    updatedAt: new Date().toISOString(),
  })
}

export function getSessions() {
  return readJson(SESSIONS_KEY, []).sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
  )
}

export function getSession(id) {
  return getSessions().find((session) => session.id === id) ?? null
}

export function saveSession(session) {
  const sessions = getSessions()
  const nextSession = {
    ...session,
    id: session.id ?? createId(),
    completedAt: session.completedAt ?? new Date().toISOString(),
  }

  writeJson(SESSIONS_KEY, [
    nextSession,
    ...sessions.filter((item) => item.id !== nextSession.id),
  ])

  return nextSession
}

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${Math.max(1, minutes)}m`
}

export function formatTrackedDuration(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  if (minutes > 0) {
    return `${minutes}m`
  }

  return `${seconds}s`
}

export function calculateFocusScore({ durationSeconds, faceUpSeconds, visibleSeconds }) {
  const duration = Math.max(1, Number(durationSeconds) || 1)
  const distractionSeconds = Math.max(
    Number(faceUpSeconds) || 0,
    Number(visibleSeconds) || 0
  )
  const distractionRatio = Math.min(1, distractionSeconds / duration)

  return Math.max(0, Math.round(100 - distractionRatio * 100))
}

export function calculateStats(sessions) {
  const totalSeconds = sessions.reduce(
    (sum, session) => sum + (Number(session.durationSeconds) || 0),
    0
  )
  const focusAverage =
    sessions.length === 0
      ? 0
      : Math.round(
          sessions.reduce((sum, session) => sum + Number(session.focus || 0), 0) /
            sessions.length
        )

  return {
    sessions: sessions.length,
    totalSeconds,
    focusAverage,
    streak: calculateStreak(sessions),
  }
}

function calculateStreak(sessions) {
  const studiedDates = new Set(
    sessions.map((session) => session.completedAt?.slice(0, 10)).filter(Boolean)
  )
  let streak = 0
  const cursor = new Date()

  while (studiedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
