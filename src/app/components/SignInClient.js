"use client"

import { useState } from "react"
import { saveProfile } from "@/lib/seshnStore"

export default function SignInClient() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  function enterApp() {
    const nextEmail = email.trim()

    if (!nextEmail) {
      return
    }

    saveProfile({
      name: name.trim() || "Study athlete",
      email: nextEmail,
      createdAt: new Date().toISOString(),
    })
    window.location.assign("/dashboard")
  }

  return (
    <section
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
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              enterApp()
            }
          }}
          className="rounded-md border border-white/10 bg-black/24 px-3 py-3 text-base text-white outline-none placeholder:text-white/24 focus:border-white/32"
          placeholder="you@example.com"
        />
      </label>
      <button
        type="button"
        onClick={enterApp}
        className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#101010]"
      >
        enter app
      </button>
    </section>
  )
}
