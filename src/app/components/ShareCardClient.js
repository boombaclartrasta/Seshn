"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  calculateStats,
  formatDuration,
  getSession,
  getSessions,
} from "@/lib/seshnStore"

const SHARE_FONT = '"DM Serif Display", Georgia, serif'
const SHARE_WIDTH = 1080
const SHARE_HEIGHT = 1920
const COLLAPSED_PANEL_HEIGHT = 18
const EXPANDED_PANEL_HEIGHT = 78
const PANEL_COLLAPSE_THRESHOLD = 30
const PANEL_EXPAND_THRESHOLD = 58
const MIN_OVERLAY_SCALE = 0.45
const MAX_OVERLAY_SCALE = 2.4
const ROTATION_SNAP_RADIANS = (Math.PI / 180) * 6

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
  {
    id: "message-bubbles",
    name: "Message bubbles",
    description: "blue iMessage style",
    position: "messages",
    tint: "#0a84ff",
  },
]

export default function ShareCardClient({ id }) {
  const router = useRouter()
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const panelRef = useRef(null)
  const overlayTransformRef = useRef(null)
  const activePointersRef = useRef(new Map())
  const gestureRef = useRef(null)
  const dragStartYRef = useRef(null)
  const dragStartHeightRef = useRef(COLLAPSED_PANEL_HEIGHT)
  const dragCurrentHeightRef = useRef(COLLAPSED_PANEL_HEIGHT)
  const [session, setSession] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [streak, setStreak] = useState(0)
  const [imageUrl, setImageUrl] = useState("")
  const [selectedDesign, setSelectedDesign] = useState(null)
  const [overlayTransform, setOverlayTransform] = useState(null)
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [panelDragging, setPanelDragging] = useState(false)
  const [panelHeight, setPanelHeight] = useState(COLLAPSED_PANEL_HEIGHT)
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
      drawShareImageWithFonts(
        canvasRef.current,
        image,
        selectedDesign,
        session,
        streak,
        overlayTransformRef.current
      )
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
        streak,
        overlayTransform
      )
    }
  }, [overlayTransform, selectedDesign, session, streak])

  useEffect(() => {
    overlayTransformRef.current = overlayTransform
  }, [overlayTransform])

  useEffect(() => {
    if (!panelExpanded && panelRef.current) {
      panelRef.current.scrollTop = 0
    }
  }, [panelExpanded])

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (imageUrl) {
      window.URL.revokeObjectURL(imageUrl)
    }

    setImageUrl(window.URL.createObjectURL(file))
    setSelectedDesign(null)
    setOverlayTransform(null)
    activePointersRef.current.clear()
    gestureRef.current = null
    setPanelExpanded(true)
    setPanelHeight(EXPANDED_PANEL_HEIGHT)
    dragCurrentHeightRef.current = EXPANDED_PANEL_HEIGHT
    event.target.value = ""
  }

  function selectDesign(design) {
    const nextTransform = createDefaultOverlayTransform(design)

    setSelectedDesign(design)
    setOverlayTransform(nextTransform)
    overlayTransformRef.current = nextTransform
    activePointersRef.current.clear()
    gestureRef.current = null
    setPanelExpanded(false)
    setPanelHeight(COLLAPSED_PANEL_HEIGHT)
    dragCurrentHeightRef.current = COLLAPSED_PANEL_HEIGHT
  }

  function beginOverlayGesture(event) {
    if (!selectedDesign || !overlayTransformRef.current) {
      return
    }

    const point = getCanvasPoint(event)

    if (!point) {
      return
    }

    event.preventDefault()
    capturePointer(event.currentTarget, event.pointerId)
    activePointersRef.current.set(event.pointerId, point)
    restartOverlayGesture()
  }

  function moveOverlayGesture(event) {
    if (!activePointersRef.current.has(event.pointerId)) {
      return
    }

    const point = getCanvasPoint(event)

    if (!point) {
      return
    }

    event.preventDefault()
    activePointersRef.current.set(event.pointerId, point)

    const gesture = gestureRef.current
    const currentTransform = overlayTransformRef.current

    if (!gesture || !currentTransform) {
      return
    }

    if (gesture.mode === "drag") {
      const pointDelta = {
        x: point.x - gesture.startPoint.x,
        y: point.y - gesture.startPoint.y,
      }
      updateOverlayTransform({
        ...gesture.startTransform,
        x: gesture.startTransform.x + pointDelta.x,
        y: gesture.startTransform.y + pointDelta.y,
      })
      return
    }

    const pair = getGesturePair()

    if (!pair) {
      return
    }

    const center = getGestureCenter(pair)
    const distance = Math.max(getGestureDistance(pair), 1)
    const angle = getGestureAngle(pair)
    const scale = clampNumber(
      gesture.startTransform.scale * (distance / gesture.startDistance),
      MIN_OVERLAY_SCALE,
      MAX_OVERLAY_SCALE
    )

    updateOverlayTransform({
      x: gesture.startTransform.x + center.x - gesture.startCenter.x,
      y: gesture.startTransform.y + center.y - gesture.startCenter.y,
      scale,
      rotation: snapRotation(
        gesture.startTransform.rotation + angle - gesture.startAngle
      ),
    })
  }

  function finishOverlayGesture(event) {
    if (!activePointersRef.current.has(event.pointerId)) {
      return
    }

    event.preventDefault()
    releasePointer(event.currentTarget, event.pointerId)
    activePointersRef.current.delete(event.pointerId)
    restartOverlayGesture()
  }

  function updateOverlayTransform(nextTransform) {
    overlayTransformRef.current = nextTransform
    setOverlayTransform(nextTransform)
  }

  function restartOverlayGesture() {
    const currentTransform = overlayTransformRef.current
    const pointers = Array.from(activePointersRef.current.values())

    if (!currentTransform || pointers.length === 0) {
      gestureRef.current = null
      return
    }

    if (pointers.length === 1) {
      gestureRef.current = {
        mode: "drag",
        startPoint: pointers[0],
        startTransform: currentTransform,
      }
      return
    }

    const pair = pointers.slice(0, 2)
    gestureRef.current = {
      mode: "transform",
      startAngle: getGestureAngle(pair),
      startCenter: getGestureCenter(pair),
      startDistance: Math.max(getGestureDistance(pair), 1),
      startTransform: currentTransform,
    }
  }

  function getCanvasPoint(event) {
    const canvas = canvasRef.current

    if (!canvas) {
      return null
    }

    const rect = canvas.getBoundingClientRect()
    const canvasRatio = SHARE_WIDTH / SHARE_HEIGHT
    const rectRatio = rect.width / rect.height
    const renderedWidth =
      rectRatio > canvasRatio ? rect.height * canvasRatio : rect.width
    const renderedHeight =
      rectRatio > canvasRatio ? rect.height : rect.width / canvasRatio
    const offsetX = (rect.width - renderedWidth) / 2
    const offsetY = (rect.height - renderedHeight) / 2
    const x = ((event.clientX - rect.left - offsetX) / renderedWidth) * SHARE_WIDTH
    const y =
      ((event.clientY - rect.top - offsetY) / renderedHeight) * SHARE_HEIGHT

    return {
      x: clampNumber(x, 0, SHARE_WIDTH),
      y: clampNumber(y, 0, SHARE_HEIGHT),
    }
  }

  function getGesturePair() {
    const pointers = Array.from(activePointersRef.current.values())

    return pointers.length >= 2 ? pointers.slice(0, 2) : null
  }

  function beginPanelDrag(event) {
    dragStartYRef.current = event.clientY
    dragStartHeightRef.current = panelHeight
    dragCurrentHeightRef.current = panelHeight
    setPanelDragging(true)
    capturePointer(event.currentTarget, event.pointerId)
  }

  function dragPanel(event) {
    if (dragStartYRef.current === null) {
      return
    }

    const viewportHeight = Math.max(window.innerHeight, 1)
    const deltaHeight = ((dragStartYRef.current - event.clientY) / viewportHeight) * 100
    const nextHeight = clampNumber(
      dragStartHeightRef.current + deltaHeight,
      COLLAPSED_PANEL_HEIGHT,
      EXPANDED_PANEL_HEIGHT
    )

    dragCurrentHeightRef.current = nextHeight
    setPanelHeight(nextHeight)
    setPanelExpanded(nextHeight > COLLAPSED_PANEL_HEIGHT + 4)
  }

  function finishPanelDrag(event) {
    if (dragStartYRef.current === null) {
      return
    }

    releasePointer(event.currentTarget, event.pointerId)
    dragStartYRef.current = null
    setPanelDragging(false)

    const nextHeight = dragCurrentHeightRef.current

    if (nextHeight >= PANEL_EXPAND_THRESHOLD) {
      setPanelHeight(EXPANDED_PANEL_HEIGHT)
      setPanelExpanded(true)
      dragCurrentHeightRef.current = EXPANDED_PANEL_HEIGHT
      return
    }

    if (nextHeight <= PANEL_COLLAPSE_THRESHOLD) {
      setPanelHeight(COLLAPSED_PANEL_HEIGHT)
      setPanelExpanded(false)
      dragCurrentHeightRef.current = COLLAPSED_PANEL_HEIGHT
    }
  }

  async function savePhoto() {
    const canvas = canvasRef.current

    if (!canvas || !imageUrl || !selectedDesign) {
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
          router.replace("/dashboard")
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
      router.replace("/dashboard")
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
    <div className="relative min-h-svh overflow-hidden bg-black">
      <section className="absolute inset-0 grid place-items-center bg-black">
        {imageUrl ? (
          <canvas
            ref={canvasRef}
            className="h-full w-full touch-none object-contain"
            onPointerDown={beginOverlayGesture}
            onPointerMove={moveOverlayGesture}
            onPointerUp={finishOverlayGesture}
            onPointerCancel={finishOverlayGesture}
          />
        ) : (
          <label className="grid min-h-svh w-full place-items-center px-6 text-center">
            <span className="rounded-full bg-white px-6 py-4 text-base font-semibold text-[#101010] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              take or upload photo
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="sr-only"
            />
          </label>
        )}
      </section>

      {imageUrl ? (
        <section
          ref={panelRef}
          className={`scrollbar-hidden fixed inset-x-2 bottom-0 z-20 overflow-y-auto rounded-t-[30px] border border-b-0 border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(21,21,21,0.62)_28%,rgba(12,12,12,0.72))] px-4 py-3 shadow-[0_-24px_90px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150 sm:inset-x-4 ${
            panelDragging ? "" : "transition-[max-height] duration-300"
          }`}
          style={{ maxHeight: `${panelHeight}svh` }}
          onScroll={(event) => {
            if (!panelExpanded && event.currentTarget.scrollTop > 8) {
              setPanelExpanded(true)
              setPanelHeight(EXPANDED_PANEL_HEIGHT)
              dragCurrentHeightRef.current = EXPANDED_PANEL_HEIGHT
            }
          }}
        >
          <div className="mx-auto grid w-full max-w-6xl gap-3">
            <button
              type="button"
              aria-label="drag design panel"
              className="-mx-4 -mt-3 flex h-9 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
              onPointerDown={beginPanelDrag}
              onPointerMove={dragPanel}
              onPointerUp={finishPanelDrag}
              onPointerCancel={finishPanelDrag}
            >
              <span className="h-1 w-10 rounded-full bg-white/28" />
            </button>
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div>
                <h2 className="text-sm font-semibold">designs</h2>
                <p className="text-xs text-white/40">
                  {selectedDesign?.name ?? "choose a design"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="rounded-md border border-white/12 px-3 py-2 text-sm font-medium text-white/72">
                  photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={savePhoto}
                  disabled={!selectedDesign || saving}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#101010] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "saving..." : "save"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {DESIGNS.map((design) => (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => selectDesign(design)}
                  className={`grid min-h-[158px] rounded-lg border p-2 text-left text-xs transition ${
                    selectedDesign?.id === design.id
                      ? "border-white bg-white/16"
                      : "border-white/10 bg-white/6 hover:bg-white/10"
                  }`}
                >
                  <DesignThumbnail design={design} />
                  <span className="mt-2 font-medium text-white/80">
                    {design.name}
                  </span>
                  <span className="mt-1 leading-4 text-white/38">
                    {design.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function DesignThumbnail({ design }) {
  const isLight = design.light
  const panelClass = getThumbnailPanelClass(design.position)

  if (design.position === "messages") {
    return (
      <span className="relative block aspect-[9/16] overflow-hidden rounded-md bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04))]">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_30%)]" />
        <span className="absolute right-2 top-[34%] grid w-[82%] gap-2">
          <span className="relative ml-auto block h-8 w-full rounded-[999px] bg-[#0a84ff]">
            <span className="absolute -right-1 bottom-0 h-3 w-4 rounded-br-full bg-[#0a84ff]" />
            <span className="absolute left-3 top-1/2 h-1.5 w-14 -translate-y-1/2 rounded-full bg-white/82" />
          </span>
          <span className="relative ml-auto block h-8 w-[72%] rounded-[999px] bg-[#0a84ff]">
            <span className="absolute -right-1 bottom-0 h-3 w-4 rounded-br-full bg-[#0a84ff]" />
            <span className="absolute left-3 top-1/2 h-1.5 w-10 -translate-y-1/2 rounded-full bg-white/82" />
          </span>
        </span>
      </span>
    )
  }

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

function drawShareImageWithFonts(canvas, image, design, session, streak, transform) {
  if (document.fonts?.load) {
    document.fonts
      .load(`400 58px ${SHARE_FONT}`)
      .then(() => drawShareImage(canvas, image, design, session, streak, transform))
      .catch(() => drawShareImage(canvas, image, design, session, streak, transform))
    return
  }

  drawShareImage(canvas, image, design, session, streak, transform)
}

function drawShareImage(canvas, image, design, session, streak, transform) {
  if (!canvas) {
    return
  }

  const width = SHARE_WIDTH
  const height = SHARE_HEIGHT
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

  if (design) {
    drawDesign(context, design, session, streak, width, height, transform)
  }
}

function drawDesign(context, design, session, streak, width, height, transform) {
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

  if (transform) {
    const frame = getDesignFrame(design, width, height)

    context.translate(transform.x, transform.y)
    context.rotate(transform.rotation)
    context.scale(transform.scale, transform.scale)
    context.translate(-frame.width / 2, -frame.height / 2)
    drawDesignInFrame(context, design, session, metrics, {
      width: frame.width,
      height: frame.height,
      textColor,
      mutedColor,
    })
    context.restore()
    return
  }

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

  if (design.position === "messages") {
    drawMessagesLockup(context, session, {
      x: 64,
      y: height - 650,
      width: width - 128,
      tint: design.tint,
    })
  }

  context.restore()
}

function drawDesignInFrame(context, design, session, metrics, options) {
  const { width, height, textColor, mutedColor } = options

  context.fillStyle = design.tint

  if (design.position === "frame") {
    context.strokeStyle = "rgba(255,255,255,0.82)"
    context.lineWidth = 6
    roundRect(context, 0, 0, width, height, 34)
    context.stroke()
    drawFrameLockup(context, session, metrics, {
      x: 30,
      y: height - 334,
      width: width - 60,
      height: 292,
      textColor,
      mutedColor,
    })
    return
  }

  if (design.position === "messages") {
    drawMessagesLockup(context, session, {
      x: 0,
      y: 0,
      width,
      tint: design.tint,
    })
    return
  }

  roundRect(context, 0, 0, width, height, 34)
  context.fill()

  if (design.position === "right") {
    drawVerticalLockup(context, session, metrics, {
      x: 0,
      y: 0,
      width,
      height,
      textColor,
      mutedColor,
    })
    return
  }

  if (design.position === "corner") {
    drawCompactLockup(context, session, metrics, {
      x: 0,
      y: 0,
      width,
      height,
      textColor,
      mutedColor,
    })
    return
  }

  if (design.position === "center") {
    drawCenteredLockup(context, session, metrics, {
      x: 0,
      y: 0,
      width,
      height,
      textColor,
      mutedColor,
    })
    return
  }

  drawHorizontalLockup(context, session, metrics, {
    x: 0,
    y: 0,
    width,
    height,
    textColor,
    mutedColor,
  })
}

function createDefaultOverlayTransform(design) {
  const frame = getDesignFrame(design, SHARE_WIDTH, SHARE_HEIGHT)

  return {
    x: frame.x,
    y: frame.y,
    scale: 1,
    rotation: 0,
  }
}

function getDesignFrame(design, width, height) {
  const frames = {
    bottom: {
      x: width / 2,
      y: height - 265,
      width: width - 112,
      height: 330,
    },
    top: {
      x: width / 2,
      y: 237,
      width: width - 112,
      height: 330,
    },
    right: {
      x: width - 252,
      y: height / 2,
      width: 344,
      height: height - 180,
    },
    corner: {
      x: width - 272,
      y: height - 308,
      width: 384,
      height: 416,
    },
    center: {
      x: width / 2,
      y: height / 2,
      width: width - 288,
      height: 460,
    },
    frame: {
      x: width / 2,
      y: height / 2,
      width: width - 84,
      height: height - 84,
    },
    messages: {
      x: width / 2,
      y: height - 430,
      width: width - 128,
      height: 430,
    },
  }

  return frames[design.position] ?? frames.bottom
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

function drawMessagesLockup(context, session, options) {
  const { x, y, width, tint } = options
  const bubbleRight = x + width - 8
  const maxBubbleWidth = width * 0.84
  const minBubbleWidth = width * 0.42
  const tailWidth = 46
  const paddingX = 48
  const paddingY = 36
  const textMaxWidth = maxBubbleWidth - tailWidth - paddingX * 2

  context.save()
  context.textAlign = "left"
  context.fillStyle = "#ffffff"
  context.font = serifFont(56)

  const titleLines = getWrappedLines(context, session.title, textMaxWidth, 3)
  const titleBubble = getMessageBubbleGeometry(
    context,
    titleLines,
    bubbleRight,
    y,
    {
      lineHeight: 64,
      maxBubbleWidth,
      minBubbleWidth,
      paddingX,
      paddingY,
      tailWidth,
    }
  )

  context.shadowColor = "rgba(0,0,0,0.26)"
  context.shadowBlur = 24
  context.shadowOffsetY = 12
  context.fillStyle = tint
  drawRightMessageBubble(
    context,
    titleBubble.x,
    titleBubble.y,
    titleBubble.width,
    titleBubble.height,
    52
  )
  context.fill()

  context.shadowColor = "transparent"
  context.fillStyle = "#ffffff"
  context.font = serifFont(56)
  drawTextLines(
    context,
    titleLines,
    titleBubble.x + paddingX,
    titleBubble.y + paddingY + 48,
    64
  )

  const detailLines = [
    `${formatDuration(session.durationSeconds)} session`,
    `${session.focus ?? 0}% focus rating`,
  ]
  context.font = serifFont(48)
  const detailBubble = getMessageBubbleGeometry(
    context,
    detailLines,
    bubbleRight,
    titleBubble.y + titleBubble.height + 30,
    {
      lineHeight: 56,
      maxBubbleWidth,
      minBubbleWidth,
      paddingX,
      paddingY,
      tailWidth,
    }
  )

  context.shadowColor = "rgba(0,0,0,0.26)"
  context.shadowBlur = 24
  context.shadowOffsetY = 12
  context.fillStyle = tint
  drawRightMessageBubble(
    context,
    detailBubble.x,
    detailBubble.y,
    detailBubble.width,
    detailBubble.height,
    52
  )
  context.fill()

  context.shadowColor = "transparent"
  context.fillStyle = "#ffffff"
  context.font = serifFont(48)
  drawTextLines(
    context,
    detailLines,
    detailBubble.x + paddingX,
    detailBubble.y + paddingY + 42,
    56
  )

  context.restore()
}

function getMessageBubbleGeometry(context, lines, right, y, options) {
  const {
    lineHeight,
    maxBubbleWidth,
    minBubbleWidth,
    paddingX,
    paddingY,
    tailWidth,
  } = options
  const textWidth = Math.max(
    1,
    ...lines.map((line) => context.measureText(line).width)
  )
  const width = Math.min(
    maxBubbleWidth,
    Math.max(minBubbleWidth, textWidth + paddingX * 2 + tailWidth)
  )

  return {
    x: right - width,
    y,
    width,
    height: lines.length * lineHeight + paddingY * 2,
  }
}

function drawRightMessageBubble(context, x, y, width, height, radius) {
  const tailWidth = 46
  const bodyRight = x + width - tailWidth
  const bottom = y + height

  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(bodyRight - radius, y)
  context.quadraticCurveTo(bodyRight, y, bodyRight, y + radius)
  context.lineTo(bodyRight, bottom - radius)
  context.quadraticCurveTo(bodyRight, bottom, bodyRight - radius, bottom)
  context.lineTo(x + radius, bottom)
  context.quadraticCurveTo(x, bottom, x, bottom - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
  context.fill()

  context.beginPath()
  context.moveTo(bodyRight - 18, bottom - 52)
  context.quadraticCurveTo(bodyRight + 12, bottom - 22, x + width, bottom - 6)
  context.quadraticCurveTo(bodyRight + 6, bottom + 6, bodyRight - 58, bottom - 6)
  context.quadraticCurveTo(bodyRight - 24, bottom - 16, bodyRight - 18, bottom - 52)
  context.closePath()
}

function capturePointer(element, pointerId) {
  try {
    element.setPointerCapture?.(pointerId)
  } catch {
    // Some mobile browsers can lose the pointer before capture is applied.
  }
}

function releasePointer(element, pointerId) {
  try {
    if (element.hasPointerCapture?.(pointerId)) {
      element.releasePointerCapture?.(pointerId)
    }
  } catch {
    // Pointer cancellation can already release capture before React receives it.
  }
}

function getGestureCenter([firstPoint, secondPoint]) {
  return {
    x: (firstPoint.x + secondPoint.x) / 2,
    y: (firstPoint.y + secondPoint.y) / 2,
  }
}

function getGestureDistance([firstPoint, secondPoint]) {
  return Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y)
}

function getGestureAngle([firstPoint, secondPoint]) {
  return Math.atan2(secondPoint.y - firstPoint.y, secondPoint.x - firstPoint.x)
}

function snapRotation(angle) {
  const quarterTurn = Math.PI / 2
  const nearestQuarterTurn = Math.round(angle / quarterTurn) * quarterTurn

  if (Math.abs(angle - nearestQuarterTurn) <= ROTATION_SNAP_RADIANS) {
    return nearestQuarterTurn
  }

  return angle
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value))
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
  const visibleLines = getWrappedLines(context, text, maxWidth, maxLines)

  visibleLines.forEach((line, index) => {
    const textX = align === "center" ? x + maxWidth / 2 : x
    context.fillText(line, textX, y + index * lineHeight)
  })
}

function getWrappedLines(context, text, maxWidth, maxLines) {
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
    currentLine =
      context.measureText(word).width > maxWidth
        ? trimTextToWidth(context, word, maxWidth)
        : word
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  const visibleLines = lines.slice(0, maxLines)

  if (lines.length > maxLines) {
    const lastIndex = visibleLines.length - 1
    visibleLines[lastIndex] = trimTextToWidth(
      context,
      visibleLines[lastIndex].replace(/\.*$/, ""),
      maxWidth
    )
  }

  return visibleLines.length > 0 ? visibleLines : [""]
}

function trimTextToWidth(context, text, maxWidth) {
  let nextText = String(text ?? "")

  while (nextText.length > 0 && context.measureText(`${nextText}...`).width > maxWidth) {
    nextText = nextText.slice(0, -1)
  }

  return `${nextText}...`
}

function drawTextLines(context, lines, x, y, lineHeight) {
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight)
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
