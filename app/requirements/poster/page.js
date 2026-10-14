
"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

const LOGO_URL = "/medpact-recruitment-logo.png"
const PHONE = "+91 95426 67667"
const EMAIL = "info@medpact.in"
const WEBSITE = "www.medpact.in"

const NAVY = "#073B67"
const BLUE = "#0878B9"
const GREEN = "#49AF35"
const PALE = "#EAF6FC"
const INK = "#153653"

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function displayValue(value, fallback = "Not specified") {
  return value === null || value === undefined || value === ""
    ? fallback
    : String(value)
}

function experienceText(value) {
  if (value === null || value === undefined || value === "") {
    return "Experience as per profile"
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

function makePosterSvg(type, requirements, includeSalary) {
  const single = type === "single"
  const W = 1080
  const H = 1350

  const selected = single ? requirements.slice(0, 1) : requirements.slice(0, 6)

  const title = single
    ? displayValue(selected[0]?.specialty_name, "Doctor")
    : "DOCTOR OPPORTUNITIES"

  const header = `
    <rect width="${W}" height="${H}" rx="32" fill="#ffffff"/>
    <rect width="${W}" height="22" fill="${GREEN}"/>
    <rect y="22" width="${W}" height="8" fill="${BLUE}"/>

    <image href="${LOGO_URL}" x="48" y="48" width="400" height="120" preserveAspectRatio="xMinYMid meet"/>

    <text x="1032" y="70" text-anchor="end" font-family="Arial,sans-serif"
      font-size="24" font-weight="700" fill="${NAVY}">TRUSTED NETWORK</text>
    <text x="1032" y="108" text-anchor="end" font-family="Arial,sans-serif"
      font-size="22" fill="${GREEN}">CAREER OPPORTUNITIES</text>

    <path d="M0 205 Q280 155 530 205 T1080 190 L1080 280 L0 280 Z" fill="${PALE}"/>
  `

  let body = ""

  if (single && selected.length) {
    const r = selected[0]
    const specialty = escapeXml(r.specialty_name || "Doctor")
    const city = escapeXml(displayValue(r.city, "Location not specified"))
    const qualification = escapeXml(displayValue(r.qualification, "As per specialty"))
    const experience = escapeXml(experienceText(r.experience_required))
    const facility = "Healthcare Facility"

    body = `
      <text x="58" y="250" font-family="Arial,sans-serif" font-size="36"
        font-weight="700" fill="${BLUE}">WE ARE</text>
      <text x="55" y="350" font-family="Arial,sans-serif" font-size="96"
        font-weight="900" fill="${GREEN}">HIRING</text>

      <rect x="48" y="380" width="984" height="154" rx="30" fill="${NAVY}"/>
      <text x="84" y="475" font-family="Arial,sans-serif" font-size="64"
        font-weight="800" fill="#ffffff">${specialty.length > 23 ? specialty.slice(0, 23) + "…" : specialty}</text>
      <text x="86" y="515" font-family="Arial,sans-serif" font-size="24"
        font-weight="600" fill="#BFE5FF">JOIN OUR HEALTHCARE NETWORK</text>

      <rect x="48" y="565" width="984" height="385" rx="28" fill="${PALE}"/>
      <circle cx="112" cy="645" r="34" fill="${BLUE}"/>
      <text x="112" y="657" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="32" font-weight="700" fill="#ffffff">✓</text>
      <text x="172" y="633" font-family="Arial,sans-serif" font-size="23"
        fill="${BLUE}" font-weight="700">QUALIFICATION</text>
      <text x="172" y="674" font-family="Arial,sans-serif" font-size="34"
        fill="${INK}" font-weight="700">${qualification.slice(0, 36)}</text>
      <line x1="172" y1="699" x2="970" y2="699" stroke="#B5D9EC" stroke-width="2"/>

      <circle cx="112" cy="752" r="34" fill="${BLUE}"/>
      <text x="112" y="764" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="32" font-weight="700" fill="#ffffff">+</text>
      <text x="172" y="742" font-family="Arial,sans-serif" font-size="23"
        fill="${BLUE}" font-weight="700">EXPERIENCE</text>
      <text x="172" y="784" font-family="Arial,sans-serif" font-size="34"
        fill="${INK}" font-weight="700">${escapeXml(experience)}</text>
      <line x1="172" y1="809" x2="970" y2="809" stroke="#B5D9EC" stroke-width="2"/>

      <circle cx="112" cy="863" r="34" fill="${GREEN}"/>
      <text x="112" y="875" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="32" font-weight="700" fill="#ffffff">⌖</text>
      <text x="172" y="852" font-family="Arial,sans-serif" font-size="23"
        fill="${BLUE}" font-weight="700">WORK LOCATION</text>
      <text x="172" y="895" font-family="Arial,sans-serif" font-size="34"
        fill="${INK}" font-weight="700">${city.slice(0, 35)}</text>

      ${includeSalary && salaryText(r) ? `
        <rect x="48" y="970" width="984" height="70" rx="20" fill="#EAF7E7"/>
        <text x="540" y="1014" text-anchor="middle" font-family="Arial,sans-serif"
          font-size="28" font-weight="700" fill="${GREEN}">Salary: ${escapeXml(salaryText(r))}</text>
      ` : ""}

      <rect x="48" y="${includeSalary && salaryText(r) ? 1060 : 970}" width="984" height="110" rx="24" fill="${GREEN}"/>
      <text x="540" y="${includeSalary && salaryText(r) ? 1105 : 1015}" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#ffffff">INTERESTED? LET'S CONNECT</text>
      <text x="540" y="${includeSalary && salaryText(r) ? 1145 : 1055}" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="24" fill="#ffffff">Share this opportunity or refer a colleague</text>
    `
  } else {
    const cards = selected.map((r, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const x = 48 + col * 500
      const y = 300 + row * 245
      const specialty = escapeXml(displayValue(r.specialty_name, "Doctor"))
      const city = escapeXml(displayValue(r.city, "Location not specified"))
      const qual = escapeXml(displayValue(r.qualification, "As per specialty"))
      const exp = escapeXml(experienceText(r.experience_required))
      const positions = escapeXml(displayValue(r.positions, "Multiple"))
      const salary = includeSalary ? salaryText(r) : ""

      return `
        <rect x="${x}" y="${y}" width="480" height="220" rx="24"
          fill="${index % 2 ? "#F2FAEF" : "#EFF8FD"}"
          stroke="${index % 2 ? "#B8E3AD" : "#B7DDF2"}" stroke-width="2"/>
        <rect x="${x}" y="${y}" width="12" height="220" rx="6" fill="${index % 2 ? GREEN : BLUE}"/>
        <text x="${x + 32}" y="${y + 47}" font-family="Arial,sans-serif"
          font-size="${specialty.length > 23 ? 24 : 29}" font-weight="800" fill="${NAVY}">${specialty.slice(0, 27)}</text>
        <rect x="${x + 330}" y="${y + 20}" width="125" height="38" rx="18" fill="${index % 2 ? "#D8F1D1" : "#D6ECFA"}"/>
        <text x="${x + 392}" y="${y + 46}" text-anchor="middle" font-family="Arial,sans-serif"
          font-size="19" font-weight="700" fill="${NAVY}">${positions} pos.</text>
        <text x="${x + 32}" y="${y + 91}" font-family="Arial,sans-serif"
          font-size="21" font-weight="700" fill="${GREEN}">⌖ ${city.slice(0, 30)}</text>
        <text x="${x + 32}" y="${y + 130}" font-family="Arial,sans-serif"
          font-size="19" fill="${INK}">Qualification: ${qual.slice(0, 25)}</text>
        <text x="${x + 32}" y="${y + 164}" font-family="Arial,sans-serif"
          font-size="19" fill="${INK}">Experience: ${exp.slice(0, 24)}</text>
        ${salary ? `<text x="${x + 32}" y="${y + 196}" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="${GREEN}">${escapeXml(salary).slice(0, 40)}</text>` : ""}
      `
    }).join("")

    body = `
      <text x="54" y="235" font-family="Arial,sans-serif" font-size="34"
        font-weight="700" fill="${BLUE}">CAREER OPPORTUNITIES</text>
      <text x="50" y="286" font-family="Arial,sans-serif" font-size="49"
        font-weight="900" fill="${NAVY}">DOCTOR HIRING</text>
      ${cards}
      <text x="540" y="1060" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="28" font-weight="700" fill="${GREEN}">YOUR NEXT CAREER MOVE STARTS HERE</text>
      <text x="540" y="1100" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="22" fill="${INK}">Interested or know a suitable candidate? Refer a colleague.</text>
    `
  }

  const footer = `
    <path d="M0 1180 Q270 1140 540 1180 T1080 1170 L1080 1350 L0 1350 Z" fill="${NAVY}"/>
    <rect x="48" y="1200" width="984" height="112" rx="22" fill="#ffffff"/>
    <text x="540" y="1232" text-anchor="middle" font-family="Arial,sans-serif"
      font-size="20" font-weight="700" fill="${GREEN}">CONTACT MEDPACT</text>
    <text x="540" y="1272" text-anchor="middle" font-family="Arial,sans-serif"
      font-size="27" font-weight="700" fill="${NAVY}">${PHONE}</text>
    <text x="540" y="1303" text-anchor="middle" font-family="Arial,sans-serif"
      font-size="20" fill="${INK}">${EMAIL}  |  ${WEBSITE}</text>
  `

  return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="${PALE}"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      ${header}
      ${body}
      ${footer}
    </svg>
  `
}

export default function PosterPage() {
  const router = useRouter()

  const [requirements, setRequirements] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [posterType, setPosterType] = useState("single")
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
      const [
        requirementsResult,
        specialtiesResult,
        hospitalsResult
      ] = await Promise.all([
        supabase.from("requirements").select("*").order("entry_date", { ascending: false }),
        supabase.from("specialties").select("id,name"),
        supabase.from("hospitals").select("id,hospital_name")
      ])

      if (requirementsResult.error) throw requirementsResult.error
      if (specialtiesResult.error) throw specialtiesResult.error
      if (hospitalsResult.error) throw hospitalsResult.error

      const specialtyMap = Object.fromEntries(
        (specialtiesResult.data || []).map(item => [String(item.id), item.name])
      )

      const hospitalMap = Object.fromEntries(
        (hospitalsResult.data || []).map(item => [String(item.id), item.hospital_name])
      )

      const mapped = (requirementsResult.data || [])
        .filter(r => !r.status || r.status === "open")
        .map(r => ({
          ...r,
          specialty_name: specialtyMap[String(r.specialty_id)] || "Doctor",
          hospital_name: hospitalMap[String(r.hospital_id)] || "",
          city: r.city || ""
        }))

      setRequirements(mapped)
    } catch (err) {
      console.error("Poster requirements load error:", err)
      setError(err.message || "Could not load requirements.")
    } finally {
      setLoading(false)
    }
  }

  const selectedRequirements = useMemo(
    () => requirements.filter(r => selectedIds.includes(String(r.id))),
    [requirements, selectedIds]
  )

  const effectiveRequirements = posterType === "single"
    ? selectedRequirements.slice(0, 1)
    : selectedRequirements.slice(0, 6)

  const svg = useMemo(() => {
    if (!effectiveRequirements.length) return ""
    return makePosterSvg(posterType, effectiveRequirements, includeSalary)
  }, [posterType, effectiveRequirements, includeSalary])

  const previewUrl = useMemo(() => {
    if (!svg) return ""
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }, [svg])

  function toggleRequirement(id) {
    const key = String(id)

    setSelectedIds(previous => {
      if (previous.includes(key)) {
        return previous.filter(item => item !== key)
      }

      if (posterType === "single") {
        return [key]
      }

      if (previous.length >= 6) {
        setNotice("A multiple-requirement poster supports up to 6 vacancies.")
        return previous
      }

      return [...previous, key]
    })

    setNotice("")
  }

  function changePosterType(type) {
    setPosterType(type)
    setSelectedIds(previous => type === "single" ? previous.slice(0, 1) : previous.slice(0, 6))
    setNotice("")
  }

  async function downloadPng() {
    if (!svg) {
      setNotice("Select at least one requirement first.")
      return
    }

    setNotice("Preparing your PNG poster...")

    try {
      const logoResponse = await fetch(LOGO_URL)

      if (!logoResponse.ok) {
        throw new Error(`Could not load the Medpact recruitment logo at ${LOGO_URL}`)
      }

      const logoBlob = await logoResponse.blob()
      const logoDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(logoBlob)
      })

      const exportSvg = svg.replaceAll(LOGO_URL, logoDataUrl)
      const svgBlob = new Blob([exportSvg], { type: "image/svg+xml;charset=utf-8" })
      const objectUrl = URL.createObjectURL(svgBlob)

      try {
        const image = new Image()

        await new Promise((resolve, reject) => {
          image.onload = resolve
          image.onerror = () => reject(new Error("Could not render poster image."))
          image.src = objectUrl
        })

        const canvas = document.createElement("canvas")
        canvas.width = 1080
        canvas.height = 1350

        const context = canvas.getContext("2d")

        if (!context) throw new Error("PNG canvas is not available.")

        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        const pngBlob = await new Promise((resolve, reject) => {
          canvas.toBlob(blob => {
            if (blob) resolve(blob)
            else reject(new Error("PNG conversion failed."))
          }, "image/png")
        })

        const pngUrl = URL.createObjectURL(pngBlob)
        const link = document.createElement("a")
        link.href = pngUrl
        link.download = `medpact-${posterType}-recruitment-poster.png`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(pngUrl)
      } finally {
        URL.revokeObjectURL(objectUrl)
      }

      setNotice("Poster downloaded successfully.")
    } catch (err) {
      console.error("Poster download error:", err)
      setNotice(err.message || "Could not download poster.")
    }
  }

  async function shareWhatsApp() {
    if (!svg) {
      setNotice("Select at least one requirement first.")
      return
    }

    const text = effectiveRequirements.map(r => {
      const salary = includeSalary && salaryText(r) ? `\nSalary: ${salaryText(r)}` : ""

      return `🩺 ${r.specialty_name} Vacancy | ${r.city || "Location to be confirmed"}\n` +
        `🎓 Qualification: ${r.qualification || "As per specialty"}\n` +
        `Experience: ${experienceText(r.experience_required)}${salary}`
    }).join("\n\n")

    const message = `${text}\n\n📲 ${PHONE}\n📩 ${EMAIL}\n🌐 ${WEBSITE}\n\nTeam MEDPACT 💙`

    try {
      await navigator.clipboard.writeText(message)
      setNotice("Vacancy text copied. Download the poster, then attach it in your WhatsApp Community announcement group.")
    } catch {
      setNotice("Download the poster and copy the contact details before sharing it to WhatsApp.")
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>MEDPACT RECRUITMENT</p>
          <h1 style={styles.title}>Recruitment Poster Studio</h1>
          <p style={styles.subtitle}>
            Create branded vacancy posters directly from your saved requirements.
          </p>
        </div>

        <button style={styles.backButton} onClick={() => router.push("/")}>
          ← Dashboard
        </button>
      </header>

      <section style={styles.typeGrid}>
        <button
          type="button"
          onClick={() => changePosterType("single")}
          style={{
            ...styles.typeCard,
            ...(posterType === "single" ? styles.typeSelected : {})
          }}
        >
          <span style={styles.typeIcon}>01</span>
          <span style={styles.typeTitle}>Single Requirement</span>
          <span style={styles.typeDescription}>
            One specialty, one location, one focused poster.
          </span>
        </button>

        <button
          type="button"
          onClick={() => changePosterType("multiple")}
          style={{
            ...styles.typeCard,
            ...(posterType === "multiple" ? styles.typeSelected : {})
          }}
        >
          <span style={styles.typeIcon}>06</span>
          <span style={styles.typeTitle}>Multiple Requirements</span>
          <span style={styles.typeDescription}>
            Combine up to six vacancies across different locations.
          </span>
        </button>
      </section>

      <section style={styles.workspace}>
        <div style={styles.selectorPanel}>
          <div style={styles.panelHeading}>
            <div>
              <h2 style={styles.panelTitle}>Select vacancies</h2>
              <p style={styles.panelSubtitle}>
                {posterType === "single"
                  ? "Select one open requirement."
                  : "Select up to six open requirements."}
              </p>
            </div>

            <button style={styles.refreshButton} onClick={loadRequirements}>
              Refresh
            </button>
          </div>

          <label style={styles.salaryToggle}>
            <input
              type="checkbox"
              checked={includeSalary}
              onChange={e => setIncludeSalary(e.target.checked)}
            />
            Include salary when available
          </label>

          {loading && <p style={styles.message}>Loading requirements...</p>}

          {!loading && error && (
            <div style={styles.error}>
              {error}
              <button style={styles.refreshButton} onClick={loadRequirements}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && requirements.length === 0 && (
            <div style={styles.empty}>
              <h3>No open requirements found</h3>
              <p>Add a requirement first, then return here to create its poster.</p>
              <button
                style={styles.primaryButton}
                onClick={() => router.push("/requirements/add")}
              >
                + Add Requirement
              </button>
            </div>
          )}

          {!loading && requirements.map(r => {
            const checked = selectedIds.includes(String(r.id))

            return (
              <button
                type="button"
                key={r.id}
                onClick={() => toggleRequirement(r.id)}
                style={{
                  ...styles.requirementCard,
                  ...(checked ? styles.requirementSelected : {})
                }}
              >
                <span style={{
                  ...styles.checkCircle,
                  background: checked ? GREEN : "#ffffff",
                  color: checked ? "#ffffff" : "#64748b"
                }}>
                  {checked ? "✓" : "+"}
                </span>

                <span style={styles.requirementContent}>
                  <strong style={styles.requirementName}>
                    {r.specialty_name}
                  </strong>
                  <span style={styles.requirementLocation}>
                    📍 {r.city || "Location not specified"}
                  </span>
                  <span style={styles.requirementMeta}>
                    {displayValue(r.experience_required, "Experience not specified")} years
                    {" · "}
                    {displayValue(r.positions, "Positions not specified")} position(s)
                  </span>
                </span>
              </button>
            )
          })}

          {notice && <p style={styles.notice}>{notice}</p>}
        </div>

        <div style={styles.previewPanel}>
          <div style={styles.panelHeading}>
            <div>
              <h2 style={styles.panelTitle}>Poster preview</h2>
              <p style={styles.panelSubtitle}>
                {effectiveRequirements.length
                  ? `${effectiveRequirements.length} requirement(s) selected`
                  : "Select a requirement to preview your poster."}
              </p>
            </div>
            <span style={styles.previewBadge}>1080 × 1350</span>
          </div>

          {previewUrl ? (
            <div style={styles.posterFrame}>
              <img
                src={previewUrl}
                alt="Medpact recruitment poster preview"
                style={styles.posterImage}
              />
            </div>
          ) : (
            <div style={styles.previewEmpty}>
              <span style={{ fontSize: 48 }}>✦</span>
              <h3>Your poster will appear here</h3>
              <p>Choose a vacancy from the list to get started.</p>
            </div>
          )}

          <div style={styles.actions}>
            <button
              style={styles.primaryButton}
              onClick={downloadPng}
              disabled={!effectiveRequirements.length}
            >
              ↓ Download PNG
            </button>

            <button
              style={styles.whatsappButton}
              onClick={shareWhatsApp}
              disabled={!effectiveRequirements.length}
            >
              Share to WhatsApp
            </button>
          </div>

          <p style={styles.helpText}>
            WhatsApp sharing opens a message draft. Attach the downloaded PNG
            manually in your Community announcement group.
          </p>
        </div>
      </section>
    </main>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f7fb",
    padding: "28px",
    color: INK,
    fontFamily: "Arial, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 28
  },
  eyebrow: {
    margin: "0 0 8px",
    color: GREEN,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2
  },
  title: {
    margin: 0,
    color: NAVY,
    fontSize: "clamp(25px, 4vw, 36px)",
    letterSpacing: "-1px"
  },
  subtitle: {
    color: "#64748b",
    margin: "9px 0 0",
    lineHeight: 1.6
  },
  backButton: {
    padding: "11px 16px",
    background: "#ffffff",
    border: "1px solid #dbe5ee",
    borderRadius: 9,
    color: NAVY,
    fontWeight: 700,
    cursor: "pointer"
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 16,
    marginBottom: 22
  },
  typeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 9,
    padding: 20,
    textAlign: "left",
    border: "1px solid #dbe5ee",
    borderRadius: 14,
    background: "#ffffff",
    cursor: "pointer"
  },
  typeSelected: {
    border: `2px solid ${GREEN}`,
    background: "#f7fff5",
    boxShadow: "0 5px 18px rgba(15, 70, 50, 0.08)"
  },
  typeIcon: {
    display: "grid",
    placeItems: "center",
    width: 42,
    height: 42,
    borderRadius: 12,
    background: PALE,
    color: BLUE,
    fontWeight: 900
  },
  typeTitle: {
    fontWeight: 800,
    color: NAVY,
    fontSize: 17
  },
  typeDescription: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.5
  },
  workspace: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 0.85fr) minmax(320px, 1.15fr)",
    alignItems: "start",
    gap: 22
  },
  selectorPanel: {
    minWidth: 0,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20
  },
  previewPanel: {
    minWidth: 0,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20
  },
  panelHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 18
  },
  panelTitle: {
    margin: 0,
    fontSize: 19,
    color: NAVY
  },
  panelSubtitle: {
    color: "#64748b",
    fontSize: 13,
    margin: "6px 0 0",
    lineHeight: 1.5
  },
  refreshButton: {
    background: "#ffffff",
    color: NAVY,
    border: "1px solid #dbe5ee",
    borderRadius: 7,
    padding: "8px 11px",
    cursor: "pointer",
    fontWeight: 700
  },
  salaryToggle: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "12px",
    marginBottom: 14,
    borderRadius: 8,
    background: "#f8fafc",
    fontSize: 13,
    color: INK
  },
  requirementCard: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    textAlign: "left",
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    cursor: "pointer"
  },
  requirementSelected: {
    border: `2px solid ${GREEN}`,
    background: "#f5fff2"
  },
  checkCircle: {
    display: "grid",
    placeItems: "center",
    width: 26,
    height: 26,
    flexShrink: 0,
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    fontWeight: 900
  },
  requirementContent: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0
  },
  requirementName: {
    color: NAVY,
    fontSize: 15
  },
  requirementLocation: {
    color: GREEN,
    fontSize: 13
  },
  requirementMeta: {
    color: "#64748b",
    fontSize: 12
  },
  posterFrame: {
    width: "100%",
    maxWidth: 540,
    margin: "0 auto",
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #dbe5ee",
    background: "#ffffff"
  },
  posterImage: {
    display: "block",
    width: "100%",
    height: "auto"
  },
  previewBadge: {
    whiteSpace: "nowrap",
    background: PALE,
    color: BLUE,
    padding: "7px 9px",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 800
  },
  previewEmpty: {
    minHeight: 340,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    border: "2px dashed #cbd5e1",
    borderRadius: 12,
    color: "#64748b",
    textAlign: "center",
    padding: 20
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },
  primaryButton: {
    flex: "1 1 160px",
    padding: "12px 15px",
    background: NAVY,
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontWeight: 800,
    cursor: "pointer"
  },
  whatsappButton: {
    flex: "1 1 160px",
    padding: "12px 15px",
    background: GREEN,
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontWeight: 800,
    cursor: "pointer"
  },
  helpText: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 0
  },
  message: {
    color: "#64748b",
    padding: 15
  },
  notice: {
    color: BLUE,
    fontSize: 13,
    lineHeight: 1.5,
    padding: 12,
    background: PALE,
    borderRadius: 8
  },
  error: {
    padding: 14,
    background: "#fff1f2",
    color: "#be123c",
    borderRadius: 8,
    lineHeight: 1.6
  },
  empty: {
    padding: 20,
    background: "#f8fafc",
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 1.6
  }
}
