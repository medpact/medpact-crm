"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

const LOGO_URL = "/medpact-recruitment-logo.png"
const PHONE = "+91 95426 67667"
const EMAIL = "info@medpact.in"
const WEBSITE = "www.medpact.in"

const C = {
  navy: "#073B67",
  blue: "#0878B9",
  teal: "#16A6A1",
  green: "#49AF35",
  pale: "#EAF6FC",
  ink: "#153653",
  white: "#FFFFFF",
}

/*
  These are starter stock-image URLs.
  For reliable production use, download approved images of Indian doctors
  and store them in public/poster-doctors/.
*/
const TEMPLATES = [
  {
    id: "surgical",
    name: "Surgical specialties",
    description:
      "Orthopedics, General Surgery, Neurosurgery, Hand Microsurgery, Urology",
    image:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1000&q=85",
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
    accent: C.blue,
    visual: "SURGICAL CARE",
  },
  {
    id: "radiology",
    name: "Radiology",
    description:
      "Radiology, Interventional Radiology, Nuclear Medicine",
    image:
      "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=1000&q=85",
    keywords: [
      "radiology",
      "radiologist",
      "nuclear medicine",
      "imaging",
    ],
    accent: C.blue,
    visual: "MEDICAL IMAGING",
  },
  {
    id: "cardiology",
    name: "Cardiology",
    description:
      "Cardiology, Cardiac Surgery and related specialties",
    image:
      "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=1000&q=85",
    keywords: [
      "cardiology",
      "cardiac",
      "cardiothoracic",
      "heart",
    ],
    accent: C.green,
    visual: "HEART CARE",
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    description:
      "Pediatrics, Neonatology, Pediatric Surgery",
    image:
      "https://images.unsplash.com/photo-1632053002928-191d2b4b8f84?auto=format&fit=crop&w=1000&q=85",
    keywords: [
      "pediatric",
      "paediatric",
      "pediatrics",
      "paediatrics",
      "neonatology",
      "child",
    ],
    accent: C.green,
    visual: "CARE FOR EVERY CHILD",
  },
  {
    id: "womens-health",
    name: "Women's health",
    description:
      "Gynecology, Obstetrics, Reproductive Medicine",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=85",
    keywords: [
      "gynecology",
      "gynaecology",
      "obstetric",
      "reproductive",
      "maternal",
      "women",
    ],
    accent: "#0D8E9A",
    visual: "WOMEN'S HEALTH",
  },
  {
    id: "standard",
    name: "Standard doctor",
    description: "All other specialties",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1000&q=85",
    keywords: [],
    accent: C.blue,
    visual: "BETTER CARE, TOGETHER",
  },
]

function displayValue(value, fallback = "Not specified") {
  return value === null ||
    value === undefined ||
    String(value).trim() === ""
    ? fallback
    : String(value)
}

function experienceText(value) {
  if (value === null || value === undefined || value === "") {
    return "As per profile"
  }

  const n = Number(value)

  return `${value} ${n === 1 ? "year" : "years"}`
}

function salaryText(requirement) {
  const min = requirement.salary_min
  const max = requirement.salary_max

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

function chooseTemplate(specialtyName) {
  const name = String(specialtyName || "").toLowerCase()

  return (
    TEMPLATES.find(
      (template) =>
        template.id !== "standard" &&
        template.keywords.some((word) => name.includes(word))
    ) || TEMPLATES[TEMPLATES.length - 1]
  )
}

function xml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function wrapText(value, max = 24) {
  const words = String(value || "").split(/\s+/)
  const lines = []
  let line = ""

  for (const word of words) {
    const next = line ? `${line} ${word}` : word

    if (next.length > max && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }

  if (line) lines.push(line)

  return lines.slice(0, 2)
}

function makePosterSvg(requirement, template, includeSalary) {
  const W = 1080
  const H = 1350

  const specialty = String(requirement.specialty_name || "Doctor")
  const city = String(requirement.city || "Location to be confirmed")
  const experience = experienceText(requirement.experience_required)
  const lines = wrapText(specialty.toUpperCase(), 22)

  const titleSvg = lines
    .map(
      (line, i) => `
        <text
          x="64"
          y="${365 + i * 68}"
          font-family="Arial,sans-serif"
          font-size="${lines.length > 1 ? 52 : 62}"
          font-weight="900"
          fill="${C.white}"
        >${xml(line)}</text>
      `
    )
    .join("")

  const salary = includeSalary ? salaryText(requirement) : ""

  const salaryBlock = salary
    ? `
      <rect
        x="58"
        y="1014"
        width="964"
        height="60"
        rx="18"
        fill="#EAF7E7"
      />
      <text
        x="540"
        y="1053"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="26"
        font-weight="700"
        fill="${C.green}"
      >Salary: ${xml(salary)}</text>
    `
    : ""

  const ctaY = salary ? 1090 : 1025
  const ctaTextY = salary ? 1132 : 1067
  const ctaSubY = salary ? 1167 : 1102

  const imageUrl = xml(template.image)

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="${W}"
      height="${H}"
      viewBox="0 0 ${W} ${H}"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="${C.pale}"/>
        </linearGradient>

        <linearGradient id="photoFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${C.navy}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${C.navy}" stop-opacity="0"/>
        </linearGradient>

        <clipPath id="photoClip">
          <rect x="565" y="180" width="515" height="690" rx="34"/>
        </clipPath>
      </defs>

      <rect width="${W}" height="${H}" fill="url(#bg)"/>

      <rect width="${W}" height="18" fill="${C.green}"/>
      <rect y="18" width="${W}" height="8" fill="${C.blue}"/>

      <image
        href="${LOGO_URL}"
        x="48"
        y="42"
        width="405"
        height="118"
        preserveAspectRatio="xMinYMid meet"
      />

      <text
        x="1030"
        y="70"
        text-anchor="end"
        font-family="Arial,sans-serif"
        font-size="23"
        font-weight="800"
        fill="${C.navy}"
      >TRUSTED NETWORK</text>

      <text
        x="1030"
        y="105"
        text-anchor="end"
        font-family="Arial,sans-serif"
        font-size="20"
        fill="${C.green}"
      >CAREER OPPORTUNITIES</text>

      <path
        d="M0 170 Q260 115 520 170 T1080 150 L1080 230 L0 230Z"
        fill="#DDF1FB"
      />

      <text
        x="58"
        y="220"
        font-family="Arial,sans-serif"
        font-size="34"
        font-weight="800"
        fill="${C.blue}"
      >WE ARE</text>

      <text
        x="54"
        y="305"
        font-family="Arial,sans-serif"
        font-size="88"
        font-weight="900"
        fill="${C.green}"
      >HIRING</text>

      <rect
        x="48"
        y="335"
        width="984"
        height="215"
        rx="30"
        fill="${C.navy}"
      />

      <rect
        x="48"
        y="335"
        width="12"
        height="215"
        rx="6"
        fill="${template.accent}"
      />

      ${titleSvg}

      <text
        x="68"
        y="520"
        font-family="Arial,sans-serif"
        font-size="23"
        font-weight="700"
        fill="#BFE5FF"
      >${xml(template.visual)}</text>

      <g clip-path="url(#photoClip)">
        <image
          href="${imageUrl}"
          x="565"
          y="180"
          width="515"
          height="690"
          preserveAspectRatio="xMidYMid slice"
        />
        <rect
          x="565"
          y="180"
          width="515"
          height="690"
          fill="url(#photoFade)"
        />
      </g>

      <rect
        x="48"
        y="585"
        width="984"
        height="365"
        rx="30"
        fill="${C.pale}"
      />

      <circle cx="112" cy="665" r="36" fill="${C.blue}"/>

      <text
        x="112"
        y="677"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="32"
        font-weight="700"
        fill="#FFFFFF"
      >+</text>

      <text
        x="174"
        y="653"
        font-family="Arial,sans-serif"
        font-size="23"
        font-weight="800"
        fill="${C.blue}"
      >EXPERIENCE</text>

      <text
        x="174"
        y="699"
        font-family="Arial,sans-serif"
        font-size="36"
        font-weight="800"
        fill="${C.ink}"
      >${xml(experience)}</text>

      <line
        x1="174"
        y1="722"
        x2="970"
        y2="722"
        stroke="#B5D9EC"
        stroke-width="2"
      />

      <circle cx="112" cy="795" r="36" fill="${C.green}"/>

      <text
        x="112"
        y="808"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="34"
        font-weight="700"
        fill="#FFFFFF"
      >⌖</text>

      <text
        x="174"
        y="783"
        font-family="Arial,sans-serif"
        font-size="23"
        font-weight="800"
        fill="${C.blue}"
      >WORK LOCATION</text>

      <text
        x="174"
        y="829"
        font-family="Arial,sans-serif"
        font-size="36"
        font-weight="800"
        fill="${C.ink}"
      >${xml(city.length > 30 ? city.slice(0, 29) + "…" : city)}</text>

      <text
        x="174"
        y="884"
        font-family="Arial,sans-serif"
        font-size="22"
        fill="${C.ink}"
      >Join a trusted healthcare network</text>

      ${salaryBlock}

      <rect
        x="48"
        y="${ctaY}"
        width="984"
        height="94"
        rx="24"
        fill="${C.green}"
      />

      <text
        x="540"
        y="${ctaTextY}"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="30"
        font-weight="800"
        fill="#FFFFFF"
      >INTERESTED? LET'S CONNECT</text>

      <text
        x="540"
        y="${ctaSubY}"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="22"
        fill="#FFFFFF"
      >Share this opportunity or refer a colleague</text>

      <path
        d="M0 1190 Q260 1150 540 1190 T1080 1180 L1080 1350 L0 1350Z"
        fill="${C.navy}"
      />

      <rect
        x="48"
        y="1210"
        width="984"
        height="105"
        rx="22"
        fill="#FFFFFF"
      />

      <text
        x="540"
        y="1243"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="20"
        font-weight="800"
        fill="${C.green}"
      >CONTACT MEDPACT</text>

      <text
        x="540"
        y="1280"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="27"
        font-weight="800"
        fill="${C.navy}"
      >${PHONE}</text>

      <text
        x="540"
        y="1307"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="20"
        fill="${C.ink}"
      >${EMAIL}  |  ${WEBSITE}</text>
    </svg>
  `
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
        (specResult.data || []).map((s) => [
          String(s.id),
          s.name,
        ])
      )

      setRequirements(
        (reqResult.data || [])
          .filter((r) => !r.status || r.status === "open")
          .map((r) => ({
            ...r,
            specialty_name:
              specialtyMap[String(r.specialty_id)] || "Doctor",
          }))
      )
    } catch (e) {
      console.error("Poster requirements load error:", e)
      setError(e.message || "Could not load requirements.")
    } finally {
      setLoading(false)
    }
  }

  const selectedRequirement = useMemo(
    () =>
      requirements.find(
        (r) => String(r.id) === String(selectedId)
      ) || null,
    [requirements, selectedId]
  )

  const suggestedTemplate = selectedRequirement
    ? chooseTemplate(selectedRequirement.specialty_name)
    : TEMPLATES[5]

  const activeTemplate =
    templateOverride === "auto"
      ? suggestedTemplate
      : TEMPLATES.find((t) => t.id === templateOverride) ||
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

    setNotice("Preparing your PNG poster...")

    let objectUrl = ""

    try {
      const response = await fetch(LOGO_URL)

      if (!response.ok) {
        throw new Error(
          `Medpact logo not found. Add your logo at public${LOGO_URL}.`
        )
      }

      const logoBlob = await response.blob()

      const logoData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(logoBlob)
      })

      const exportSvg = svg.replaceAll(LOGO_URL, logoData)

      const svgBlob = new Blob([exportSvg], {
        type: "image/svg+xml;charset=utf-8",
      })

      objectUrl = URL.createObjectURL(svgBlob)

      const image = new Image()

      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = () =>
          reject(
            new Error(
              "Could not render the poster. Check the image URLs and try again."
            )
          )
        image.src = objectUrl
      })

      const canvas = document.createElement("canvas")
      canvas.width = 1080
      canvas.height = 1350

      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("PNG canvas is not available.")
      }

      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      const pngBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("PNG conversion failed.")),
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
    } catch (e) {
      console.error("Poster download error:", e)
      setNotice(e.message || "Could not download poster.")
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
      `📲 ${PHONE}\n📩 ${EMAIL}\n🌐 ${WEBSITE}\n\n` +
      `Team MEDPACT`

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    )

    setNotice(
      "WhatsApp opened with vacancy details. Download the PNG and attach it to your message."
    )
  }

  return (
    <main style={S.page}>
      <header style={S.header}>
        <div>
          <p style={S.eyebrow}>MEDPACT RECRUITMENT</p>

          <h1 style={S.title}>
            Single Requirement Poster Studio
          </h1>

          <p style={S.subtitle}>
            Select an open requirement and create a branded,
            share-ready vacancy poster.
          </p>
        </div>

        <button
          style={S.backButton}
          onClick={() => router.push("/")}
        >
          ← Dashboard
        </button>
      </header>

      <section style={S.layout}>
        <aside style={S.panel}>
          <div style={S.panelHeading}>
            <div>
              <h2 style={S.panelTitle}>
                1. Select requirement
              </h2>

              <p style={S.muted}>
                Only open requirements are listed.
              </p>
            </div>

            <button
              style={S.smallButton}
              onClick={loadRequirements}
            >
              Refresh
            </button>
          </div>

          <label style={S.label}>Vacancy</label>

          {loading && (
            <p style={S.muted}>Loading requirements...</p>
          )}

          {!loading && error && (
            <div style={S.error}>
              {error}
              <p>
                <button
                  style={S.smallButton}
                  onClick={loadRequirements}
                >
                  Try again
                </button>
              </p>
            </div>
          )}

          {!loading && !error && requirements.length === 0 && (
            <div style={S.empty}>
              No open requirements found. Add a requirement first.
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
            {requirements.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedId(String(r.id))
                  setNotice("")
                }}
                style={{
                  ...S.reqCard,
                  ...(String(selectedId) === String(r.id)
                    ? S.reqSelected
                    : {}),
                }}
              >
                <span
                  style={{
                    ...S.radioDot,
                    background:
                      String(selectedId) === String(r.id)
                        ? C.green
                        : "#fff",
                  }}
                >
                  {String(selectedId) === String(r.id) ? "✓" : ""}
                </span>

                <span style={{ minWidth: 0 }}>
                  <strong style={S.reqTitle}>
                    {r.specialty_name}
                  </strong>

                  <span style={S.reqSub}>
                    📍 {r.city || "Location not specified"}
                  </span>

                  <span style={S.reqMeta}>
                    {experienceText(r.experience_required)} ·{" "}
                    {r.positions || 1} position(s)
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div style={S.section}>
            <h2 style={S.panelTitle}>
              2. Choose visual style
            </h2>

            <p style={S.muted}>
              Automatic selects a design based on the specialty.
              You can override it below.
            </p>

            <label style={S.label}>Template</label>

            <select
              value={templateOverride}
              onChange={(e) =>
                setTemplateOverride(e.target.value)
              }
              style={S.select}
            >
              <option value="auto">
                Automatic — recommended for specialty
              </option>

              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {selectedRequirement && (
              <div style={S.templateHint}>
                <strong>
                  Suggested: {suggestedTemplate.name}
                </strong>

                <span>{suggestedTemplate.description}</span>

                {templateOverride !== "auto" && (
                  <span>
                    Manual override active: {activeTemplate.name}
                  </span>
                )}
              </div>
            )}

            <label style={S.salaryToggle}>
              <input
                type="checkbox"
                checked={includeSalary}
                onChange={(e) =>
                  setIncludeSalary(e.target.checked)
                }
              />
              Include salary on poster (off by default)
            </label>
          </div>

          {notice && <p style={S.notice}>{notice}</p>}
        </aside>

        <section style={S.panel}>
          <div style={S.panelHeading}>
            <div>
              <h2 style={S.panelTitle}>
                3. Poster preview
              </h2>

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
                alt="Medpact poster preview"
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
              style={{
                ...S.primary,
                ...(!selectedRequirement ? S.disabled : {}),
              }}
              disabled={!selectedRequirement}
              onClick={downloadPng}
            >
              ↓ Download PNG
            </button>

            <button
              style={{
                ...S.whatsapp,
                ...(!selectedRequirement ? S.disabled : {}),
              }}
              disabled={!selectedRequirement}
              onClick={shareWhatsApp}
            >
              Share vacancy on WhatsApp
            </button>
          </div>

          <p style={S.help}>
            WhatsApp opens a message draft. Attach the downloaded
            poster image manually, especially when posting to a
            Community announcement group.
          </p>

          <p style={S.privacy}>
            Poster excludes hospital name and qualification.
            Salary is hidden unless you enable it.
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
    letterSpacing: "-.7px",
  },

  subtitle: {
    color: "#64748B",
    margin: "8px 0 0",
    lineHeight: 1.6,
  },

  backButton: {
    padding: "11px 16px",
    background: "#fff",
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
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "clamp(14px, 2vw, 22px)",
    boxShadow: "0 5px 20px rgba(15, 50, 80, .035)",
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
    background: "#fff",
    color: C.navy,
    border: "1px solid #D9E4ED",
    borderRadius: 8,
    padding: "8px 11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  label: {
    display: "block",
    color: C.navy,
    fontWeight: 700,
    fontSize: 13,
    margin: "14px 0 8px",
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
    background: "#fff",
    cursor: "pointer",
  },

  reqSelected: {
    border: `2px solid ${C.green}`,
    background: "#F5FFF2",
  },

  radioDot: {
    display: "grid",
    placeItems: "center",
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: "50%",
    border: "1px solid #CBD5E1",
    color: "#fff",
    fontWeight: 900,
    fontSize: 13,
  },

  reqTitle: {
    display: "block",
    color: C.navy,
    fontSize: 14,
    marginBottom: 5,
  },

  reqSub: {
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

  select: {
    width: "100%",
    padding: 12,
    borderRadius: 9,
    border: "1px solid #D6E2EC",
    color: C.navy,
    background: "#fff",
    fontSize: 14,
  },

  templateHint: {
    display: "grid",
    gap: 6,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    background: C.pale,
    color: C.ink,
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
    color: C.ink,
  },

  posterFrame: {
    width: "100%",
    maxWidth: 540,
    margin: "0 auto",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #D9E4ED",
    background: "#fff",
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
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  whatsapp: {
    flex: "1 1 160px",
    padding: "12px 15px",
    background: C.green,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  disabled: {
    opacity: 0.45,
    cursor: "not-allowed",
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
    color: C.ink,
  },
}
