
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

const PAGE_SIZE = 12

const colors = {
  navy: "#102b46",
  teal: "#087e8b",
  text: "#24364b",
  muted: "#718096",
  border: "#e5edf4",
  background: "#f5f8fb",
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    color: colors.text,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: {
    width: "min(1160px, calc(100% - 36px))",
    margin: "0 auto",
  },
  button: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 17px",
    borderRadius: 9,
    background: colors.teal,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "13px 14px",
    border: `1px solid ${colors.border}`,
    borderRadius: 9,
    fontSize: 14,
    color: colors.text,
    background: "#fff",
    outlineColor: colors.teal,
  },
}

function formatDate(value) {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getLocation(vacancy) {
  return [vacancy.city, vacancy.state]
    .filter((value) => value && String(value).trim())
    .join(", ")
}

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true

    async function loadVacancies() {
      try {
        setLoading(true)
        setError("")

        // No limit parameter: load all records returned by the public API.
        const response = await fetch("/api/recruitment/vacancies", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Unable to load vacancies.")
        }

        const result = await response.json()

        if (!Array.isArray(result.vacancies)) {
          throw new Error("The vacancy response was not in the expected format.")
        }

        if (active) {
          setVacancies(result.vacancies)
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load vacancies.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadVacancies()

    return () => {
      active = false
    }
  }, [])

  const specialties = useMemo(() => {
    return [...new Set(
      vacancies
        .map((item) => item.specialty)
        .filter((value) => value && value !== "Not specified")
    )].sort((a, b) => a.localeCompare(b))
  }, [vacancies])

  const cities = useMemo(() => {
    return [...new Set(
      vacancies.map((item) => item.city).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b))
  }, [vacancies])

  const states = useMemo(() => {
    return [...new Set(
      vacancies.map((item) => item.state).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b))
  }, [vacancies])

  const filteredVacancies = useMemo(() => {
    const term = search.trim().toLowerCase()

    return vacancies.filter((item) => {
      const matchesSearch =
        !term ||
        [
          item.title,
          item.specialty,
          item.city,
          item.state,
        ].some((value) =>
          String(value || "").toLowerCase().includes(term)
        )

      const matchesSpecialty =
        !specialty || item.specialty === specialty

      const matchesCity =
        !city || item.city === city

      const matchesState =
        !state || item.state === state

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesCity &&
        matchesState
      )
    })
  }, [vacancies, search, specialty, city, state])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVacancies.length / PAGE_SIZE)
  )

  const currentPage = Math.min(page, totalPages)

  const visibleVacancies = filteredVacancies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function resetFilters() {
    setSearch("")
    setSpecialty("")
    setCity("")
    setState("")
    setPage(1)
  }

  function updateFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  return (
    <main style={styles.page}>
      <header style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div
          style={{
            ...styles.container,
            minHeight: 78,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 25,
              fontWeight: 800,
              letterSpacing: "-1px",
              color: colors.navy,
              textDecoration: "none",
            }}
          >
            medpact<span style={{ color: colors.teal }}>.</span>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: colors.muted,
                marginTop: 3,
              }}
            >
              DOCTORS NETWORK
            </div>
          </Link>

          <nav
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
              fontSize: 14,
            }}
          >
            <Link
              href="/vacancies"
              style={{
                color: colors.teal,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Find Jobs
            </Link>
            <Link
              href="/register"
              style={{ color: colors.text, textDecoration: "none" }}
            >
              Doctor Registration
            </Link>
            <Link
              href="/about"
              style={{ color: colors.text, textDecoration: "none" }}
            >
              About
            </Link>
            <Link href="/register" style={styles.button}>
              Join Medpact
            </Link>
          </nav>
        </div>
      </header>

      <section
        style={{
          background:
            "radial-gradient(circle at 85% 15%, #d9f5f0 0, transparent 35%), linear-gradient(120deg, #f2f7fb, #ffffff 75%)",
          padding: "58px 0 48px",
        }}
      >
        <div style={styles.container}>
          <Link
            href="/"
            style={{
              color: colors.teal,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ← Back to homepage
          </Link>

          <p
            style={{
              color: colors.teal,
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 2,
              marginTop: 28,
            }}
          >
            MEDICAL CAREER OPPORTUNITIES
          </p>

          <h1
            style={{
              color: colors.navy,
              fontSize: "clamp(34px, 5vw, 54px)",
              lineHeight: 1.12,
              letterSpacing: "-1.8px",
              margin: "12px 0",
            }}
          >
            Find your next opportunity.
          </h1>

          <p
            style={{
              maxWidth: 650,
              color: colors.muted,
              fontSize: 16,
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            Explore medical opportunities across India by specialty and
            location. Find a role that fits your professional goals.
          </p>
        </div>
      </section>

      <section style={{ padding: "34px 0 70px" }}>
        <div style={styles.container}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
              gap: 13,
              padding: 20,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              background: "#fff",
              boxShadow: "0 8px 28px rgba(16,43,70,0.045)",
              marginBottom: 28,
            }}
          >
            <label style={{ display: "block", fontSize: 12, fontWeight: 700 }}>
              Search vacancies
              <input
                value={search}
                onChange={(event) => updateFilter(setSearch, event.target.value)}
                placeholder="Specialty or location"
                style={{ ...styles.input, marginTop: 8 }}
              />
            </label>

            <label style={{ display: "block", fontSize: 12, fontWeight: 700 }}>
              Specialty
              <select
                value={specialty}
                onChange={(event) =>
                  updateFilter(setSpecialty, event.target.value)
                }
                style={{ ...styles.input, marginTop: 8 }}
              >
                <option value="">All specialties</option>
                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", fontSize: 12, fontWeight: 700 }}>
              City
              <select
                value={city}
                onChange={(event) => updateFilter(setCity, event.target.value)}
                style={{ ...styles.input, marginTop: 8 }}
              >
                <option value="">All cities</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", fontSize: 12, fontWeight: 700 }}>
              State
              <select
                value={state}
                onChange={(event) => updateFilter(setState, event.target.value)}
                style={{ ...styles.input, marginTop: 8 }}
              >
                <option value="">All states</option>
                {states.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "end",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  ...styles.button,
                  background: "#eef4f7",
                  color: colors.navy,
                  flex: 1,
                }}
              >
                Clear filters
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <h2
                style={{
                  color: colors.navy,
                  fontSize: 25,
                  margin: "0 0 7px",
                }}
              >
                Available Vacancies
              </h2>
              <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>
                {loading
                  ? "Loading vacancies…"
                  : `${filteredVacancies.length} opportunit${filteredVacancies.length === 1 ? "y" : "ies"} found`}
              </p>
            </div>

            <Link
              href="/register"
              style={{
                color: colors.teal,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Register as a doctor →
            </Link>
          </div>

          {loading && (
            <div
              style={{
                padding: 40,
                borderRadius: 14,
                background: colors.background,
                textAlign: "center",
                color: colors.muted,
              }}
            >
              Loading current vacancies…
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                padding: 25,
                border: "1px solid #fecaca",
                borderRadius: 14,
                background: "#fff7f7",
                color: "#991b1b",
              }}
            >
              <strong>We couldn't load vacancies.</strong>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={styles.button}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredVacancies.length === 0 && (
            <div
              style={{
                padding: 42,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                textAlign: "center",
                background: colors.background,
              }}
            >
              <h3 style={{ color: colors.navy }}>No matching vacancies found</h3>
              <p style={{ color: colors.muted, lineHeight: 1.7 }}>
                Try a different specialty or location, or clear your filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                style={styles.button}
              >
                Show all vacancies
              </button>
            </div>
          )}

          {!loading && !error && visibleVacancies.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: 18,
              }}
            >
              {visibleVacancies.map((vacancy) => (
                <article
                  key={vacancy.id}
                  style={{
                    padding: 23,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    boxShadow: "0 5px 20px rgba(16,35,63,0.035)",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignSelf: "flex-start",
                      padding: "6px 10px",
                      borderRadius: 20,
                      background: "#e6f7f4",
                      color: colors.teal,
                      fontSize: 11,
                      fontWeight: 800,
                      marginBottom: 15,
                    }}
                  >
                    MEDICAL OPPORTUNITY
                  </div>

                  <h3
                    style={{
                      color: colors.navy,
                      fontSize: 21,
                      lineHeight: 1.4,
                      margin: "0 0 12px",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {vacancy.title || "Medical Professional"}
                  </h3>

                  <p
                    style={{
                      color: colors.muted,
                      fontSize: 14,
                      lineHeight: 1.7,
                      margin: "0 0 17px",
                    }}
                  >
                    <span aria-hidden="true">📍 </span>
                    {getLocation(vacancy) || "Location to be confirmed"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 20,
                    }}
                  >
                    {vacancy.positions != null && vacancy.positions > 0 && (
                      <span
                        style={{
                          fontSize: 12,
                          color: colors.text,
                          background: colors.background,
                          padding: "7px 9px",
                          borderRadius: 7,
                        }}
                      >
                        {vacancy.positions} position
                        {vacancy.positions === 1 ? "" : "s"}
                      </span>
                    )}

                    {vacancy.experienceRequired != null &&
                      vacancy.experienceRequired >= 0 && (
                        <span
                          style={{
                            fontSize: 12,
                            color: colors.text,
                            background: colors.background,
                            padding: "7px 9px",
                            borderRadius: 7,
                          }}
                        >
                          {vacancy.experienceRequired} years experience
                        </span>
                      )}
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 15,
                      borderTop: `1px solid ${colors.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ color: colors.muted, fontSize: 12 }}>
                      {formatDate(vacancy.date)
                        ? `Listed ${formatDate(vacancy.date)}`
                        : "Current opening"}
                    </span>

                    <Link
                      href="/register"
                      style={{
                        color: colors.teal,
                        textDecoration: "none",
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      Register interest →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 35,
              }}
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                style={{
                  ...paginationButton,
                  opacity: currentPage === 1 ? 0.45 : 1,
                }}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((number) =>
                  number === 1 ||
                  number === totalPages ||
                  Math.abs(number - currentPage) <= 2
                )
                .map((number, index, numbers) => (
                  <span
                    key={`${number}-${index}`}
                    style={{ display: "contents" }}
                  >
                    {index > 0 && number - numbers[index - 1] > 1 && (
                      <span style={{ color: colors.muted }}>…</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(number)}
                      aria-current={currentPage === number ? "page" : undefined}
                      style={{
                        ...paginationButton,
                        background:
                          currentPage === number ? colors.teal : "#fff",
                        color:
                          currentPage === number ? "#fff" : colors.navy,
                        borderColor:
                          currentPage === number ? colors.teal : colors.border,
                      }}
                    >
                      {number}
                    </button>
                  </span>
                ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                style={{
                  ...paginationButton,
                  opacity: currentPage === totalPages ? 0.45 : 1,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>

      <footer
        style={{
          background: colors.navy,
          color: "#d2dfeb",
          padding: "30px 0",
        }}
      >
        <div
          style={{
            ...styles.container,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 15,
          }}
        >
          <div>
            <strong style={{ color: "#fff", fontSize: 20 }}>medpact.</strong>
            <p style={{ fontSize: 12, marginBottom: 0 }}>
              Medical career opportunities across India.
            </p>
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13 }}>
            <Link href="/" style={{ color: "inherit" }}>Home</Link>
            <Link href="/vacancies" style={{ color: "inherit" }}>Vacancies</Link>
            <Link href="/register" style={{ color: "inherit" }}>Doctor Registration</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

const paginationButton = {
  padding: "9px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  background: "#fff",
  color: colors.navy,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
}
