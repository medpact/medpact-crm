"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

const LOGO = "/medpact-recruitment-logo.png"
const PHOTO_FOLDER = "/poster-doctors/"

const PHOTO_FILES = [
  "doctor-01-male-surgeon.png",
  "doctor-02-female-physician.png",
  "doctor-03-male-radiologist.png",
  "doctor-04-female-pediatrician.png",
  "doctor-05-male-doctor.png",
  "doctor-06-female-doctor.png",
  "doctor-07-male-surgeon.png",
  "doctor-08-female-doctor.png",
  "doctor-09-male-physician.png",
  "doctor-10-female-surgeon.png",
]

const PHONE = "+91 95426 67667"
const EMAIL = "info@medpact.in"
const WEBSITE = "www.medpact.in"

const C = {
  navy: "#073B67",
  blue: "#0878B9",
  green: "#49AF35",
  pale: "#EAF6FC",
  ink: "#153653",
  white: "#FFFFFF",
  muted: "#64748B",
}

const TEMPLATES = [
  {
    id: "surgical",
    name: "Surgical specialties",
    label: "SURGICAL CARE",
    keywords: [
      "orthopedic",
      "orthopaedic",
      "surgery",
      "surgeon",
      "neurosurgery",
      "microsurgery",
      "urology",
      "surgical",
      "transplant",
    ],
  },
  {
    id: "radiology",
    name: "Radiology",
    label: "MEDICAL IMAGING",
    keywords: ["radiology", "radiologist", "nuclear medicine", "imaging"],
  },
  {
    id: "cardiology",
    name: "Cardiology",
    label: "HEART CARE",
    keywords: ["cardiology", "cardiac", "cardiothoracic", "heart"],
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    label: "CARE FOR EVERY CHILD",
    keywords: ["pediatric", "paediatric", "neonatology"],
  },
  {
    id: "womens-health",
    name: "Women's health",
    label: "WOMEN'S HEALTH",
    keywords: [
      "gynecology",
      "gynaecology",
      "obstetric",
      "reproductive",
      "maternal",
    ],
  },
  {
    id: "standard",
    name: "Standard doctor",
    label: "BETTER CARE, TOGETHER",
    keywords: [],
  },
]

function chooseTemplate(name) {
  const value = String(name || "").toLowerCase()

  return (
    TEMPLATES.find(
      (template) =>
        template.id !== "standard" &&
        template.keywords.some((word) => value.includes(word))
    ) || TEMPLATES[TEMPLATES.length - 1]
  )
}

function experienceText(value) {
  if (value === null || value === undefined || value === "") {
    return "As per profile"
  }

  return `${value} ${Number(value) === 1 ? "year" : "years"}`
}

function salaryText(item) {
  const min = item.salary_min
  const max = item.salary_max

  if (min && max) {
    return `₹${Number(min).toLocaleString("en-IN")} – ₹${Number(max).toLocaleString("en-IN")}`
  }

  if (min) {
    return `From ₹${Number(min).toLocaleString("en-IN")}`
  }

  if (max) {
    return `Up to ₹${Number(max).toLocaleString("en-IN")}`
  }

  return ""
}

function roundedRect(ctx, x, y, width, height, radius, color) {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.fillStyle = color
  ctx.fill()
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function shuffleArray(array) {
  const result = [...array]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

function fitImage(ctx, image, x, y, width, height, radius = 20) {
  if (!image) {
    roundedRect(ctx, x, y, width, height, radius, "#DCECF4")
    return
  }

  const scale = Math.max(
    width / image.width,
    height / image.height
  )

  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (image.width - sourceWidth) / 2
  const sourceY = (image.height - sourceHeight) / 2

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.clip()

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  )

  ctx.restore()
}

function wrapText(ctx, value, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(value || "").split(/\s+/)
  const lines = []
  let line = ""

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word

    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }

  if (line) lines.push(line)

  const visibleLines = lines.slice(0, maxLines)

  if (lines.length > maxLines && visibleLines.length) {
    let last = visibleLines[visibleLines.length - 1]

    while (
      last.length > 1 &&
      ctx.measureText(`${last}…`).width > maxWidth
    ) {
      last = last.slice(0, -1)
    }

    visibleLines[visibleLines.length - 1] = `${last}…`
  }

  visibleLines.forEach((text, index) => {
    ctx.fillText(text, x, y + index * lineHeight)
  })

  return visibleLines.length
}

function drawHeader(ctx, logo) {
  ctx.fillStyle = C.white
  ctx.fillRect(0, 0, 1080, 1350)

  ctx.fillStyle = C.green
  ctx.fillRect(0, 0, 1080, 17)

  ctx.fillStyle = C.blue
  ctx.fillRect(0, 17, 1080, 8)

  if (logo) {
    const scale = Math.min(
      390 / logo.width,
      125 / logo.height
    )

    const width = logo.width * scale
    const height = logo.height * scale

    ctx.drawImage(
      logo,
      48,
      38 + (125 - height) / 2,
      width,
      height
    )
  } else {
    ctx.fillStyle = C.navy
    ctx.font = "900 42px Arial"
    ctx.fillText("MEDPACT", 48, 95)

    ctx.fillStyle = C.green
    ctx.font = "16px Arial"
    ctx.fillText("HEALTHCARE PRIVATE LIMITED", 50, 120)
  }

  ctx.textAlign = "right"

  ctx.fillStyle = C.navy
  ctx.font = "800 22px Arial"
  ctx.fillText("TRUSTED NETWORK", 1030, 69)

  ctx.fillStyle = C.green
  ctx.font = "19px Arial"
  ctx.fillText("CAREER OPPORTUNITIES", 1030, 103)

  ctx.textAlign = "left"

  ctx.fillStyle = "#DDF1FB"
  ctx.beginPath()
  ctx.moveTo(0, 165)
  ctx.quadraticCurveTo(270, 120, 540, 165)
  ctx.quadraticCurveTo(810, 200, 1080, 150)
  ctx.lineTo(1080, 210)
  ctx.lineTo(0, 210)
  ctx.closePath()
  ctx.fill()
}

function drawFooter(ctx) {
  ctx.fillStyle = C.navy
  ctx.fillRect(0, 1150, 1080, 200)

  roundedRect(ctx, 48, 1172, 984, 145, 22, C.white)

  ctx.textAlign = "center"

  ctx.fillStyle = C.green
  ctx.font = "800 20px Arial"
  ctx.fillText("CONTACT MEDPACT", 540, 1208)

  ctx.fillStyle = C.navy
  ctx.font = "800 28px Arial"
  ctx.fillText(PHONE, 540, 1252)

  ctx.fillStyle = C.ink
  ctx.font = "20px Arial"
  ctx.fillText(EMAIL, 540, 1285)
  ctx.fillText(WEBSITE, 540, 1310)

  ctx.textAlign = "left"
}

function drawTitle(ctx, specialty) {
  const words = String(specialty || "DOCTOR")
    .toUpperCase()
    .split(/\s+/)

  const lines = []
  let line = ""

  // Keep the title inside the navy banner.
  ctx.font = "900 48px Arial"

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word

    if (ctx.measureText(candidate).width > 520 && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }

  if (line) lines.push(line)

  const visibleLines = lines.slice(0, 3)

  let fontSize = 48

  if (visibleLines.length === 2) fontSize = 43
  if (visibleLines.length >= 3) fontSize = 36

  ctx.font = `900 ${fontSize}px Arial`
  ctx.fillStyle = C.white

  const lineHeight = fontSize + 12
  const totalHeight = visibleLines.length * lineHeight

  // Vertically center the title within the banner.
  const firstBaseline =
    348 + (265 - totalHeight) / 2 + fontSize

  visibleLines.forEach((titleLine, index) => {
    ctx.fillText(
      titleLine,
      76,
      firstBaseline + index * lineHeight,
      530
    )
  })
}

function drawSinglePoster(
  ctx,
  item,
  template,
  logo,
  doctorImage,
  includeSalary
) {
  drawHeader(ctx, logo)

  ctx.fillStyle = C.blue
  ctx.font = "800 35px Arial"
  ctx.fillText("WE ARE", 55, 250)

  ctx.fillStyle = C.green
  ctx.font = "900 78px Arial"
  ctx.fillText("HIRING", 52, 326)

  // Separate photo area, with no overlap with the specialty banner.
  fitImage(ctx, doctorImage, 665, 210, 365, 410, 22)

  // Specialty banner.
  roundedRect(ctx, 48, 348, 595, 265, 25, C.navy)

  ctx.fillStyle = C.green
  ctx.fillRect(48, 348, 12, 265)

  drawTitle(ctx, item.specialty_name)

  ctx.fillStyle = "#BFE5FF"
  ctx.font = "700 20px Arial"
  ctx.fillText(template.label, 68, 582)

  // Experience and location.
  roundedRect(ctx, 48, 640, 984, 270, 26, C.pale)

  ctx.fillStyle = C.blue
  ctx.beginPath()
  ctx.arc(112, 713, 34, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = C.white
  ctx.font = "800 31px Arial"
  ctx.textAlign = "center"
  ctx.fillText("+", 112, 724)
  ctx.textAlign = "left"

  ctx.fillStyle = C.blue
  ctx.font = "800 22px Arial"
  ctx.fillText("EXPERIENCE", 170, 700)

  ctx.fillStyle = C.ink
  ctx.font = "800 35px Arial"
  ctx.fillText(experienceText(item.experience_required), 170, 743)

  ctx.strokeStyle = "#B5D9EC"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(170, 765)
  ctx.lineTo(970, 765)
  ctx.stroke()

  ctx.fillStyle = C.green
  ctx.beginPath()
  ctx.arc(112, 825, 34, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = C.white
  ctx.font = "800 30px Arial"
  ctx.textAlign = "center"
  ctx.fillText("⌖", 112, 836)
  ctx.textAlign = "left"

  ctx.fillStyle = C.blue
  ctx.font = "800 22px Arial"
  ctx.fillText("WORK LOCATION", 170, 813)

  ctx.fillStyle = C.ink
  ctx.font = "800 34px Arial"
  wrapText(
    ctx,
    item.city || "Location to be confirmed",
    170,
    856,
    800,
    37,
    1
  )

  let ctaY = 960

  if (includeSalary && salaryText(item)) {
    roundedRect(ctx, 55, 925, 970, 48, 15, "#EAF7E7")

    ctx.fillStyle = C.green
    ctx.font = "700 23px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Salary: ${salaryText(item)}`, 540, 956, 920)
    ctx.textAlign = "left"

    ctaY = 990
  }

  roundedRect(ctx, 48, ctaY, 984, 90, 23, C.green)

  ctx.fillStyle = C.white
  ctx.textAlign = "center"
  ctx.font = "800 29px Arial"
  ctx.fillText("INTERESTED? LET'S CONNECT", 540, ctaY + 39)

  ctx.font = "21px Arial"
  ctx.fillText(
    "Share this opportunity or refer a colleague",
    540,
    ctaY + 70
  )

  ctx.textAlign = "left"

  drawFooter(ctx)
}

function drawMultiplePoster(
  ctx,
  items,
  logo,
  doctorImages,
  includeSalary
) {
  drawHeader(ctx, logo)

  ctx.fillStyle = C.blue
  ctx.font = "800 32px Arial"
  ctx.fillText("MULTIPLE CAREER OPPORTUNITIES", 48, 230)

  ctx.fillStyle = C.green
  ctx.font = "900 60px Arial"
  ctx.fillText("WE ARE HIRING", 48, 300)

  ctx.fillStyle = C.muted
  ctx.font = "22px Arial"
  ctx.fillText(
    "Explore current openings across locations",
    50,
    335
  )

  const list = items.slice(0, 6)
  const columns = 2
  const rows = Math.ceil(list.length / columns)
  const gapX = 18
  const gapY = 15
  const cardWidth = (984 - gapX) / columns
  const cardHeight = 205
  const startY = 365

  list.forEach((item, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const x = 48 + column * (cardWidth + gapX)
    const y = startY + row * (cardHeight + gapY)

    roundedRect(ctx, x, y, cardWidth, cardHeight, 20, C.pale)

    ctx.fillStyle = C.green
    ctx.fillRect(x, y, 8, cardHeight)

    // Each vacancy card gets its own randomly assigned photo.
    const doctorImage = doctorImages[index] || null

    fitImage(
      ctx,
      doctorImage,
      x + cardWidth - 105,
      y + 16,
      82,
      100,
      14
    )

    ctx.fillStyle = C.navy
    ctx.font = "800 23px Arial"

    wrapText(
      ctx,
      item.specialty_name || "Doctor",
      x + 22,
      y + 40,
      cardWidth - 145,
      27,
      2
    )

    ctx.fillStyle = C.blue
    ctx.font = "700 15px Arial"
    ctx.fillText("EXPERIENCE", x + 22, y + 100)

    ctx.fillStyle = C.ink
    ctx.font = "700 19px Arial"
    ctx.fillText(
      experienceText(item.experience_required),
      x + 22,
      y + 124
    )

    ctx.fillStyle = C.blue
    ctx.font = "700 15px Arial"
    ctx.fillText("LOCATION", x + 22, y + 151)

    ctx.fillStyle = C.ink
    ctx.font = "700 18px Arial"

    wrapText(
      ctx,
      item.city || "To be confirmed",
      x + 22,
      y + 177,
      cardWidth - 44,
      21,
      1
    )

    if (includeSalary && salaryText(item)) {
      ctx.fillStyle = C.green
      ctx.font = "700 15px Arial"
      ctx.fillText(
        salaryText(item),
        x + 22,
        y + cardHeight - 8,
        cardWidth - 44
      )
    }
  })

  // Footer occupies the final 200 pixels.
  // The cards fit above it for up to six vacancies.
  const ctaY = startY + rows * (cardHeight + gapY) + 1

  if (ctaY + 72 < 1140) {
    roundedRect(ctx, 48, ctaY, 984, 65, 18, C.green)

    ctx.fillStyle = C.white
    ctx.textAlign = "center"
    ctx.font = "800 25px Arial"
    ctx.fillText("INTERESTED? LET'S CONNECT", 540, ctaY + 28)

    ctx.font = "18px Arial"
    ctx.fillText(
      "Share these opportunities or refer a colleague",
      540,
      ctaY + 51
    )
    ctx.textAlign = "left"
  }

  drawFooter(ctx)
}

export default function PosterPage() {
  const router = useRouter()
  const canvasRef = useRef(null)

  const [requirements, setRequirements] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [mode, setMode] = useState("single")
  const [templateOverride, setTemplateOverride] = useState("auto")
  const [includeSalary, setIncludeSalary] = useState(false)
  const [photoOrder, setPhotoOrder] = useState(() =>
    shuffleArray(PHOTO_FILES)
  )
  const [loading, setLoading] = useState(true)
  const [imagesLoading, setImagesLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const photoUrls = useMemo(
    () => photoOrder.map((filename) => PHOTO_FOLDER + filename),
    [photoOrder]
  )

  const [loadedImages, setLoadedImages] = useState({
    logo: null,
    photos: [],
  })

  useEffect(() => {
    loadRequirements()
  }, [])

  async function loadRequirements() {
    setLoading(true)
    setError("")

    try {
      const [reqResult, specResult] = await Promise.all([
        supabase
          .from("requirements")
          .select("*")
          .order("entry_date", { ascending: false }),
        supabase.from("specialties").select("id,name"),
      ])

      if (reqResult.error) throw reqResult.error
      if (specResult.error) throw specResult.error

      const specialtyMap = Object.fromEntries(
        (specResult.data || []).map((item) => [
          String(item.id),
          item.name,
        ])
      )

      const rows = (reqResult.data || [])
        .filter((item) => !item.status || item.status === "open")
        .map((item) => ({
          ...item,
          specialty_name:
            specialtyMap[String(item.specialty_id)] || "Doctor",
        }))

      setRequirements(rows)

      if (rows.length) {
        setSelectedId((current) => {
          if (current && rows.some((item) => String(item.id) === current)) {
            return current
          }

          return String(rows[0].id)
        })
      } else {
        setSelectedId("")
      }
    } catch (err) {
      console.error("Poster requirement loading failed:", err)
      setError(err.message || "Could not load requirements.")
    } finally {
      setLoading(false)
    }
  }

  // Load the logo and all local doctor images.
  // The same loaded image objects are used for preview and download.
  useEffect(() => {
    let cancelled = false

    async function loadPosterImages() {
      setImagesLoading(true)

      const [logo, ...photos] = await Promise.all([
        loadImage(LOGO),
        ...photoUrls.map((url) => loadImage(url)),
      ])

      if (cancelled) return

      setLoadedImages({ logo, photos })
      setImagesLoading(false)

      const failed = photos.filter((photo) => !photo).length

      if (failed) {
        setNotice(
          `${failed} doctor image(s) could not be loaded. Check the filenames in public/poster-doctors/.`
        )
      } else if (!logo) {
        setNotice(
          "Corporate logo was not found. Check public/medpact-recruitment-logo.png."
        )
      }
    }

    loadPosterImages()

    return () => {
      cancelled = true
    }
  }, [photoUrls])

  const selectedRequirement = useMemo(
    () =>
      requirements.find(
        (item) => String(item.id) === String(selectedId)
      ) || null,
    [requirements, selectedId]
  )

  const multipleRequirements = useMemo(
    () =>
      selectedIds
        .map((id) =>
          requirements.find((item) => String(item.id) === String(id))
        )
        .filter(Boolean)
        .slice(0, 6),
    [selectedIds, requirements]
  )

  const suggestedTemplate = selectedRequirement
    ? chooseTemplate(selectedRequirement.specialty_name)
    : TEMPLATES[TEMPLATES.length - 1]

  const activeTemplate =
    templateOverride === "auto"
      ? suggestedTemplate
      : TEMPLATES.find(
          (item) => item.id === templateOverride
        ) || suggestedTemplate

  // The canvas is the single source of truth for both preview and PNG.
  useEffect(() => {
    let cancelled = false

    async function renderPoster() {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 1080
      canvas.height = 1350

      ctx.fillStyle = C.white
      ctx.fillRect(0, 0, 1080, 1350)

      if (imagesLoading) {
        ctx.fillStyle = C.muted
        ctx.font = "28px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Loading poster images...", 540, 675)
        ctx.textAlign = "left"
        return
      }

      if (
        (mode === "single" && !selectedRequirement) ||
        (mode === "multiple" && !multipleRequirements.length)
      ) {
        ctx.fillStyle = C.muted
        ctx.font = "28px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Select a requirement to preview", 540, 675)
        ctx.textAlign = "left"
        return
      }

      if (cancelled) return

      if (mode === "single") {
        const imageIndex = photoOrder.indexOf(
          photoOrder[0]
        )
        const doctorImage =
          loadedImages.photos[imageIndex] ||
          loadedImages.photos.find(Boolean) ||
          null

        drawSinglePoster(
          ctx,
          selectedRequirement,
          activeTemplate,
          loadedImages.logo,
          doctorImage,
          includeSalary
        )
      } else {
        const images = multipleRequirements.map((item, index) => {
          const filename = photoOrder[index % photoOrder.length]
          const photoIndex = photoOrder.indexOf(filename)

          return (
            loadedImages.photos[photoIndex] ||
            loadedImages.photos.find(Boolean) ||
            null
          )
        })

        drawMultiplePoster(
          ctx,
          multipleRequirements,
          loadedImages.logo,
          images,
          includeSalary
        )
      }
    }

    renderPoster()

    return () => {
      cancelled = true
    }
  }, [
    mode,
    selectedRequirement,
    multipleRequirements,
    activeTemplate,
    includeSalary,
    loadedImages,
    imagesLoading,
    photoOrder,
  ])

  function randomizePhotos() {
    setPhotoOrder(shuffleArray(PHOTO_FILES))
    setNotice("Doctor photos randomized. Preview updated.")
  }

  function toggleMultiple(id) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id)
      }

      if (current.length >= 6) {
        setNotice("You can include up to 6 vacancies in one poster.")
        return current
      }

      setNotice("")
      return [...current, id]
    })
  }

  function downloadPng() {
    const canvas = canvasRef.current

    if (!canvas || imagesLoading) {
      setNotice("Please wait until the poster is ready.")
      return
    }

    if (
      (mode === "single" && !selectedRequirement) ||
      (mode === "multiple" && !multipleRequirements.length)
    ) {
      setNotice("Select a requirement first.")
      return
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setNotice("Could not create the PNG. Please try again.")
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")

        link.href = url
        link.download =
          mode === "single"
            ? `medpact-${String(
                selectedRequirement?.specialty_name || "vacancy"
              )
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}-poster.png`
            : "medpact-multiple-vacancies.png"

        document.body.appendChild(link)
        link.click()
        link.remove()

        setTimeout(() => URL.revokeObjectURL(url), 1000)
        setNotice("Poster downloaded successfully.")
      },
      "image/png"
    )
  }

  function shareWhatsApp() {
    let message = ""

    if (mode === "single") {
      if (!selectedRequirement) {
        setNotice("Select a requirement first.")
        return
      }

      const item = selectedRequirement
      const salary =
        includeSalary && salaryText(item)
          ? `\nSalary: ${salaryText(item)}`
          : ""

      message =
        `🩺 ${item.specialty_name} Vacancy\n` +
        `📍 Location: ${item.city || "To be confirmed"}\n` +
        `Experience: ${experienceText(item.experience_required)}` +
        `${salary}\n\n`
    } else {
      if (!multipleRequirements.length) {
        setNotice("Select vacancies first.")
        return
      }

      message = "🩺 MEDPACT CAREER OPPORTUNITIES\n\n"

      multipleRequirements.forEach((item, index) => {
        message +=
          `${index + 1}. ${item.specialty_name}\n` +
          `📍 ${item.city || "To be confirmed"}\n` +
          `Experience: ${experienceText(item.experience_required)}\n`

        if (includeSalary && salaryText(item)) {
          message += `Salary: ${salaryText(item)}\n`
        }

        message += "\n"
      })
    }

    message +=
      `📲 ${PHONE}\n` +
      `📩 ${EMAIL}\n` +
      `🌐 ${WEBSITE}\n\n` +
      "Team MEDPACT"

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    )

    setNotice(
      "WhatsApp opened. Download the PNG and attach it to your message."
    )
  }

  return (
    <main style={S.page}>
      <header style={S.header}>
        <div>
          <p style={S.eyebrow}>MEDPACT RECRUITMENT</p>
          <h1 style={S.title}>Poster Studio</h1>
          <p style={S.subtitle}>
            Create professional vacancy posters from your saved requirements.
          </p>
        </div>

        <button
          style={S.backButton}
          onClick={() => router.push("/")}
        >
          ← Dashboard
        </button>
      </header>

      <div style={S.modeBar}>
        <button
          onClick={() => setMode("single")}
          style={{
            ...S.modeButton,
            ...(mode === "single" ? S.modeActive : {}),
          }}
        >
          Single Requirement
        </button>

        <button
          onClick={() => setMode("multiple")}
          style={{
            ...S.modeButton,
            ...(mode === "multiple" ? S.modeActive : {}),
          }}
        >
          Multiple Requirements
        </button>
      </div>

      <section style={S.layout}>
        <aside style={S.panel}>
          <div style={S.panelHeading}>
            <div>
              <h2 style={S.panelTitle}>
                {mode === "single"
                  ? "1. Select requirement"
                  : "1. Select vacancies"}
              </h2>

              <p style={S.muted}>
                {mode === "single"
                  ? "Choose one open requirement."
                  : `Choose up to 6 open requirements (${selectedIds.length}/6).`}
              </p>
            </div>

            <button
              style={S.smallButton}
              onClick={loadRequirements}
            >
              Refresh
            </button>
          </div>

          {loading && <p style={S.muted}>Loading requirements...</p>}

          {error && <p style={S.error}>{error}</p>}

          {!loading && !error && requirements.length === 0 && (
            <div style={S.empty}>
              No open requirements found.
              <p>
                <button
                  style={S.primary}
                  onClick={() => router.push("/requirements/add")}
                >
                  + Add requirement
                </button>
              </p>
            </div>
          )}

          <div style={S.list}>
            {requirements.map((item) => {
              const id = String(item.id)
              const selected =
                mode === "single"
                  ? id === String(selectedId)
                  : selectedIds.includes(id)

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (mode === "single") {
                      setSelectedId(id)
                      setNotice("")
                    } else {
                      toggleMultiple(id)
                    }
                  }}
                  style={{
                    ...S.reqCard,
                    ...(selected ? S.reqSelected : {}),
                  }}
                >
                  <span
                    style={{
                      ...S.check,
                      ...(selected ? S.checkSelected : {}),
                    }}
                  >
                    {selected ? "✓" : ""}
                  </span>

                  <span style={{ minWidth: 0 }}>
                    <strong style={S.reqTitle}>
                      {item.specialty_name}
                    </strong>

                    <span style={S.reqCity}>
                      📍 {item.city || "Location not specified"}
                    </span>

                    <span style={S.reqMeta}>
                      {experienceText(item.experience_required)} ·{" "}
                      {item.positions || 1} position(s)
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {mode === "single" && (
            <div style={S.section}>
              <h2 style={S.panelTitle}>2. Visual template</h2>

              <p style={S.muted}>
                Automatic selection uses the specialty. You can override it.
              </p>

              <label style={S.label}>Template</label>

              <select
                value={templateOverride}
                onChange={(event) =>
                  setTemplateOverride(event.target.value)
                }
                style={S.select}
              >
                <option value="auto">Automatic — recommended</option>

                {TEMPLATES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              {selectedRequirement && (
                <div style={S.hint}>
                  <strong>Suggested: {suggestedTemplate.name}</strong>
                  <span>{activeTemplate.label}</span>
                </div>
              )}
            </div>
          )}

          <div style={S.section}>
            <h2 style={S.panelTitle}>3. Poster options</h2>

            <button
              style={S.secondaryButton}
              onClick={randomizePhotos}
              disabled={imagesLoading}
            >
              <icon name="shuffle" size="sm" inline /> Randomize doctor photos
            </button>

            <p style={S.muted}>
              Choose different photos for a fresh poster design.
              Multiple vacancies use different images where available.
            </p>

            <label style={S.salaryToggle}>
              <input
                type="checkbox"
                checked={includeSalary}
                onChange={(event) =>
                  setIncludeSalary(event.target.checked)
                }
              />
              Include salary (off by default)
            </label>
          </div>

          {imagesLoading && (
            <p style={S.muted}>Loading logo and doctor photos...</p>
          )}

          {notice && <p style={S.notice}>{notice}</p>}
        </aside>

        <section style={S.panel}>
          <div style={S.panelHeading}>
            <div>
              <h2 style={S.panelTitle}>Poster preview</h2>
              <p style={S.muted}>1080 × 1350 px · Portrait PNG</p>
            </div>

            <span style={S.badge}>PNG</span>
          </div>

          <div style={S.canvasFrame}>
            <canvas
              ref={canvasRef}
              style={S.canvas}
              aria-label="Medpact recruitment poster preview"
            />
          </div>

          <div style={S.actions}>
            <button
              style={S.primary}
              onClick={downloadPng}
              disabled={imagesLoading}
            >
              ↓ Download PNG
            </button>

            <button
              style={S.whatsapp}
              onClick={shareWhatsApp}
            >
              Share on WhatsApp
            </button>
          </div>

          <p style={S.help}>
            WhatsApp opens a message draft. Download the PNG and attach
            it manually, including when posting to a Community announcement.
          </p>

          <p style={S.privacy}>
            Hospital name and qualification are excluded. Salary is optional.
          </p>
        </section>
      </section>
    </main>
  )
}

const S = {
  page: {
    minHeight: "100vh",
    background: "#F3F7FB",
    padding: "clamp(14px, 3vw, 30px)",
    color: C.ink,
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 18,
    marginBottom: 20,
  },

  eyebrow: {
    margin: "0 0 7px",
    color: C.green,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2,
  },

  title: {
    margin: 0,
    color: C.navy,
    fontSize: "clamp(25px, 3.5vw, 36px)",
  },

  subtitle: {
    color: C.muted,
    margin: "8px 0 0",
    lineHeight: 1.6,
  },

  backButton: {
    padding: "11px 16px",
    background: "#FFFFFF",
    border: "1px solid #D9E4ED",
    borderRadius: 9,
    color: C.navy,
    fontWeight: 700,
    cursor: "pointer",
  },

  modeBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },

  modeButton: {
    padding: "12px 18px",
    border: "1px solid #D5E1EB",
    borderRadius: 10,
    background: "#FFFFFF",
    color: C.navy,
    fontWeight: 700,
    cursor: "pointer",
  },

  modeActive: {
    background: C.navy,
    color: "#FFFFFF",
    borderColor: C.navy,
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    alignItems: "start",
    gap: 20,
  },

  panel: {
    minWidth: 0,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "clamp(14px, 2vw, 22px)",
    boxShadow: "0 5px 20px rgba(15,50,80,.035)",
  },

  panelHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },

  panelTitle: {
    margin: 0,
    fontSize: 18,
    color: C.navy,
  },

  muted: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 1.5,
    margin: "6px 0 12px",
  },

  smallButton: {
    background: "#FFFFFF",
    color: C.navy,
    border: "1px solid #D9E4ED",
    borderRadius: 8,
    padding: "8px 11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  list: {
    display: "grid",
    gap: 8,
    maxHeight: 410,
    overflowY: "auto",
  },

  reqCard: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
    textAlign: "left",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    cursor: "pointer",
  },

  reqSelected: {
    border: `2px solid ${C.green}`,
    background: "#F5FFF2",
  },

  check: {
    display: "grid",
    placeItems: "center",
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: "50%",
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: C.green,
    fontWeight: 900,
  },

  checkSelected: {
    background: C.green,
    color: "#FFFFFF",
    borderColor: C.green,
  },

  reqTitle: {
    display: "block",
    color: C.navy,
    fontSize: 14,
    marginBottom: 5,
  },

  reqCity: {
    display: "block",
    color: C.green,
    fontSize: 12,
    marginBottom: 4,
  },

  reqMeta: {
    display: "block",
    color: C.muted,
    fontSize: 11,
  },

  section: {
    borderTop: "1px solid #E7EEF4",
    marginTop: 20,
    paddingTop: 20,
  },

  label: {
    display: "block",
    color: C.navy,
    fontWeight: 700,
    fontSize: 13,
    margin: "14px 0 8px",
  },

  select: {
    width: "100%",
    padding: 12,
    borderRadius: 9,
    border: "1px solid #D6E2EC",
    color: C.navy,
    background: "#FFFFFF",
    fontSize: 14,
  },

  hint: {
    display: "grid",
    gap: 6,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    background: C.pale,
    fontSize: 12,
    lineHeight: 1.5,
  },

  secondaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "11px 14px",
    marginTop: 14,
    background: "#FFFFFF",
    border: "1px solid #D6E2EC",
    color: C.navy,
    borderRadius: 9,
    fontWeight: 700,
    cursor: "pointer",
  },

  salaryToggle: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: 12,
    marginTop: 14,
    borderRadius: 8,
    background: "#F8FAFC",
    fontSize: 13,
  },

  canvasFrame: {
    width: "100%",
    maxWidth: 540,
    margin: "0 auto",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #D9E4ED",
    background: "#FFFFFF",
  },

  canvas: {
    display: "block",
    width: "100%",
    height: "auto",
  },

  badge: {
    background: C.pale,
    color: C.blue,
    padding: "7px 9px",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 800,
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  primary: {
    flex: "1 1 160px",
    padding: "12px 15px",
    background: C.navy,
    color: "#FFFFFF",
    border: "none",
    borderRadius: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  whatsapp: {
    flex: "1 1 160px",
    padding: "12px 15px",
    background: C.green,
    color: "#FFFFFF",
    border: "none",
    borderRadius: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  help: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 0,
  },

  privacy: {
    color: C.blue,
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 0,
  },

  notice: {
    color: C.blue,
    fontSize: 13,
    lineHeight: 1.5,
    padding: 12,
    background: C.pale,
    borderRadius: 8,
  },

  error: {
    padding: 14,
    background: "#FFF1F2",
    color: "#BE123C",
    borderRadius: 8,
    lineHeight: 1.6,
  },

  empty: {
    padding: 18,
    background: "#F8FAFC",
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 1.6,
  },
}
