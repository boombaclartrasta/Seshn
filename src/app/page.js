"use client"

import { DM_Serif_Display } from "next/font/google"
import { useEffect, useRef, useState } from "react"

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
})

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#111111] text-[#F0F0F0] font-sans">
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-[#444444] text-xs tracking-widest uppercase mb-4">
          coming soon
        </p>
        <h1 className="text-5xl font-medium mb-4">
          study like an athlete
        </h1>
        <p className="text-[#888888] text-sm max-w-sm mb-8 leading-relaxed">
          track your sessions. measure your focus. share your progress.
        </p>

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="bg-[#161616] border border-[#2A2A2A] text-[#F0F0F0] text-sm px-4 py-3 rounded-full outline-none placeholder-[#444444] w-64"
          />
          <button className="bg-[#F0F0F0] text-[#111111] text-sm font-medium px-5 py-3 rounded-full">
            join waitlist
          </button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[2200px] px-6 pb-20 md:px-10 lg:px-14 2xl:px-20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      <section className="mx-auto w-full max-w-[2200px] px-4 pb-20 sm:px-6 md:px-10 lg:px-14 2xl:px-20">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,460px)_minmax(0,0.95fr)] xl:gap-x-10 2xl:gap-x-14">
          <div className="flex flex-col items-stretch gap-6 sm:gap-8">
            <Reveal delay={0}>
              <TemplateShareCard />
            </Reveal>
            <Reveal delay={120}>
              <CardPlaceholder />
            </Reveal>
          </div>

          <Reveal delay={240}>
            <div className="flex min-h-[620px] items-center justify-center rounded-[36px] border border-white/10 bg-white/5 px-5 py-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:px-8 sm:py-10 lg:min-h-[760px] 2xl:min-h-[820px]">
              <div className="h-full w-full rounded-[28px] border border-dashed border-white/16 bg-black/15" />
            </div>
          </Reveal>

          <div className="flex flex-col items-stretch gap-6 sm:gap-8">
            <Reveal delay={360}>
              <CardPlaceholder />
            </Reveal>
            <Reveal delay={480}>
              <CardPlaceholder />
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [status, setStatus] = useState("hidden")
  const scrollDirection = useRef("down")

  useEffect(() => {
    let previousScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      scrollDirection.current = currentScrollY > previousScrollY ? "down" : "up"
      previousScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    const element = ref.current

    if (!element) {
      return () => window.removeEventListener("scroll", handleScroll)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatus((currentStatus) =>
            currentStatus === "visible" ? currentStatus : "entering"
          )
        } else {
          setStatus(scrollDirection.current === "up" ? "exiting-down" : "exiting-up")
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const animationClass =
    status === "entering"
      ? "animate-reveal-enter"
      : status === "exiting-down"
        ? "animate-reveal-exit-down"
        : status === "exiting-up"
          ? "animate-reveal-exit-up"
          : ""

  const restingStyle =
    status === "hidden"
      ? {
          opacity: 0,
          transform: "translateY(56px) scale(0.965)",
          filter: "blur(4px)",
        }
      : undefined

  return (
    <div
      ref={ref}
      className={`w-full motion-reduce:animate-none ${animationClass}`}
      style={{
        ...restingStyle,
        animationDelay: `${delay}ms`,
      }}
      onAnimationEnd={() => {
        if (status === "entering") {
          setStatus("visible")
        }

        if (status === "exiting-down" || status === "exiting-up") {
          setStatus("hidden")
        }
      }}
    >
      {children}
    </div>
  )
}

function TemplateShareCard() {
  return (
    <div className="relative w-full overflow-hidden rounded-[26px] border border-white/8 bg-[#0a0a0a] shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
      <div className="relative aspect-[909/520] w-full overflow-hidden rounded-[22px] bg-[#0b0b0b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),rgba(255,255,255,0)_55%)]" />

        <div className="absolute left-[3.3%] top-[5.2%] flex flex-col gap-[3.8%] text-[#d8d8d8]">
          <p className="text-[0.56rem] font-medium tracking-[0.22em] text-white/28 sm:text-[0.7rem] md:text-[0.82rem]">
            SESHN
          </p>
          <div className="inline-flex w-fit rounded-full bg-white/6 px-3 py-1 text-[0.56rem] tracking-[0.08em] text-white/45 sm:text-[0.7rem] md:text-[0.85rem]">
            MATHEMATICS
          </div>
        </div>

        <div className="absolute left-[3.4%] top-[18.8%] flex flex-col">
          <h3 className={`${dmSerifDisplay.className} text-[clamp(1.95rem,3.3vw,3.85rem)] leading-[0.86] font-normal tracking-[-0.055em] text-[#f2f2f2]`}>
            evening
            <br />
            lock in
          </h3>
          <div className="mt-[4.5%] h-[4px] w-[71%] bg-white/9 sm:h-[5px]" />
          <p className={`${dmSerifDisplay.className} mt-[6.5%] max-w-[67%] text-[clamp(0.95rem,1.85vw,2rem)] leading-[1.02] font-normal tracking-[-0.04em] text-white/42`}>
            integration by
            <br />
            parts practice
          </p>
        </div>

        <div className="absolute left-[41.5%] top-[18.7%] flex w-[11.5%] flex-col items-start">
          <p className="font-serif text-[clamp(2.4rem,4vw,4.45rem)] leading-none font-semibold tracking-[-0.085em] text-[#dcdcdc]">
            4
          </p>
          <p className="mt-[-0.5%] text-[clamp(0.95rem,1.8vw,2rem)] leading-none tracking-[-0.055em] text-white/18">
            topics
          </p>
        </div>

        <div className="absolute left-[67.8%] top-[18.2%] flex w-[13.5%] flex-col items-start">
          <p className="font-serif text-[clamp(2.4rem,4vw,4.45rem)] leading-none font-semibold tracking-[-0.085em] text-[#dcdcdc]">
            82
            <span className="text-[clamp(0.8rem,1.05vw,1.15rem)] align-top text-white/45">
              %
            </span>
          </p>
          <p className="mt-[-0.5%] text-[clamp(0.95rem,1.8vw,2rem)] leading-none tracking-[-0.055em] text-white/18">
            focus
          </p>
        </div>

        <div className="absolute left-[41.5%] top-[57.2%] flex w-[12%] flex-col items-start">
          <p className="font-serif text-[clamp(2.4rem,4vw,4.45rem)] leading-none font-semibold tracking-[-0.085em] text-[#dcdcdc]">
            7
          </p>
          <p className="mt-[-0.5%] text-[clamp(0.95rem,1.8vw,2rem)] leading-none tracking-[-0.055em] text-white/18">
            day streak
          </p>
        </div>

        <div className="absolute left-[67.8%] top-[56.8%] flex w-[20%] flex-col items-start">
          <p className="font-serif text-[clamp(2.4rem,4vw,4.45rem)] leading-none font-semibold tracking-[-0.085em] text-[#dcdcdc]">
            2<span className="text-[clamp(1.2rem,1.95vw,2rem)] align-[0.12em] text-[#bfbfbf]">
              h
            </span>{" "}
            36<span className="text-[clamp(0.8rem,1.05vw,1.15rem)] align-top text-white/45">
              mins
            </span>
          </p>
          <p className="mt-[-0.5%] text-[clamp(0.95rem,1.8vw,2rem)] leading-none tracking-[-0.055em] text-white/18">
            duration
          </p>
        </div>

        <div className="absolute inset-x-[2.5%] bottom-[4.3%] h-[2.5%] overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[71.2%] bg-white" />
        </div>
      </div>
    </div>
  )
}

function CardPlaceholder() {
  return (
    <div className="w-full overflow-hidden rounded-[26px] border border-white/12 bg-[#151515] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
      <div className="flex aspect-[909/520] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
        <div className="h-full w-full rounded-[20px] border border-dashed border-white/18 bg-black/20" />
      </div>
    </div>
  )
}