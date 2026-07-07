"use client"

import { useEffect, useMemo, useState } from "react"
import {
  calculateFocusScore,
  formatDuration,
  formatTrackedDuration,
  getProfile,
  saveSession,
} from "@/lib/seshnStore"

export default function SessionWorkspace() {
  const [stage, setStage] = useState("setup")
  const [targetMinutes, setTargetMinutes] = useState(45)
  const [targetFocus, setTargetFocus] = useState(85)
  const [seconds, setSeconds] = useState(0)
  const [faceUpSeconds, setFaceUpSeconds] = useState(0)
  const [visibleSeconds, setVisibleSeconds] = useState(0)
  const [isFaceUp, setIsFaceUp] = useState(false)
  const [focusTrackingEnabled, setFocusTrackingEnabled] = useState(false)
  const [focusTrackingSource, setFocusTrackingSource] = useState("disabled")
  const [orientationStatus, setOrientationStatus] = useState("disabled")
  const [startedAt, setStartedAt] = useState(null)
  const [endedAt, setEndedAt] = useState(null)
  const [title, setTitle] = useState("focused study")
  const [subject, setSubject] = useState("Mathematics")
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState("integration by parts")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const profileSubjects = getProfile()?.subjects
      const nextSubjects = Array.isArray(profileSubjects) ? profileSubjects : []

      setSubjects(nextSubjects)

      if (nextSubjects[0]) {
        setSubject(nextSubjects[0])
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (stage !== "recording") {
      return undefined
    }

    const timer = window.setInterval(() => {
      setSeconds((currentSeconds) => currentSeconds + 1)

      if (!focusTrackingEnabled) {
        return
      }

      setFaceUpSeconds((currentSeconds) =>
        focusTrackingSource === "orientation" && isFaceUp
          ? currentSeconds + 1
          : currentSeconds
      )
      setVisibleSeconds((currentSeconds) =>
        focusTrackingSource === "visibility" &&
        document.visibilityState === "visible"
          ? currentSeconds + 1
          : currentSeconds
      )
    }, 1000)

    return () => window.clearInterval(timer)
  }, [focusTrackingEnabled, focusTrackingSource, isFaceUp, stage])

  useEffect(() => {
    if (stage !== "recording" || focusTrackingSource !== "orientation") {
      return undefined
    }

    const handleOrientation = (event) => {
      const beta = Number(event.beta)
      const gamma = Number(event.gamma)

      if (Number.isNaN(beta) || Number.isNaN(gamma)) {
        return
      }

      setIsFaceUp(Math.abs(beta) < 35 && Math.abs(gamma) < 35)
      setOrientationStatus("tracking orientation")
    }

    window.addEventListener("deviceorientation", handleOrientation)

    return () => window.removeEventListener("deviceorientation", handleOrientation)
  }, [focusTrackingSource, stage])

  const topicList = useMemo(
    () =>
      topics
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
    [topics]
  )

  const targetSeconds = targetMinutes * 60
  const trackedFocus = calculateFocusScore({
    durationSeconds: Math.max(seconds, 1),
    faceUpSeconds,
    visibleSeconds,
  })
  const focus = focusTrackingEnabled ? trackedFocus : targetFocus
  const progress = Math.min(100, Math.round((seconds / targetSeconds) * 100))
  const targetReached = seconds >= targetSeconds

  async function requestOrientationAccess() {
    if (focusTrackingEnabled) {
      setFocusTrackingEnabled(false)
      setFocusTrackingSource("disabled")
      setOrientationStatus("disabled")
      return
    }

    const orientationEvent = window.DeviceOrientationEvent

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setFocusTrackingEnabled(false)
      setFocusTrackingSource("disabled")
      setOrientationStatus("disabled: sensors need HTTPS on phone browsers")
      return
    }

    if (orientationEvent?.requestPermission) {
      try {
        const result = await orientationEvent.requestPermission()
        if (result === "granted") {
          setFocusTrackingEnabled(true)
          setFocusTrackingSource("orientation")
          setOrientationStatus("orientation enabled")
        } else {
          setFocusTrackingEnabled(false)
          setFocusTrackingSource("disabled")
          setOrientationStatus("permission denied")
        }
      } catch {
        setFocusTrackingEnabled(false)
        setFocusTrackingSource("disabled")
        setOrientationStatus("permission denied")
      }
      return
    }

    if ("DeviceOrientationEvent" in window) {
      setFocusTrackingEnabled(true)
      setFocusTrackingSource("orientation")
      setOrientationStatus("orientation enabled")
      return
    }

    setFocusTrackingEnabled(true)
    setFocusTrackingSource("visibility")
    setOrientationStatus("using app visibility fallback")
  }

  function beginSession() {
    const nextTargetMinutes = clampNumber(targetMinutes, 1, 240)
    const nextTargetFocus = clampNumber(targetFocus, 1, 100)

    setTargetMinutes(nextTargetMinutes)
    setTargetFocus(nextTargetFocus)
    setSeconds(0)
    setFaceUpSeconds(0)
    setVisibleSeconds(0)
    setStartedAt(new Date().toISOString())
    setEndedAt(null)
    setStage("recording")
  }

  function endSession() {
    setEndedAt(new Date().toISOString())
    setStage("details")
  }

  function handleSubmit(event) {
    event.preventDefault()

    const saved = saveSession({
      title: title.trim() || "study session",
      subject: subject.trim() || "General",
      topics: topicList.length > 0 ? topicList : ["focused work"],
      notes: notes.trim(),
      focus,
      focusTrackingEnabled,
      focusTrackingSource,
      focusTrackingStatus: orientationStatus,
      targetFocus,
      targetDurationSeconds: targetSeconds,
      durationSeconds: Math.max(seconds, 60),
      faceUpSeconds,
      visibleSeconds,
      startedAt,
      endedAt: endedAt ?? new Date().toISOString(),
    })

    window.location.assign(`/share/${saved.id}`)
  }

  if (stage === "setup") {
    return (
      <section
        className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:max-w-xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="target length"
            value={targetMinutes}
            min={1}
            max={240}
            suffix="minutes"
            onChange={setTargetMinutes}
          />
          <NumberField
            label="target focus"
            value={targetFocus}
            min={1}
            max={100}
            suffix="%"
            onChange={setTargetFocus}
          />
        </div>
        <div className="rounded-md border border-white/10 bg-black/18 p-3 text-sm text-white/56">
          <p>
            Focus tracking:{" "}
            <span className="text-white/76">
              {focusTrackingEnabled ? orientationStatus : "off"}
            </span>
          </p>
          <p className="mt-1">
            When off, the saved focus score uses your target focus. Phone browser
            motion sensors usually require HTTPS, so local network testing may
            keep this disabled.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={requestOrientationAccess}
            className="rounded-md border border-white/12 px-4 py-3 text-sm font-medium text-white/72"
          >
            {focusTrackingEnabled ? "disable focus tracking" : "enable focus tracking"}
          </button>
          <button
            type="button"
            onClick={beginSession}
            className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#101010]"
          >
            begin session
          </button>
        </div>
      </section>
    )
  }

  if (stage === "recording") {
    return (
      <section className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:max-w-2xl">
        <div>
          <p className="text-sm text-white/44">recording session</p>
          <p className="mt-4 text-6xl font-semibold tracking-tight">
            {formatClock(seconds)}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Metric label="target" value={formatDuration(targetSeconds)} />
          <Metric
            label="focus"
            value={focusTrackingEnabled ? `${focus}%` : `${targetFocus}%`}
          />
          <Metric
            label={focusTrackingSource === "visibility" ? "app active" : "face up"}
            value={
              focusTrackingEnabled
                ? formatTrackedDuration(
                    focusTrackingSource === "visibility"
                      ? visibleSeconds
                      : faceUpSeconds
                  )
                : "off"
            }
          />
          <Metric label="goal" value={targetReached ? "met" : "open"} />
        </div>
        <button
          type="button"
          onClick={endSession}
          className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#101010]"
        >
          end session
        </button>
      </section>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="grid content-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <Metric label="duration" value={formatDuration(Math.max(seconds, 60))} />
        <Metric label="target length" value={formatDuration(targetSeconds)} />
        <Metric
          label="focus score"
          value={focusTrackingEnabled ? `${focus}%` : `${targetFocus}%`}
        />
        <Metric label="target focus" value={`${targetFocus}%`} />
        <Metric
          label="tracking"
          value={focusTrackingEnabled ? focusTrackingSource : "off"}
        />
      </section>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="session title" value={title} onChange={setTitle} />
          <SubjectField
            subjects={subjects}
            value={subject}
            onChange={setSubject}
          />
        </div>
        <TextField
          label="topics"
          value={topics}
          onChange={setTopics}
          hint="Separate multiple topics with commas."
        />
        <label className="grid gap-2 text-sm text-white/64">
          notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            className="resize-none rounded-md border border-white/10 bg-black/24 px-3 py-3 text-base text-white outline-none placeholder:text-white/24 focus:border-white/32"
            placeholder="What worked, what broke focus, and what to do next."
          />
        </label>
        <button className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#101010]">
          save details
        </button>
      </form>
    </div>
  )
}

function NumberField({ label, value, onChange, min, max, suffix }) {
  return (
    <label className="grid gap-2 text-sm text-white/64">
      {label}
      <div className="flex items-center rounded-md border border-white/10 bg-black/24 focus-within:border-white/32">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-white outline-none"
        />
        <span className="px-3 text-sm text-white/36">{suffix}</span>
      </div>
    </label>
  )
}

function clampNumber(value, min, max) {
  const number = Number(value)

  if (Number.isNaN(number)) {
    return min
  }

  return Math.min(max, Math.max(min, number))
}

function TextField({ label, value, onChange, hint }) {
  return (
    <label className="grid gap-2 text-sm text-white/64">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-white/10 bg-black/24 px-3 py-3 text-base text-white outline-none placeholder:text-white/24 focus:border-white/32"
      />
      {hint ? <span className="text-xs text-white/36">{hint}</span> : null}
    </label>
  )
}

function SubjectField({ subjects, value, onChange }) {
  if (subjects.length === 0) {
    return <TextField label="subject" value={value} onChange={onChange} />
  }

  return (
    <label className="grid gap-2 text-sm text-white/64">
      subject
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-white/10 bg-black/24 px-3 py-3 text-base text-white outline-none focus:border-white/32"
      >
        {subjects.map((subject) => (
          <option key={subject} value={subject} className="bg-[#101010]">
            {subject}
          </option>
        ))}
      </select>
    </label>
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

function formatClock(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":")
}
