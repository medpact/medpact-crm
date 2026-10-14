
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

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
    padding: "13px 21px",
    borderRadius: "9px",
    background: "#087e8b",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
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

export default function RecruitmentHomePage() {
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [vacancyError, setVacancyError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadVacancies() {
      try {
        const response = await fetch(
          "/api/recruitment/vacancies?limit=10",
          { cache: "no-store" }
        )

        if (!response.ok) throw new Error("Vacancies unavailable")

        const result = await response.json()

        if (active) {
          setVacancies(Array.isArray(result.vacancies) ? result.vacancies : [])
          setVacancyError(false)
        }
      } catch {
        if (active) setVacancyError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadVacancies()

    return () => {
      active = false
    }
  }, [])

  return (
    <main style={styles.page}>
   
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
      <Link href="/vacancies" style={{ color: "#34465e", textDecoration: "none" }}>
        Find Jobs
      </Link>
      <Link href="/register" style={{ color: "#34465e", textDecoration: "none" }}>
        Doctor Registration
      </Link>
      <Link href="/about" style={{ color: "#34465e", textDecoration: "none" }}>
        About
      </Link>
      <Link href="/contact" style={{ color: "#34465e", textDecoration: "none" }}>
        Contact
      </Link>
      <Link
        href="/register"
        style={{
          ...styles.button,
          padding: "12px 19px",
          borderRadius: 10,
          whiteSpace: "nowrap",
        }}
      >
        Join Medpact
      </Link>
    </nav>
  </div>
</header>


      <section style={{
        background: "radial-gradient(circle at 85% 15%, #d9f5f0 0, transparent 35%), linear-gradient(120deg, #f5f9fd, #fff 70%)",
        padding: "78px 0",
      }}>
        <div style={{
          ...styles.container,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          alignItems: "center",
          gap: 48,
        }}>
          <div>
            <span style={{
              display: "inline-block",
              background: "#dff5f1",
              color: "#087e8b",
              borderRadius: 30,
              padding: "9px 14px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1,
            }}>
              BUILT AROUND DOCTORS
            </span>

            <h1 style={{
              fontSize: "clamp(40px, 5.5vw, 66px)",
              lineHeight: 1.08,
              letterSpacing: "-2.8px",
              margin: "25px 0 22px",
            }}>
              Your next career move starts with{" "}
              <span style={{ color: "#087e8b" }}>Medpact.</span>
            </h1>

            <p style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: "#5d6c80",
              maxWidth: 570,
              marginBottom: 30,
            }}>
              Discover medical career opportunities across India.
              Explore roles that match your specialty, experience and
              professional ambitions.
            </p>

            <div style={{ display: "flex", gap: 13, flexWrap: "wrap" }}>
              <Link href="/vacancies" style={styles.button}>
                Explore Vacancies →
              </Link>
              <Link href="/register" style={{
                ...styles.button,
                background: "#fff",
                color: "#10233f",
                border: "1px solid #d8e1ea",
              }}>
                Register as a Doctor
              </Link>
            </div>
          </div>

          <div style={{
            background: "#102b46",
            borderRadius: 24,
            padding: 30,
            color: "#fff",
            boxShadow: "0 28px 65px rgba(16,43,70,0.17)",
          }}>
            <div style={{
              color: "#8ce0d4",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
            }}>
              YOUR MEDICAL CAREER
            </div>
            <h2 style={{
              fontSize: 32,
              lineHeight: 1.25,
              margin: "18px 0 12px",
            }}>
              More opportunities.
              <br />More possibilities.
            </h2>
            <p style={{ color: "#c3d2e0", lineHeight: 1.7 }}>
              Find opportunities suited to your specialty and preferred
              location, and take the next step in your career.
            </p>
            {[
              "Explore medical opportunities",
              "Discover roles by location",
              "Take the next step in your career",
            ].map((text, index) => (
              <div key={text} style={{
                display: "flex",
                gap: 14,
                padding: "17px 0",
                borderTop: "1px solid rgba(255,255,255,0.13)",
                fontSize: 14,
              }}>
                <span style={{ color: "#8ce0d4", fontWeight: 800 }}>
                  0{index + 1}
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "70px 0" }}>
        <div style={styles.container}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 28,
          }}>
            <div>
              <p style={{
                color: "#087e8b",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: 2,
              }}>
                FRESH OPPORTUNITIES
              </p>
              <h2 style={{ fontSize: 34, margin: "10px 0" }}>
                Hot Vacancies
              </h2>
              <p style={{ color: "#718096", lineHeight: 1.7 }}>
                Explore the latest openings across medical specialties.
              </p>
            </div>
            <Link href="/vacancies" style={{
              color: "#087e8b",
              textDecoration: "none",
              fontWeight: 800,
            }}>
              Explore all vacancies →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: "#718096" }}>Loading current vacancies…</p>
          ) : vacancyError ? (
            <div style={{
              padding: 24,
              border: "1px solid #f0c8c8",
              borderRadius: 14,
              color: "#9b2c2c",
            }}>
              Vacancies could not be loaded right now. Please try again shortly.
            </div>
          ) : vacancies.length === 0 ? (
            <div style={{
              padding: 30,
              background: "#f8fafc",
              borderRadius: 16,
              textAlign: "center",
            }}>
              No vacancies are currently available.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 18,
            }}>
              {vacancies.map((vacancy) => (
                <article key={vacancy.id} style={{
                  padding: 24,
                  border: "1px solid #e4ebf2",
                  borderRadius: 16,
                  background: "#fff",
                  boxShadow: "0 5px 20px rgba(16,35,63,0.035)",
                }}>
                  <div style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: 20,
                    background: "#e6f7f4",
                    color: "#087e8b",
                    fontSize: 11,
                    fontWeight: 800,
                    marginBottom: 15,
                  }}>
                    OPENING
                  </div>
                  <h3 style={{ fontSize: 21, margin: "0 0 10px" }}>
                    {vacancy.title}
                  </h3>
                  <p style={{
                    color: "#5d6c80",
                    margin: "0 0 17px",
                    lineHeight: 1.6,
                  }}>
                    <span aria-hidden="true">📍 </span>
                    {[vacancy.city, vacancy.state].filter(Boolean).join(", ") || "Location to be confirmed"}
                  </p>
                  <div style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    fontSize: 13,
                    color: "#52647a",
                    marginBottom: 20,
                  }}>
                    {vacancy.positions != null && vacancy.positions > 0 && (
                      <span>{vacancy.positions} position{vacancy.positions === 1 ? "" : "s"}</span>
                    )}
                    {vacancy.experienceRequired != null && vacancy.experienceRequired >= 0 && (
                      <span>· {vacancy.experienceRequired} years experience</span>
                    )}
                  </div>
                  <div style={{
                    paddingTop: 15,
                    borderTop: "1px solid #edf1f5",
                    color: "#7b8999",
                    fontSize: 12,
                  }}>
                    Listed {formatDate(vacancy.date)}

<div style={{ marginTop: 18 }}>
  <Link
    href="/register"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "9px 14px",
      borderRadius: 8,
      background: "#087e8b",
      color: "#fff",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    Apply →
  </Link>
</div>

                  </div>
                </article>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 35 }}>
            <Link href="/vacancies" style={styles.button}>
              View All Vacancies →
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: "#f4f8fb", padding: "70px 0" }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", marginBottom: 38 }}>
            <p style={{
              color: "#087e8b",
              fontWeight: 800,
              letterSpacing: 2,
              fontSize: 12,
            }}>
              THE MEDPACT ADVANTAGE
            </p>
            <h2 style={{ fontSize: 34, margin: "12px 0" }}>
              Built for your next chapter
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
          }}>
            {[
              ["Relevant Opportunities", "Explore roles based on specialty, experience and location."],
              ["A Doctor-First Experience", "A straightforward way to discover opportunities and register your interest."],
              ["Career Connections", "Build your professional profile and take the next step in your medical career."],
            ].map(([title, description], index) => (
              <article key={title} style={{
                padding: 27,
                borderRadius: 15,
                background: "#fff",
                border: "1px solid #e5edf4",
              }}>
                <div style={{ color: "#087e8b", fontWeight: 800, fontSize: 13 }}>
                  0{index + 1}
                </div>
                <h3 style={{ fontSize: 19, margin: "18px 0 10px" }}>{title}</h3>
                <p style={{ color: "#718096", lineHeight: 1.8, margin: 0 }}>
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 0" }}>
        <div style={{
          ...styles.container,
          boxSizing: "border-box",
          background: "#087e8b",
          color: "#fff",
          padding: 38,
          borderRadius: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 25,
          flexWrap: "wrap",
        }}>
          <div style={{ maxWidth: 620 }}>
            <h2 style={{ fontSize: 30, margin: "0 0 12px" }}>
              Ready for your next opportunity?
            </h2>
            <p style={{ color: "#e1f7f4", lineHeight: 1.7, margin: 0 }}>
              Register with Medpact and take the first step toward your next
              professional milestone.
            </p>
          </div>
          <Link href="/register" style={{
            ...styles.button,
            background: "#fff",
            color: "#102b46",
          }}>
            Register Now →
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #e8edf3", padding: "28px 0" }}>
        <div style={{
          ...styles.container,
          display: "flex",
          justifyContent: "space-between",
          gap: 15,
          flexWrap: "wrap",
          color: "#718096",
          fontSize: 13,
        }}>
          <span>© {new Date().getFullYear()} Medpact. All rights reserved.</span>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Link href="/vacancies" style={{ color: "inherit" }}>Vacancies</Link>
            <Link href="/register" style={{ color: "inherit" }}>Doctor Registration</Link>
            <Link href="/contact" style={{ color: "inherit" }}>Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
