"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { formatDuration, getSession } from "@/lib/seshnStore"

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
  const [imageUrl, setImageUrl] = useState("")
  const [selectedDesign, setSelectedDesign] = useState(DESIGNS[0])
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSession(getSession(id))
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
      drawShareImage(canvasRef.current, image, selectedDesign, session)
    }
    image.src = imageUrl

    return () => {
      image.onload = null
    }
  }, [imageUrl, selectedDesign, session])

  useEffect(() => {
    if (session && imageRef.current) {
      drawShareImage(canvasRef.current, imageRef.current, selectedDesign, session)
    }
  }, [selectedDesign, session])

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
          <div className="aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-black/28">
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
    <span className="relative block aspect-[4/5] overflow-hidden rounded-md bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04))]">
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
            <span className="mt-1 grid grid-cols-3 gap-1">
              {[0, 1, 2].map((item) => (
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

function drawShareImage(canvas, image, design, session) {
  if (!canvas) {
    return
  }

  const width = 1080
  const height = 1350
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

  drawDesign(context, design, session, width, height)
}

function drawDesign(context, design, session, width, height) {
  const textColor = design.light ? "#111111" : "#f5f5f0"
  const mutedColor = design.light ? "rgba(17,17,17,0.62)" : "rgba(245,245,240,0.62)"
  const metrics = [
    ["duration", formatDuration(session.durationSeconds)],
    ["focus", `${session.focus}%`],
    ["target", `${session.targetFocus ?? 0}%`],
  ]

  context.save()
  context.fillStyle = design.tint

  if (design.position === "bottom") {
    roundRect(context, 56, height - 338, width - 112, 258, 34)
    context.fill()
    drawHorizontalLockup(context, session, metrics, {
      x: 96,
      y: height - 276,
      width: width - 192,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "right") {
    roundRect(context, width - 408, 72, 328, height - 144, 34)
    context.fill()
    drawVerticalLockup(context, session, metrics, {
      x: width - 360,
      y: 148,
      width: 232,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "top") {
    roundRect(context, 56, 64, width - 112, 226, 34)
    context.fill()
    drawHorizontalLockup(context, session, metrics, {
      x: 96,
      y: 124,
      width: width - 192,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "corner") {
    roundRect(context, width - 438, height - 438, 358, 358, 34)
    context.fill()
    drawCompactLockup(context, session, metrics, {
      x: width - 386,
      y: height - 368,
      width: 254,
      textColor,
      mutedColor,
    })
  }

  if (design.position === "center") {
    roundRect(context, 144, 472, width - 288, 360, 34)
    context.fill()
    drawCenteredLockup(context, session, metrics, {
      x: 198,
      y: 552,
      width: width - 396,
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
      x: 86,
      y: height - 242,
      width: width - 172,
      textColor,
      mutedColor,
    })
  }

  context.restore()
}

function drawHorizontalLockup(context, session, metrics, options) {
  const { x, y, width, textColor, mutedColor } = options

  context.fillStyle = mutedColor
  context.font = "600 24px Arial"
  context.fillText("SESHN", x, y)

  context.fillStyle = textColor
  context.font = "700 58px Arial"
  fillSingleLine(context, session.title, x, y + 76, width * 0.58)

  context.fillStyle = mutedColor
  context.font = "28px Arial"
  fillSingleLine(context, session.subject, x, y + 124, width * 0.58)

  metrics.forEach(([label, value], index) => {
    const metricX = x + width - 390 + index * 130
    context.fillStyle = textColor
    context.font = "700 34px Arial"
    context.fillText(String(value), metricX, y + 190)
    context.fillStyle = mutedColor
    context.font = "22px Arial"
    context.fillText(label, metricX, y + 225)
  })
}

function drawVerticalLockup(context, session, metrics, options) {
  const { x, y, width, textColor, mutedColor } = options

  context.fillStyle = mutedColor
  context.font = "600 24px Arial"
  context.fillText("SESHN", x, y)

  context.fillStyle = textColor
  context.font = "700 48px Arial"
  wrapText(context, session.title, x, y + 76, width, 54, 2)

  context.fillStyle = mutedColor
  context.font = "26px Arial"
  wrapText(context, session.subject, x, y + 196, width, 32, 2)

  metrics.forEach(([label, value], index) => {
    const metricY = y + 318 + index * 118
    context.fillStyle = textColor
    context.font = "700 42px Arial"
    context.fillText(String(value), x, metricY)
    context.fillStyle = mutedColor
    context.font = "22px Arial"
    context.fillText(label, x, metricY + 34)
  })
}

function drawCompactLockup(context, session, metrics, options) {
  const { x, y, width, textColor, mutedColor } = options

  context.fillStyle = mutedColor
  context.font = "600 22px Arial"
  context.fillText("SESHN", x, y)

  context.fillStyle = textColor
  context.font = "700 42px Arial"
  wrapText(context, session.title, x, y + 68, width, 46, 2)

  context.fillStyle = mutedColor
  context.font = "24px Arial"
  fillSingleLine(context, session.subject, x, y + 166, width)

  metrics.slice(0, 2).forEach(([label, value], index) => {
    const metricX = x + index * 126
    context.fillStyle = textColor
    context.font = "700 34px Arial"
    context.fillText(String(value), metricX, y + 242)
    context.fillStyle = mutedColor
    context.font = "20px Arial"
    context.fillText(label, metricX, y + 274)
  })
}

function drawCenteredLockup(context, session, metrics, options) {
  const { x, y, width, textColor, mutedColor } = options
  const centerX = x + width / 2

  context.textAlign = "center"
  context.fillStyle = mutedColor
  context.font = "600 24px Arial"
  context.fillText("SESHN", centerX, y)

  context.fillStyle = textColor
  context.font = "700 58px Arial"
  wrapText(context, session.title, x, y + 78, width, 62, 2, "center")

  context.fillStyle = mutedColor
  context.font = "28px Arial"
  context.fillText(session.subject, centerX, y + 204)

  metrics.forEach(([label, value], index) => {
    const metricX = x + width * (0.18 + index * 0.32)
    context.fillStyle = textColor
    context.font = "700 34px Arial"
    context.fillText(String(value), metricX, y + 282)
    context.fillStyle = mutedColor
    context.font = "22px Arial"
    context.fillText(label, metricX, y + 318)
  })
  context.textAlign = "left"
}

function drawFrameLockup(context, session, metrics, options) {
  const { x, y, width, textColor, mutedColor } = options

  context.fillStyle = "rgba(8,8,8,0.52)"
  roundRect(context, x - 24, y - 64, width * 0.72, 210, 28)
  context.fill()

  drawHorizontalLockup(context, session, metrics, {
    x,
    y,
    width: width * 0.72,
    textColor,
    mutedColor,
  })
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
