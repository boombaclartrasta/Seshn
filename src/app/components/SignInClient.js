"use client"

import { useEffect, useState } from "react"
import { getProfile, saveProfile } from "@/lib/seshnStore"

const SUGGESTED_SUBJECTS = [
  "Mathematics",
  "English",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
]

export default function SignInClient() {
  const [step, setStep] = useState("profile")
  const [existingProfile, setExistingProfile] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subjectInput, setSubjectInput] = useState("")
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const profile = getProfile()

      if (profile) {
        setExistingProfile(profile)
        setName(profile.name ?? "")
        setEmail(profile.email ?? "")
        setSubjects(Array.isArray(profile.subjects) ? profile.subjects : [])
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  function continueToSubjects(event) {
    event.preventDefault()

    if (!email.trim()) {
      return
    }

    setStep("subjects")
  }

  function addSubject(value = subjectInput) {
    const nextSubject = value.trim()

    if (!nextSubject) {
      return
    }

    setSubjects((currentSubjects) => {
      if (
        currentSubjects.some(
          (subject) => subject.toLowerCase() === nextSubject.toLowerCase()
        )
      ) {
        return currentSubjects
      }

      return [...currentSubjects, nextSubject]
    })
    setSubjectInput("")
  }

  function removeSubject(subjectToRemove) {
    setSubjects((currentSubjects) =>
      currentSubjects.filter((subject) => subject !== subjectToRemove)
    )
  }

  function completeSetup(event) {
    event.preventDefault()

    const nextSubject = subjectInput.trim()
    const nextSubjects =
      nextSubject &&
      !subjects.some(
        (subject) => subject.toLowerCase() === nextSubject.toLowerCase()
      )
        ? [...subjects, nextSubject]
        : subjects

    if (!email.trim() || nextSubjects.length === 0) {
      return
    }

    saveProfile({
      ...existingProfile,
      name: name.trim() || "Study athlete",
      email: email.trim(),
      subjects: nextSubjects,
      createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
    })
    window.location.assign("/dashboard")
  }

  if (step === "subjects") {
    const remainingSuggestions = SUGGESTED_SUBJECTS.filter(
      (subject) =>
        !subjects.some(
          (selectedSubject) =>
            selectedSubject.toLowerCase() === subject.toLowerCase()
        )
    )

    return (
      <form
        onSubmit={completeSetup}
        className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:max-w-xl sm:p-5"
      >
        <div>
          <p className="text-sm text-white/46">studying as</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {name.trim() || "Study athlete"}
          </p>
        </div>

        <label className="grid gap-2 text-sm text-white/64">
          subjects
          <div className="flex gap-2 rounded-md border border-white/10 bg-black/24 p-2 focus-within:border-white/32">
            <input
              value={subjectInput}
              onChange={(event) => setSubjectInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  addSubject()
                }
              }}
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-white outline-none placeholder:text-white/24"
              placeholder="Add a subject"
            />
            <button
              type="button"
              onClick={() => addSubject()}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#101010]"
            >
              add
            </button>
          </div>
        </label>

        {subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => removeSubject(subject)}
                className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-sm text-white/76"
                aria-label={`remove ${subject}`}
              >
                {subject}
              </button>
            ))}
          </div>
        ) : null}

        {remainingSuggestions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {remainingSuggestions.slice(0, 4).map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => addSubject(subject)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/48 hover:bg-white/8 hover:text-white"
              >
                {subject}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
          <button
            type="button"
            onClick={() => setStep("profile")}
            className="rounded-md border border-white/12 px-4 py-3 text-sm font-medium text-white/72"
          >
            back
          </button>
          <button
            type="submit"
            disabled={subjects.length === 0 && !subjectInput.trim()}
            className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#101010] disabled:cursor-not-allowed disabled:opacity-40"
          >
            enter dashboard
          </button>
        </div>
      </form>
    )
  }

  return (
    <form
      onSubmit={continueToSubjects}
      className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:max-w-md sm:p-5"
    >
      <label className="grid gap-2 text-sm text-white/64">
        name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-md border border-white/10 bg-black/24 px-3 py-3 text-base text-white outline-none placeholder:text-white/24 focus:border-white/32"
          placeholder="Alex"
        />
      </label>
      <label className="grid gap-2 text-sm text-white/64">
        email
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-md border border-white/10 bg-black/24 px-3 py-3 text-base text-white outline-none placeholder:text-white/24 focus:border-white/32"
          placeholder="you@example.com"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#101010]"
      >
        continue
      </button>
    </form>
  )
}
