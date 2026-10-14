
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

const WHATSAPP_NUMBER = "919542667667"
const PAGE_SIZE = 12

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    color: "#10233f",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: {
    width: "min(1160px, calc(100% - 40px))",
    margin: "0 auto",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 18px",
    borderRadius: 9,
    background: "#087e8b",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
}

function formatDate(date) {
  if (!date) return ""

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ""

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getWhatsAppLink(vacancy) {
  const location =
    [vacancy.city, vacancy.state].filter(Boolean).join(", ") ||
    "Location to be confirmed"

  const message = [
    "Hello Medpact,",
    "",
    "I would like to enquire about this vacancy listed on your website:",
    `Position: ${vacancy.title || "Not specified"}`,
    `Location: ${location}`,
    "",
    "Please share the hospital details, salary/package, duty timings and other relevant details.",
    "",
    "Thank you.",
  ].join("\n")

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function normalizeState(value) {
  if (!value || typeof value !== "string") return ""
  return value.trim().replace(/\s+/g, " ")
}

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedState, setSelectedState] = useState("All States")
  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState("All Specialties")
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true

    async function loadVacancies() {
      try {
        // Request the full vacancy list so state buttons are not
        // restricted to only the first few vacancies.
        const response = await fetch(
          "/api/recruitment/vacancies?limit=1000",
          { cache: "no-store" }
        )

        if (!response.ok) {
          throw new Error("Unable to load vacancies")
        }

        const result = await response.json()
        const rows = Array.isArray(result.vacancies)
          ? result.vacancies
          : []

        if (active) {
          setVacancies(rows)
          setError(false)
        }
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadVacancies()

    return () => {
      active = false
    }
  }, [])

  const states = useMemo(() => {
    const counts = new Map()

    vacancies.forEach((vacancy) => {
      const state = normalizeState(vacancy.state)
      if (!state) return

      const key = state.toLowerCase()
      const existing = counts.get(key)

      if (existing) {
        existing.count += 1
      } else {
        counts.set(key, { name: state, count: 1 })
      }
    })

    return Array.from(counts.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [vacancies])

  const specialties = useMemo(() => {
    return [
      ...new Set(
        vacancies
          .map((vacancy) => vacancy.specialty || vacancy.title)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b))
  }, [vacancies])

  const filteredVacancies = useMemo(() => {
    const query = search.trim().toLowerCase()

    return vacancies.filter((vacancy) => {
      const state = normalizeState(vacancy.state)
      const vacancySpecialty = vacancy.specialty || vacancy.title || ""

      const matchesState =
        selectedState === "All States" ||
        state.toLowerCase() === selectedState.toLowerCase()

      const matchesSpecialty =
        specialty === "All Specialties" ||
        vacancySpecialty.toLowerCase() === specialty.toLowerCase() ||
        (vacancy.title || "").toLowerCase() === specialty.toLowerCase()

      const searchableText = [
        vacancy.title,
        vacancy.specialty,
        vacancy.city,
        vacancy.state,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch = !query || searchableText.includes(query)

      return matchesState && matchesSpecialty && matchesSearch
    })
  }, [vacancies, selectedState, specialty, search])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVacancies.length / PAGE_SIZE)
  )

  const visibleVacancies = filteredVacancies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  function changeState(state) {
    setSelectedState(state)
    setPage(1)
  }

  function changeSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function changeSpecialty(value) {
    setSpecialty(value)
    setPage(1)
  }

  return (
    <main style={styles.page}>
      {/* CONSISTENT MEDPACT HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #e8edf3",
        }}
      >
        <div
          style={{
            ...styles.container,
            minHeight: 88,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            paddingTop: 10,
            paddingBottom: 10,
            boxSizing: "border-box",
          }}
        >
          <Link
            href="/"
            aria-label="Medpact Doctors Network home"
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <img
              src="/medpact-recruitment-logo.png"
              alt="Medpact Healthcare Private Limited"
              style={{
                display: "block",
                width: "clamp(165px, 19vw, 225px)",
                maxWidth: "100%",
                height: "auto",
                maxHeight: 68,
                objectFit: "contain",
              }}
            />
          </Link>

          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(12px, 2vw, 26px)",
              flexWrap: "wrap",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Link
              href="/vacancies"
              style={{ color: "#087e8b", textDecoration: "none" }}
            >
              Find Jobs
            </Link>

            <Link
              href="/register"
              style={{ color: "#34465e", textDecoration: "none" }}
            >
              Doctor Registration
            </Link>

            <Link
              href="/about"
              style={{ color: "#34465e", textDecoration: "none" }}
            >
              About
            </Link>

            <Link
              href="/contact"
              style={{ color: "#34465e", textDecoration: "none" }}
            >
              Contact
            </Link>

            <Link
              href="/register"
              style={{ ...styles.button, padding: "11px 16px" }}
            >
              Join Medpact
            </Link>
          </nav>
        </div>
      </header>

      {/* PAGE INTRODUCTION */}
      <section
        style={{
          background:
            "radial-gradient(circle at 85% 15%, #d9f5f0 0, transparent 35%), linear-gradient(120deg, #f5f9fd, #fff 70%)",
          padding: "54px 0 42px",
        }}
      >
        <div style={styles.container}>
          <p
            style={{
              color: "#087e8b",
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            MEDPACT CAREER OPPORTUNITIES
          </p>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              margin: "0 0 14px",
            }}
          >
            Find Doctor Vacancies Across India
          </h1>

          <p
            style={{
              color: "#5d6c80",
              fontSize: 16,
              lineHeight: 1.8,
              maxWidth: 760,
              margin: 0,
            }}
          >
            Explore openings by state, speciality or city. Contact Medpact
            directly on WhatsApp to learn more about a position.
          </p>
        </div>
      </section>

      {/* STATE SELECTOR */}
      <section style={{ padding: "30px 0 15px" }}>
        <div style={styles.container}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 23, margin: "0 0 8px" }}>
              Browse by State
            </h2>

            <p
              style={{
                color: "#718096",
                margin: 0,
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              States are listed only when the vacancy data includes a state
              and vacancies are available for it.
            </p>
          </div>

          {loading ? (
            <p style={{ color: "#718096" }}>Loading available states…</p>
          ) : states.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => changeState("All States")}
                style={{
                  ...styles.button,
                  background:
                    selectedState === "All States" ? "#087e8b" : "#f0f5f8",
                  color:
                    selectedState === "All States" ? "#fff" : "#34465e",
                }}
              >
                All States ({vacancies.length})
              </button>

              {states.map((item) => {
                const active =
                  selectedState.toLowerCase() === item.name.toLowerCase()

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => changeState(item.name)}
                    style={{
                      ...styles.button,
                      background: active ? "#087e8b" : "#f0f5f8",
                      color: active ? "#fff" : "#34465e",
                    }}
                  >
                    {item.name} ({item.count})
                  </button>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                padding: 16,
                background: "#fff8e8",
                border: "1px solid #f2dfb2",
                borderRadius: 12,
                color: "#795b20",
                lineHeight: 1.7,
                fontSize: 14,
              }}
            >
              State buttons will appear when state names are available in the
              vacancy data. The current API may be returning blank state
              values, so its data source may need to be updated to retrieve
              the state associated with each vacancy.
            </div>
          )}
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section style={{ padding: "22px 0 32px" }}>
        <div style={styles.container}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              padding: 20,
              background: "#f5f8fb",
              border: "1px solid #e5edf4",
              borderRadius: 16,
            }}
          >
            <div>
              <label
                htmlFor="vacancy-search"
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                Search vacancies
              </label>

              <input
                id="vacancy-search"
                type="search"
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
                placeholder="Speciality or city"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border: "1px solid #d5dfe8",
                  borderRadius: 9,
                  fontSize: 14,
                  background: "#fff",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="specialty-filter"
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                Speciality
              </label>

              <select
                id="specialty-filter"
                value={specialty}
                onChange={(event) => changeSpecialty(event.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border: "1px solid #d5dfe8",
                  borderRadius: 9,
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                <option value="All Specialties">All Specialties</option>

                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* VACANCY RESULTS */}
      <section style={{ padding: "0 0 70px" }}>
        <div style={styles.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <div>
              <h2 style={{ fontSize: 27, margin: "0 0 6px" }}>
                {selectedState === "All States"
                  ? "Available Vacancies"
                  : `Vacancies in ${selectedState}`}
              </h2>

              <p style={{ color: "#718096", margin: 0, fontSize: 14 }}>
                {filteredVacancies.length} vacancy
                {filteredVacancies.length === 1 ? "" : " listings"} found
              </p>
            </div>

            {(selectedState !== "All States" ||
              search ||
              specialty !== "All Specialties") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedState("All States")
                  setSearch("")
                  setSpecialty("All Specialties")
                  setPage(1)
                }}
                style={{
                  background: "#fff",
                  border: "1px solid #d5dfe8",
                  color: "#34465e",
                  padding: "10px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <p style={{ color: "#718096" }}>Loading current vacancies…</p>
          ) : error ? (
            <div
              style={{
                padding: 24,
                border: "1px solid #f0c8c8",
                borderRadius: 14,
                color: "#9b2c2c",
              }}
            >
              Vacancies could not be loaded right now. Please try again shortly.
            </div>
          ) : visibleVacancies.length === 0 ? (
            <div
              style={{
                padding: 32,
                background: "#f8fafc",
                border: "1px solid #e5edf4",
                borderRadius: 16,
                textAlign: "center",
              }}
            >
              <h3 style={{ marginTop: 0 }}>No matching vacancies found</h3>

              <p style={{ color: "#718096", lineHeight: 1.7 }}>
                Try another state, speciality or city to see more opportunities.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSelectedState("All States")
                  setSearch("")
                  setSpecialty("All Specialties")
                  setPage(1)
                }}
                style={styles.button}
              >
                View All Vacancies
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: 18,
              }}
            >
              {visibleVacancies.map((vacancy) => {
                const location =
                  [vacancy.city, vacancy.state].filter(Boolean).join(", ") ||
                  "Location to be confirmed"

                return (
                  <article
                    key={vacancy.id}
                    style={{
                      padding: 24,
                      border: "1px solid #e4ebf2",
                      borderRadius: 16,
                      background: "#fff",
                      boxShadow: "0 5px 20px rgba(16,35,63,0.035)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        alignSelf: "flex-start",
                        padding: "6px 10px",
                        borderRadius: 20,
                        background: "#e6f7f4",
                        color: "#087e8b",
                        fontSize: 11,
                        fontWeight: 800,
                        marginBottom: 15,
                      }}
                    >
                      OPENING
                    </div>

                    <h3
                      style={{
                        fontSize: 21,
                        lineHeight: 1.4,
                        margin: "0 0 12px",
                      }}
                    >
                      {vacancy.title}
                    </h3>

                    <p
                      style={{
                        color: "#5d6c80",
                        margin: "0 0 17px",
                        lineHeight: 1.6,
                      }}
                    >
                      <span aria-hidden="true">📍 </span>
                      {location}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        fontSize: 13,
                        color: "#52647a",
                        marginBottom: 20,
                      }}
                    >
                      {vacancy.positions != null && vacancy.positions > 0 && (
                        <span>
                          {vacancy.positions} position
                          {vacancy.positions === 1 ? "" : "s"}
                        </span>
                      )}

                      {vacancy.experienceRequired != null &&
                        vacancy.experienceRequired >= 0 && (
                          <span>
                            · {vacancy.experienceRequired} years experience
                          </span>
                        )}
                    </div>

                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: 15,
                        borderTop: "1px solid #edf1f5",
                        color: "#7b8999",
                        fontSize: 12,
                      }}
                    >
                      Listed {formatDate(vacancy.date)}

                      <div style={{ marginTop: 18 }}>
                        <a
                          href={getWhatsAppLink(vacancy)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            ...styles.button,
                            background: "#16834a",
                            padding: "10px 14px",
                            fontSize: 13,
                          }}
                        >
                          Enquire on WhatsApp →
                        </a>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* PAGINATION */}
          {!loading && !error && filteredVacancies.length > PAGE_SIZE && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 32,
              }}
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1))
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                style={{
                  ...styles.button,
                  background: page <= 1 ? "#e8edf2" : "#087e8b",
                  color: page <= 1 ? "#8290a0" : "#fff",
                }}
              >
                ← Previous
              </button>

              <span style={{ color: "#52647a", fontSize: 14 }}>
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                style={{
                  ...styles.button,
                  background: page >= totalPages ? "#e8edf2" : "#087e8b",
                  color: page >= totalPages ? "#8290a0" : "#fff",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* REGISTRATION CTA */}
      <section style={{ padding: "0 0 60px" }}>
        <div
          style={{
            ...styles.container,
            boxSizing: "border-box",
            background: "#087e8b",
            color: "#fff",
            padding: 32,
            borderRadius: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 22,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 650 }}>
            <h2 style={{ fontSize: 27, margin: "0 0 10px" }}>
              Stay connected with Medpact
            </h2>

            <p style={{ color: "#e1f7f4", lineHeight: 1.7, margin: 0 }}>
              Register your doctor profile to connect with our recruitment team
              and discover future opportunities.
            </p>
          </div>

          <Link
            href="/register"
            style={{
              ...styles.button,
              background: "#fff",
              color: "#102b46",
            }}
          >
            Register as a Doctor →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #e8edf3", padding: "28px 0" }}>
        <div
          style={{
            ...styles.container,
            display: "flex",
            justifyContent: "space-between",
            gap: 15,
            flexWrap: "wrap",
            color: "#718096",
            fontSize: 13,
          }}
        >
          <span>
            © {new Date().getFullYear()} Medpact. All rights reserved.
          </span>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Link href="/vacancies" style={{ color: "inherit" }}>
              Vacancies
            </Link>

            <Link href="/register" style={{ color: "inherit" }}>
              Doctor Registration
            </Link>

            <Link href="/contact" style={{ color: "inherit" }}>
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
