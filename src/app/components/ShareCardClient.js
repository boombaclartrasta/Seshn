"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  calculateStats,
  formatDuration,
  getSession,
  getSessions,
} from "@/lib/seshnStore"

const SHARE_FONT = '"DM Serif Display", Georgia, serif'

const DESIGNS = [
  {
    id: "minimal-bottom",
    name: "Minimal bottom",
    description: "wide lower stat bar",
    position: "bottom",
    tint: "rgba(8, 8, 8, 0.72)",
  },
  {
    id: "score-block",
    name: "Score block",
    description: "right-side summary",
    position: "right",
    tint: "rgba(255, 255, 255, 0.76)",
    light: true,
  },
  {
    id: "top-strip",
    name: "Top strip",
    description: "compact top banner",
    position: "top",
    tint: "rgba(8, 8, 8, 0.62)",
  },
  {
    id: "corner-tag",
    name: "Corner tag",
    description: "bottom-right badge",
    position: "corner",
    tint: "rgba(240, 240, 240, 0.82)",
    light: true,
  },
  {
    id: "center-card",
    name: "Center card",
    description: "centered stat plate",
    position: "center",
    tint: "rgba(8, 8, 8, 0.58)",
  },
  {
    id: "blank-frame",
    name: "Blank frame",
    description: "thin image border",
    position: "frame",
    tint: "rgba(255, 255, 255, 0.5)",
  },
  {
    id: "lower-glass",
    name: "Lower glass",
    description: "light lower stat bar",
    position: "bottom",
    tint: "rgba(255, 255, 255, 0.38)",
    light: true,
  },
  {
    id: "black-sidebar",
    name: "Black sidebar",
    description: "dark vertical panel",
    position: "right",
    tint: "rgba(0, 0, 0, 0.64)",
  },
  {
    id: "header-glass",
    name: "Header glass",
    description: "light top banner",
    position: "top",
    tint: "rgba(255, 255, 255, 0.46)",
    light: true,
  },
  {
    id: "dark-corner",
    name: "Dark corner",
    description: "dark corner badge",
    position: "corner",
    tint: "rgba(0, 0, 0, 0.68)",
  },
  {
    id: "soft-center",
    name: "Soft center",
    description: "light center plate",
    position: "center",
    tint: "rgba(255, 255, 255, 0.42)",
    light: true,
  },
  {
    id: "thin-frame",
    name: "Thin frame",
    description: "minimal border lockup",
    position: "frame",
    tint: "rgba(255, 255, 255, 0.5)",
  },
]

export default function ShareCardClient({ id }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [session, setSession] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [streak, setStreak] = useState(0)
  const [imageUrl, setImageUrl] = useState("")
  const [selectedDesign, setSelectedDesign] = useState(DESIGNS[0])
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const sessions = getSessions()
      setSession(getSession(id))
      setStreak(calculateStats(sessions).streak)
      setLoaded(true)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [id])

  useEffect(() => {
    if (!session || !imageUrl) {
      return
    }

    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      imageRef.current = image
      drawShareImageWithFonts(canvasRef.current, image, selectedDesign, session, streak)
    }
    image.src = imageUrl

    return () => {
      image.onload = null
    }
  }, [imageUrl, selectedDesign, session, streak])

  useEffect(() => {
    if (session && imageRef.current) {
      drawShareImageWithFonts(
        canvasRef.current,
        imageRef.current,
        selectedDesign,
        session,
        streak
      )
    }
  }, [selectedDesign, session, streak])

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (imageUrl) {
      window.URL.revokeObjectURL(imageUrl)
    }

    setImageUrl(window.URL.createObjectURL(file))
  }

  async function savePhoto() {
    const canvas = canvasRef.current

    if (!canvas || !imageUrl) {
      return
    }

    setSaving(true)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setSaving(false)
        return
      }

      const fileName = `seshn-${session.id}.png`
      const file = new File([blob], fileName, { type: "image/png" })

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: "SESHN study session",
          })
          setSaving(false)
          return
        } catch {
          // Fall back to download below.
        }
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
      setSaving(false)
    }, "image/png")
  }

  if (!loaded) {
    return <p className="text-sm text-white/44">loading share studio...</p>
  }

  if (!session) {
    return (
      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-white/62">
          No local session was found for this share card.
        </p>
        <Link
          href="/dashboard"
          className="w-fit rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
        >
          back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-180px)] pb-[36vh]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="aspect-[9/16] overflow-hidden rounded-lg border border-white/10 bg-black/28">
            {imageUrl ? (
              <canvas ref={canvasRef} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/44">
                Add a photo to preview your selected share-card design.
              </div>
            )}
          </div>
        </section>

        <aside className="grid content-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <label className="grid gap-2 text-sm text-white/64">
            photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="rounded-md border border-white/10 bg-black/24 px-3 py-3 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#101010]"
            />
          </label>
          <button
            type="button"
            onClick={savePhoto}
            disabled={!imageUrl || saving}
            className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#101010] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "saving..." : "save photo"}
          </button>
          <Link
            href={`/sessions/${session.id}`}
            className="rounded-md border border-white/12 px-4 py-3 text-center text-sm font-medium text-white/72"
          >
            session detail
          </Link>
        </aside>
      </div>

      <section
        className={`fixed inset-x-0 bottom-0 z-20 border-t border-white/12 bg-[#151515]/78 px-4 py-4 shadow-[0_-24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-[max-height] duration-300 ${
          panelExpanded ? "max-h-[78vh]" : "max-h-[34vh]"
        } overflow-y-auto`}
        onScroll={(event) => {
          setPanelExpanded(event.currentTarget.scrollTop > 24)
        }}
      >
        <div className="mx-auto grid w-full max-w-6xl gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">designs</h2>
            <p className="text-xs text-white/40">{selectedDesign.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {DESIGNS.map((design) => (
              <button
                key={design.id}
                type="button"
                onClick={() => setSelectedDesign(design)}
                className={`grid min-h-[190px] rounded-lg border p-2 text-left text-xs transition ${
                  selectedDesign.id === design.id
                    ? "border-white bg-white/16"
                    : "border-white/10 bg-white/6 hover:bg-white/10"
                }`}
              >
                <DesignThumbnail design={design} />
                <span className="mt-2 font-medium text-white/80">{design.name}</span>
                <span className="mt-1 leading-4 text-white/38">
                  {design.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function DesignThumbnail({ design }) {
  const isLight = design.light
  const panelClass = getThumbnailPanelClass(design.position)

  return (
    <span className="relative block aspect-[9/16] overflow-hidden rounded-md bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04))]">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_30%)]" />
      <span
        className={`absolute rounded-md border border-white/20 ${panelClass}`}
        style={{ background: design.position === "frame" ? "transparent" : design.tint }}
      >
        {design.position !== "frame" ? (
          <span
            className={`absolute grid gap-1 ${
              design.position === "right"
                ? "inset-x-2 top-3"
                : design.position === "corner"
                  ? "inset-2"
                  : "left-2 right-2 top-2"
            }`}
          >
            <span
              className={`h-1.5 w-8 rounded-full ${
                isLight ? "bg-black/36" : "bg-white/50"
              }`}
            />
            <span
              className={`h-1.5 w-14 rounded-full ${
                isLight ? "bg-black/22" : "bg-white/28"
              }`}
            />
            <span className="mt-1 grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((item) => (
                <span
                  key={item}
                  className={`h-2 rounded-full ${
                    isLight ? "bg-black/22" : "bg-white/28"
                  }`}
                />
              ))}
            </span>
          </span>
        ) : null}
      </span>
    </span>
  )
}

function getThumbnailPanelClass(position) {
  const positions = {
    top: "left-2 right-2 top-2 h-[30%]",
    bottom: "bottom-2 left-2 right-2 h-[34%]",
    right: "bottom-2 right-2 top-2 w-[42%]",
    corner: "bottom-2 right-2 h-[42%] w-[48%]",
    center: "left-4 right-4 top-1/2 h-[34%] -translate-y-1/2",
    frame: "inset-2",
  }

  return positions[position] ?? positions.bottom
}

function drawShareImageWithFonts(canvas, image, design, session, streak) {
  if (document.fonts?.load) {
    document.fonts
      .load(`400 58px ${SHARE_FONT}`)
      .then(() => drawShareImage(canvas, image, design, session, streak))
      .catch(() => drawShareImage(canvas, image, design, session, streak))
    return
  }

  drawShareImage(canvas, image, design, session, streak)
}

function drawShareImage(canvas, image, design, session, streak) {
  if (!canvas) {
    return
  }

  const width = 1080
  const height = 1920
  const context = canvas.getContext("2d")

  canvas.width = width
  canvas.height = height

  context.fillStyle = "#080808"
  context.fillRect(0, 0, width, height)

  const scale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  )

  drawDesign(context, design, session, streak, width, height)
}

function drawDesign(context, design, session, streak, width, height) {
  const textColor = design.light ? "#111111" : "#f5f5f0"
  const mutedColor = design.light ? "rgba(17,17,17,0.62)" : "rgba(245,245,240,0.62)"
  const metrics = [
    ["duration", formatDuration(session.durationSeconds)],
    ["focus", `${session.focus ?? 0}%`],
    ["target", `${session.targetFocus ?? 0}%`],
    ["streak", `${streak}d`],
  ]

  context.save()
  context.fillStyle = design.tint

  if (design.position === "bottom") {
    const panel = { x: 56, y: height - 430, width: width - 112, height: 330 }
    roundRect(context, panel.x, panel.y, panel.width, panel.height, 34)
    context.fill()
    drawHorizontalLockup(context, session, metrics, {
      ...panel,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "right") {
    const panel = { x: width - 424, y: 90, width: 344, height: height - 180 }
    roundRect(context, panel.x, panel.y, panel.width, panel.height, 34)
    context.fill()
    drawVerticalLockup(context, session, metrics, {
      ...panel,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "top") {
    const panel = { x: 56, y: 72, width: width - 112, height: 330 }
    roundRect(context, panel.x, panel.y, panel.width, panel.height, 34)
    context.fill()
    drawHorizontalLockup(context, session, metrics, {
      ...panel,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "corner") {
    const panel = { x: width - 464, y: height - 516, width: 384, height: 416 }
    roundRect(context, panel.x, panel.y, panel.width, panel.height, 34)
    context.fill()
    drawCompactLockup(context, session, metrics, {
      ...panel,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "center") {
    const panel = { x: 144, y: 730, width: width - 288, height: 460 }
    roundRect(context, panel.x, panel.y, panel.width, panel.height, 34)
    context.fill()
    drawCenteredLockup(context, session, metrics, {
      ...panel,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "frame") {
    context.strokeStyle = "rgba(255,255,255,0.82)"
    context.lineWidth = 6
    roundRect(context, 42, 42, width - 84, height - 84, 34)
    context.stroke()
    drawFrameLockup(context, session, metrics, {
      x: 72,
      y: height - 392,
      width: width - 144,
      height: 292,
      textColor,
      mutedColor,
    })
  }

  context.restore()
}

function drawHorizontalLockup(context, session, metrics, options) {
  const { x, y, width, height, textColor, mutedColor } = options
  const inset = 42
  const contentX = x + inset
  const contentY = y + 60
  const contentWidth = width - inset * 2

  context.fillStyle = mutedColor
  context.font = serifFont(22)
  context.fillText("SESHN", contentX, contentY)

  context.fillStyle = textColor
  context.font = serifFont(54)
  fillSingleLine(context, session.title, contentX, contentY + 72, contentWidth)

  context.fillStyle = mutedColor
  context.font = serifFont(27)
  fillSingleLine(context, session.subject, contentX, contentY + 120, contentWidth)

  const metricY = y + height - 88
  const columnWidth = contentWidth / metrics.length
  metrics.forEach(([label, value], index) => {
    const metricX = contentX + columnWidth * index
    context.fillStyle = textColor
    context.font = serifFont(34)
    context.fillText(String(value), metricX, metricY)
    context.fillStyle = mutedColor
    context.font = serifFont(18)
    context.fillText(label, metricX, metricY + 30)
  })
}

function drawVerticalLockup(context, session, metrics, options) {
  const { x, y, width, height, textColor, mutedColor } = options
  const contentX = x + 42
  const contentY = y + 70
  const contentWidth = width - 84

  context.fillStyle = mutedColor
  context.font = serifFont(22)
  context.fillText("SESHN", contentX, contentY)

  context.fillStyle = textColor
  context.font = serifFont(48)
  wrapText(context, session.title, contentX, contentY + 76, contentWidth, 52, 3)

  context.fillStyle = mutedColor
  context.font = serifFont(26)
  wrapText(context, session.subject, contentX, contentY + 242, contentWidth, 32, 2)

  const metricStartY = y + height - 530
  metrics.forEach(([label, value], index) => {
    const metricY = metricStartY + index * 116
    context.fillStyle = textColor
    context.font = serifFont(42)
    context.fillText(String(value), contentX, metricY)
    context.fillStyle = mutedColor
    context.font = serifFont(20)
    context.fillText(label, contentX, metricY + 34)
  })
}

function drawCompactLockup(context, session, metrics, options) {
  const { x, y, width, height, textColor, mutedColor } = options
  const inset = 34
  const contentX = x + inset
  const contentY = y + 58
  const contentWidth = width - inset * 2

  context.fillStyle = mutedColor
  context.font = serifFont(20)
  context.fillText("SESHN", contentX, contentY)

  context.fillStyle = textColor
  context.font = serifFont(42)
  wrapText(context, session.title, contentX, contentY + 64, contentWidth, 46, 2)

  context.fillStyle = mutedColor
  context.font = serifFont(23)
  fillSingleLine(context, session.subject, contentX, contentY + 160, contentWidth)

  const metricY = y + height - 112
  metrics.forEach(([label, value], index) => {
    const metricX = contentX + (index % 2) * 148
    const rowY = metricY + Math.floor(index / 2) * 76
    context.fillStyle = textColor
    context.font = serifFont(30)
    context.fillText(String(value), metricX, rowY)
    context.fillStyle = mutedColor
    context.font = serifFont(17)
    context.fillText(label, metricX, rowY + 26)
  })
}

function drawCenteredLockup(context, session, metrics, options) {
  const { x, y, width, height, textColor, mutedColor } = options
  const centerX = x + width / 2
  const contentWidth = width - 96

  context.textAlign = "center"
  context.fillStyle = mutedColor
  context.font = serifFont(22)
  context.fillText("SESHN", centerX, y + 64)

  context.fillStyle = textColor
  context.font = serifFont(58)
  wrapText(context, session.title, x + 48, y + 146, contentWidth, 62, 2, "center")

  context.fillStyle = mutedColor
  context.font = serifFont(28)
  context.fillText(session.subject, centerX, y + 276)

  const metricY = y + height - 88
  const columnWidth = contentWidth / metrics.length
  metrics.forEach(([label, value], index) => {
    const metricX = x + 48 + columnWidth * index + columnWidth / 2
    context.fillStyle = textColor
    context.font = serifFont(34)
    context.fillText(String(value), metricX, metricY)
    context.fillStyle = mutedColor
    context.font = serifFont(18)
    context.fillText(label, metricX, metricY + 30)
  })
  context.textAlign = "left"
}

function drawFrameLockup(context, session, metrics, options) {
  const { x, y, width, height, textColor, mutedColor } = options

  context.fillStyle = "rgba(8,8,8,0.52)"
  roundRect(context, x, y, width, height, 28)
  context.fill()

  drawHorizontalLockup(context, session, metrics, {
    x,
    y,
    width,
    height,
    textColor,
    mutedColor,
  })
}

function serifFont(size) {
  return `400 ${size}px ${SHARE_FONT}`
}

function fillSingleLine(context, text, x, y, maxWidth) {
  const value = String(text ?? "")

  if (context.measureText(value).width <= maxWidth) {
    context.fillText(value, x, y)
    return
  }

  let nextText = value

  while (nextText.length > 0 && context.measureText(`${nextText}...`).width > maxWidth) {
    nextText = nextText.slice(0, -1)
  }

  context.fillText(`${nextText}...`, x, y)
}

function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines, align = "left") {
  const words = String(text ?? "").split(/\s+/).filter(Boolean)
  const lines = []
  let currentLine = ""

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word

    if (context.measureText(testLine).width <= maxWidth) {
      currentLine = testLine
      return
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  const visibleLines = lines.slice(0, maxLines)

  if (lines.length > maxLines) {
    const lastIndex = visibleLines.length - 1
    visibleLines[lastIndex] = `${visibleLines[lastIndex].replace(/\.*$/, "")}...`
  }

  visibleLines.forEach((line, index) => {
    const textX = align === "center" ? x + maxWidth / 2 : x
    context.fillText(line, textX, y + index * lineHeight)
  })
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
}
