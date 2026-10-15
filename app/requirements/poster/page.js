"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

const LOGO_URL = "/medpact-recruitment-logo.png"
const STANDARD_IMAGE = "/poster-doctors/standard-doctors.png"

const PHONE = "+91 95426 67667"
const EMAIL = "info@medpact.in"
const WEBSITE = "www.medpact.in"

const C = {
  navy: "#073B67",
  blue: "#0878B9",
  green: "#49AF35",
  pale: "#EAF6FC",
  ink: "#153653",
}

const TEMPLATES = [
  {
    id: "surgical",
    name: "Surgical specialties",
    description: "Orthopedics, Surgery, Neurosurgery, Hand Microsurgery, Urology",
    keywords: [
      "orthopedic", "orthopaedic", "surgery", "surgeon",
      "neurosurgery", "microsurgery", "urology", "surgical",
    ],
    label: "SURGICAL CARE",
  },
  {
    id: "radiology",
    name: "Radiology",
    description: "Radiology, Interventional Radiology, Nuclear Medicine",
    keywords: ["radiology", "radiologist", "nuclear medicine", "imaging"],
    label: "MEDICAL IMAGING",
  },
  {
    id: "cardiology",
    name: "Cardiology",
    description: "Cardiology, Cardiac Surgery and related specialties",
    keywords: ["cardiology", "cardiac", "cardiothoracic", "heart"],
    label: "HEART CARE",
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    description: "Pediatrics, Neonatology, Pediatric Surgery",
    keywords: ["pediatric", "paediatric", "neonatology", "child"],
    label: "CARE FOR EVERY CHILD",
  },
  {
    id: "womens-health",
    name: "Women's health",
    description: "Gynecology, Obstetrics, Reproductive Medicine",
    keywords: [
      "gynecology", "gynaecology", "obstetric",
      "reproductive", "maternal",
    ],
    label: "WOMEN'S HEALTH",
  },
  {
    id: "standard",
    name: "Standard doctor",
    description: "All other specialties",
    keywords: [],
    label: "BETTER CARE, TOGETHER",
  },
]

function text(value, fallback = "Not specified") {
  return value === null ||
    value === undefined ||
    String(value).trim() === ""
    ? fallback
    : String(value)
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function experienceText(value) {
  if (value === null || value === undefined || value === "") {
    return "As per profile"
  }

  return `${value} ${Number(value) === 1 ? "year" : "years"}`
}

function salaryText(requirement) {
  const min = requirement.salary_min
  const max = requirement.salary_max

  if (min && max) {
    return `₹${Number(min).toLocaleString("en-IN")} – ₹${Number(max).toLocaleString("en-IN")}`
  }

  if (min) return `From ₹${Number(min).toLocaleString("en-IN")}`
  if (max) return `Up to ₹${Number(max).toLocaleString("en-IN")}`

  return ""
}

function chooseTemplate(specialtyName) {
  const name = String(specialtyName || "").toLowerCase()

  return (
    TEMPLATES.find(
      (template) =>
        template.id !== "standard" &&
        template.keywords.some((word) => name.includes(word))
    ) || TEMPLATES[5]
  )
}

function splitTitle(value, maxLength = 19) {
  const words = String(value || "DOCTOR").toUpperCase().split(/\s+/)
  const lines = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length > maxLength && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)

  return lines.slice(0, 3)
}

function makePosterSvg(requirement, template, includeSalary) {
  const specialty = String(requirement.specialty_name || "Doctor")
  const city = String(requirement.city || "Location to be confirmed")
  const experience = experienceText(requirement.experience_required)
  const titleLines = splitTitle(specialty, 20)

  const titleSize = titleLines.length >= 3 ? 43 : titleLines.length === 2 ? 49 : 55

  const title = titleLines.map((line, index) => `
    <text
      x="66"
      y="${365 + index * 59}"
      font-family="Arial,sans-serif"
      font-size="${titleSize}"
      font-weight="900"
      fill="#FFFFFF"
    >${escapeXml(line)}</text>
  `).join("")

  const salary = includeSalary ? salaryText(requirement) : ""
  const salaryBlock = salary
    ? `
      <rect x="55" y="944" width="970" height="58" rx="16" fill="#EAF7E7"/>
      <text x="540" y="981" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="25"
        font-weight="700" fill="${C.green}">
        Salary: ${escapeXml(salary)}
      </text>
    `
    : ""

  const ctaY = salary ? 1015 : 960
  const ctaTextY = ctaY + 39
  const ctaSubY = ctaY + 70

  return `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="${C.pale}"/>
      </linearGradient>

      <clipPath id="doctorClip">
        <rect x="665" y="200" width="365" height="505" rx="28"/>
      </clipPath>
    </defs>

    <rect width="1080" height="1350" fill="url(#background)"/>
    <rect width="1080" height="17" fill="${C.green}"/>
    <rect y="17" width="1080" height="8" fill="${C.blue}"/>

    <!-- Corporate logo -->
    <image href="${LOGO_URL}"
      x="48" y="38" width="390" height="125"
      preserveAspectRatio="xMinYMid meet"/>

    <text x="1030" y="69" text-anchor="end"
      font-family="Arial,sans-serif" font-size="22"
      font-weight="800" fill="${C.navy}">
      TRUSTED NETWORK
    </text>

    <text x="1030" y="103" text-anchor="end"
      font-family="Arial,sans-serif" font-size="19"
      fill="${C.green}">
      CAREER OPPORTUNITIES
    </text>

    <path d="M0 165 Q270 120 540 165 T1080 150 L1080 210 L0 210Z"
      fill="#DDF1FB"/>

    <!-- Hiring headline -->
    <text x="55" y="250"
      font-family="Arial,sans-serif" font-size="35"
      font-weight="800" fill="${C.blue}">
      WE ARE
    </text>

    <text x="52" y="326"
      font-family="Arial,sans-serif" font-size="78"
      font-weight="900" fill="${C.green}">
      HIRING
    </text>

    <!-- Specialty title area -->
    <rect x="48" y="348" width="595" height="265"
      rx="25" fill="${C.navy}"/>

    <rect x="48" y="348" width="12" height="265"
      rx="6" fill="${C.green}"/>

    ${title}

    <text x="68" y="575"
      font-family="Arial,sans-serif" font-size="21"
      font-weight="700" fill="#BFE5FF">
      ${escapeXml(template.label)}
    </text>

    <!-- Local doctor photograph -->
    <rect x="665" y="200" width="365" height="505"
      rx="28" fill="#D9EAF3"/>

    <image href="${STANDARD_IMAGE}"
      x="665" y="200" width="365" height="505"
      preserveAspectRatio="xMidYMid slice"
      clip-path="url(#doctorClip)"/>

    <!-- Specialty details -->
    <rect x="48" y="640" width="984" height="270"
      rx="26" fill="${C.pale}"/>

    <circle cx="112" cy="713" r="34" fill="${C.blue}"/>

    <text x="112" y="725" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="31"
      font-weight="800" fill="#FFFFFF">+</text>

    <text x="170" y="700"
      font-family="Arial,sans-serif" font-size="22"
      font-weight="800" fill="${C.blue}">
      EXPERIENCE
    </text>

    <text x="170" y="743"
      font-family="Arial,sans-serif" font-size="35"
      font-weight="800" fill="${C.ink}">
      ${escapeXml(experience)}
    </text>

    <line x1="170" y1="765" x2="970" y2="765"
      stroke="#B5D9EC" stroke-width="2"/>

    <circle cx="112" cy="825" r="34" fill="${C.green}"/>

    <text x="112" y="837" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="30"
      font-weight="800" fill="#FFFFFF">⌖</text>

    <text x="170" y="813"
      font-family="Arial,sans-serif" font-size="22"
      font-weight="800" fill="${C.blue}">
      WORK LOCATION
    </text>

    <text x="170" y="856"
      font-family="Arial,sans-serif" font-size="34"
      font-weight="800" fill="${C.ink}">
      ${escapeXml(city.length > 32 ? city.slice(0, 31) + "…" : city)}
    </text>

    ${salaryBlock}

    <!-- Call to action -->
    <rect x="48" y="${ctaY}" width="984" height="90"
      rx="23" fill="${C.green}"/>

    <text x="540" y="${ctaTextY}" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="29"
      font-weight="800" fill="#FFFFFF">
      INTERESTED? LET'S CONNECT
    </text>

    <text x="540" y="${ctaSubY}" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="21"
      fill="#FFFFFF">
      Share this opportunity or refer a colleague
    </text>

    <!-- Footer -->
    <path d="M0 1150 Q270 1115 540 1150 T1080 1140 L1080 1350 L0 1350Z"
      fill="${C.navy}"/>

    <rect x="48" y="1172" width="984" height="145"
      rx="22" fill="#FFFFFF"/>

    <text x="540" y="1208" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="20"
      font-weight="800" fill="${C.green}">
      CONTACT MEDPACT
    </text>

    <text x="540" y="1252" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="28"
      font-weight="800" fill="${C.navy}">
      ${PHONE}
    </text>

    <text x="540" y="1290" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="21"
      fill="${C.ink}">
      ${EMAIL}
    </text>

    <text x="540" y="1310" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="19"
      fill="${C.ink}">
      ${WEBSITE}
    </text>
  </svg>
  `
}

async function fetchAsDataUrl(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Image not found: ${url}`)
  }

  const blob = await response.blob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Could not read ${url}`))
    reader.readAsDataURL(blob)
  })
}

export default function PosterPage() {
  const router = useRouter()

  const [requirements, setRequirements] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [templateOverride, setTemplateOverride] = useState("auto")
  const [includeSalary, setIncludeSalary] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    loadRequirements()
  }, [])

  async function loadRequirements() {
    setLoading(true)
    setError("")

    try {
      const [requirementsResult, specialtiesResult] = await Promise.all([
        supabase
          .from("requirements")
          .select("*")
          .order("entry_date", { ascending: false }),

        supabase.from("specialties").select("id,name"),
      ])

      if (requirementsResult.error) throw requirementsResult.error
      if (specialtiesResult.error) throw specialtiesResult.error

      const specialtyMap = Object.fromEntries(
        (specialtiesResult.data || []).map((item) => [
          String(item.id),
          item.name,
        ])
      )

      setRequirements(
        (requirementsResult.data || [])
          .filter((item) => !item.status || item.status === "open")
          .map((item) => ({
            ...item,
            specialty_name:
              specialtyMap[String(item.specialty_id)] || "Doctor",
          }))
      )
    } catch (err) {
      console.error(err)
      setError(err.message || "Could not load requirements.")
    } finally {
      setLoading(false)
    }
  }

  const selectedRequirement = useMemo(
    () =>
      requirements.find((item) => String(item.id) === String(selectedId)) ||
      null,
    [requirements, selectedId]
  )

  const suggestedTemplate = selectedRequirement
    ? chooseTemplate(selectedRequirement.specialty_name)
    : TEMPLATES[5]

  const activeTemplate =
    templateOverride === "auto"
      ? suggestedTemplate
      : TEMPLATES.find((item) => item.id === templateOverride) ||
        suggestedTemplate

  const svg = useMemo(
    () =>
      selectedRequirement
        ? makePosterSvg(
            selectedRequirement,
            activeTemplate,
            includeSalary
          )
        : "",
    [selectedRequirement, activeTemplate, includeSalary]
  )

  const previewUrl = useMemo(
    () =>
      svg
        ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
        : "",
    [svg]
  )

  async function downloadPng() {
    if (!selectedRequirement || !svg) {
      setNotice("Select a requirement first.")
      return
    }

    setNotice("Preparing poster...")

    let objectUrl

    try {
      /*
        Embed both local images into the SVG before rendering.
        This avoids missing logo/photo issues during PNG export.
      */
      const [logoData, doctorData] = await Promise.all([
        fetchAsDataUrl(LOGO_URL),
        fetchAsDataUrl(STANDARD_IMAGE),
      ])

      const exportSvg = svg
        .replaceAll(LOGO_URL, logoData)
        .replaceAll(STANDARD_IMAGE, doctorData)

      const blob = new Blob([exportSvg], {
        type: "image/svg+xml;charset=utf-8",
      })

      objectUrl = URL.createObjectURL(blob)

      const image = new Image()

      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = () =>
          reject(new Error("Could not render the poster image."))
        image.src = objectUrl
      })

      const canvas = document.createElement("canvas")
      canvas.width = 1080
      canvas.height = 1350

      const ctx = canvas.getContext("2d")

      if (!ctx) throw new Error("PNG canvas is unavailable.")

      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, 1080, 1350)
      ctx.drawImage(image, 0, 0, 1080, 1350)

      const pngBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(new Error("Could not create PNG.")),
          "image/png"
        )
      })

      const pngUrl = URL.createObjectURL(pngBlob)
      const link = document.createElement("a")

      link.href = pngUrl
      link.download = `medpact-${String(
        selectedRequirement.specialty_name
      )
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-poster.png`

      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(pngUrl)

      setNotice("Poster downloaded successfully.")
    } catch (err) {
      console.error(err)
      setNotice(err.message || "Could not download the poster.")
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }

  function shareWhatsApp() {
    if (!selectedRequirement) {
      setNotice("Select a requirement first.")
      return
    }

    const salary =
      includeSalary && salaryText(selectedRequirement)
        ? `\nSalary: ${salaryText(selectedRequirement)}`
        : ""

    const message =
      `🩺 ${selectedRequirement.specialty_name} Vacancy\n` +
      `📍 Location: ${selectedRequirement.city || "To be confirmed"}\n` +
      `Experience: ${experienceText(selectedRequirement.experience_required)}` +
      `${salary}\n\n` +
      `📲 ${PHONE}\n📩 ${EMAIL}\n🌐 ${WEBSITE}\n\nTeam MEDPACT`

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
          <h1 style={S.title}>Single Requirement Poster Studio</h1>
          <p style={S.subtitle}>
            Create a professional vacancy poster from your saved requirements.
          </p>
        </div>

        <button style={S.backButton} onClick={() => router.push("/")}>
          ← Dashboard
        </button>
      </header>

      <section style={S.layout}>
        <aside style={S.panel}>
          <div style={S.panelHeading}>
            <div>
              <h2 style={S.panelTitle}>1. Select requirement</h2>
              <p style={S.muted}>Only open requirements are listed.</p>
            </div>

            <button style={S.smallButton} onClick={loadRequirements}>
              Refresh
            </button>
          </div>

          {loading && <p style={S.muted}>Loading requirements...</p>}

          {!loading && error && (
            <div style={S.error}>
              {error}
              <button style={S.smallButton} onClick={loadRequirements}>
                Try again
              </button>
            </div>
          )}

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
            {requirements.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedId(String(item.id))
                  setNotice("")
                }}
                style={{
                  ...S.reqCard,
                  ...(String(selectedId) === String(item.id)
                    ? S.reqSelected
                    : {}),
                }}
              >
                <span
                  style={{
                    ...S.dot,
                    background:
                      String(selectedId) === String(item.id)
                        ? C.green
                        : "#FFFFFF",
                  }}
                >
                  {String(selectedId) === String(item.id) ? "✓" : ""}
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
            ))}
          </div>

          <div style={S.section}>
            <h2 style={S.panelTitle}>2. Choose visual style</h2>
            <p style={S.muted}>
              Automatic chooses a template based on the specialty.
            </p>

            <label style={S.label}>Template</label>
            <select
              value={templateOverride}
              onChange={(event) => setTemplateOverride(event.target.value)}
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
                <span>{suggestedTemplate.description}</span>
                {templateOverride !== "auto" && (
                  <span>Selected template: {activeTemplate.name}</span>
                )}
              </div>
            )}

            <label style={S.salaryToggle}>
              <input
                type="checkbox"
                checked={includeSalary}
                onChange={(event) => setIncludeSalary(event.target.checked)}
              />
              Include salary (off by default)
            </label>
          </div>

          {notice && <p style={S.notice}>{notice}</p>}
        </aside>

        <section style={S.panel}>
          <div style={S.panelHeading}>
            <div>
              <h2 style={S.panelTitle}>3. Poster preview</h2>
              <p style={S.muted}>
                {selectedRequirement
                  ? `${activeTemplate.name} · 1080 × 1350 px`
                  : "Select a requirement to preview."}
              </p>
            </div>
            <span style={S.badge}>PNG</span>
          </div>

          {previewUrl ? (
            <div style={S.posterFrame}>
              <img
                src={previewUrl}
                alt="Medpact recruitment poster preview"
                style={S.posterImage}
              />
            </div>
          ) : (
            <div style={S.previewEmpty}>
              <span style={{ fontSize: 42 }}>✦</span>
              <h3>Your poster will appear here</h3>
              <p>Choose an open requirement to begin.</p>
            </div>
          )}

          <div style={S.actions}>
            <button
              style={S.primary}
              disabled={!selectedRequirement}
              onClick={downloadPng}
            >
              ↓ Download PNG
            </button>

            <button
              style={S.whatsapp}
              disabled={!selectedRequirement}
              onClick={shareWhatsApp}
            >
              Share on WhatsApp
            </button>
          </div>

          <p style={S.help}>
            WhatsApp opens a message draft. Download the PNG and attach it
            manually to your Community announcement.
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
    marginBottom: 24,
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
    fontSize: "clamp(24px, 3.5vw, 36px)",
  },
  subtitle: {
    color: "#64748B",
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
    color: "#64748B",
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
    maxHeight: 390,
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
  dot: {
    display: "grid",
    placeItems: "center",
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: "50%",
    border: "1px solid #CBD5E1",
    color: "#FFFFFF",
    fontWeight: 900,
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
    color: "#64748B",
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
  posterFrame: {
    width: "100%",
    maxWidth: 540,
    margin: "0 auto",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #D9E4ED",
    background: "#FFFFFF",
  },
  posterImage: {
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
  previewEmpty: {
    minHeight: 320,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#F8FAFC",
    border: "2px dashed #CBD5E1",
    borderRadius: 12,
    color: "#64748B",
    textAlign: "center",
    padding: 20,
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
    color: "#64748B",
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
