
"use client"

import Link from "next/link"

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
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
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
}

export default function RecruitmentHomePage() {
  return (
    <main style={styles.page}>
      <header
        style={{
          borderBottom: "1px solid #e8edf3",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            ...styles.container,
            minHeight: "82px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "25px",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "#10233f",
              textDecoration: "none",
            }}
          >
            medpact<span style={{ color: "#087e8b" }}>.</span>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "2px",
                color: "#65758b",
                marginTop: "3px",
              }}
            >
              DOCTORS NETWORK
            </div>
          </Link>

          <nav
            style={{
              display: "flex",
              gap: "22px",
              alignItems: "center",
              flexWrap: "wrap",
              fontSize: "14px",
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
            <Link href="/register" style={styles.button}>
              Join Medpact
            </Link>
          </nav>
        </div>
      </header>

      <section
        style={{
          background:
            "radial-gradient(circle at 85% 15%, #d9f5f0 0, transparent 35%), linear-gradient(120deg, #f5f9fd 0%, #ffffff 70%)",
          padding: "88px 0 78px",
        }}
      >
        <div
          style={{
            ...styles.container,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            alignItems: "center",
            gap: "48px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                background: "#dff5f1",
                color: "#087e8b",
                borderRadius: "30px",
                padding: "9px 14px",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              BUILT AROUND DOCTORS
            </div>

            <h1
              style={{
                fontSize: "clamp(40px, 5.5vw, 66px)",
                lineHeight: 1.08,
                letterSpacing: "-2.8px",
                margin: "25px 0 22px",
                maxWidth: "650px",
              }}
            >
              Your next career move starts with{" "}
              <span style={{ color: "#087e8b" }}>Medpact.</span>
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.8,
                color: "#5d6c80",
                maxWidth: "570px",
                marginBottom: "30px",
              }}
            >
              Discover medical career opportunities across India.
              Explore roles that match your specialty, experience and
              professional ambitions.
            </p>

            <div style={{ display: "flex", gap: "13px", flexWrap: "wrap" }}>
              <Link href="/vacancies" style={styles.button}>
                Explore Vacancies →
              </Link>

              <Link
                href="/register"
                style={{
                  ...styles.button,
                  background: "#ffffff",
                  color: "#10233f",
                  border: "1px solid #d8e1ea",
                }}
              >
                Register as a Doctor
              </Link>
            </div>

            <p
              style={{
                color: "#718096",
                fontSize: "12px",
                marginTop: "23px",
              }}
            >
              A dedicated recruitment platform for medical professionals.
            </p>
          </div>

          <div
            style={{
              background: "#102b46",
              borderRadius: "24px",
              padding: "30px",
              color: "#ffffff",
              boxShadow: "0 28px 65px rgba(16,43,70,0.17)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                color: "#8ce0d4",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "2px",
              }}
            >
              YOUR MEDICAL CAREER
            </div>

            <h2
              style={{
                fontSize: "32px",
                lineHeight: 1.25,
                margin: "18px 0 12px",
                letterSpacing: "-1px",
              }}
            >
              More opportunities.
              <br />
              More possibilities.
            </h2>

            <p style={{ color: "#c3d2e0", lineHeight: 1.7 }}>
              Find opportunities suited to your specialty and preferred
              location, and take the next step in your career.
            </p>

            {[
              ["01", "Explore medical opportunities"],
              ["02", "Connect your profile to your goals"],
              ["03", "Take the next step in your career"],
            ].map(([number, text]) => (
              <div
                key={number}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "17px 0",
                  borderTop: "1px solid rgba(255,255,255,0.13)",
                }}
              >
                <span
                  style={{
                    color: "#8ce0d4",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  {number}
                </span>
                <span style={{ fontSize: "14px" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "75px 0" }}>
        <div style={styles.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "30px",
            }}
          >
            <div>
              <p
                style={{
                  color: "#087e8b",
                  fontWeight: 800,
                  fontSize: "12px",
                  letterSpacing: "2px",
                }}
              >
                OPPORTUNITIES AWAIT
              </p>
              <h2 style={{ fontSize: "34px", margin: "10px 0" }}>
                Hot Vacancies
              </h2>
              <p style={{ color: "#718096", lineHeight: 1.7 }}>
                Explore current medical opportunities across India.
              </p>
            </div>

            <Link
              href="/vacancies"
              style={{
                color: "#087e8b",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Explore all vacancies →
            </Link>
          </div>

          <div
            style={{
              padding: "38px 24px",
              border: "1px dashed #cbd8e4",
              borderRadius: "16px",
              background: "#f8fafc",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Find your next opportunity</h3>
            <p style={{ color: "#718096", lineHeight: 1.7 }}>
              Current openings will appear here once the live vacancy feed
              is connected.
            </p>
            <Link href="/vacancies" style={styles.button}>
              Browse All Vacancies
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: "#f4f8fb", padding: "72px 0" }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", marginBottom: "38px" }}>
            <p
              style={{
                color: "#087e8b",
                fontWeight: 800,
                letterSpacing: "2px",
                fontSize: "12px",
              }}
            >
              THE MEDPACT ADVANTAGE
            </p>
            <h2 style={{ fontSize: "34px", margin: "12px 0" }}>
              Built for your next chapter
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
            }}
          >
            {[
              {
                number: "01",
                title: "Relevant Opportunities",
                description:
                  "Explore roles based on specialty, experience and location.",
              },
              {
                number: "02",
                title: "A Doctor-First Experience",
                description:
                  "A straightforward way to discover opportunities and register your interest.",
              },
              {
                number: "03",
                title: "Career Connections",
                description:
                  "Build your professional profile and take the next step in your medical career.",
              },
            ].map((item) => (
              <article
                key={item.number}
                style={{
                  padding: "27px",
                  borderRadius: "15px",
                  background: "#ffffff",
                  border: "1px solid #e5edf4",
                }}
              >
                <div
                  style={{
                    color: "#087e8b",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  {item.number}
                </div>
                <h3 style={{ fontSize: "19px", margin: "18px 0 10px" }}>
                  {item.title}
                </h3>
                <p style={{ color: "#718096", lineHeight: 1.8, margin: 0 }}>
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "65px 0" }}>
        <div
          style={{
            ...styles.container,
            background: "#087e8b",
            color: "#ffffff",
            padding: "38px",
            borderRadius: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "25px",
            flexWrap: "wrap",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: "620px" }}>
            <h2 style={{ fontSize: "30px", margin: "0 0 12px" }}>
              Ready for your next opportunity?
            </h2>
            <p style={{ color: "#e1f7f4", lineHeight: 1.7, margin: 0 }}>
              Register with Medpact and take the first step toward your next
              professional milestone.
            </p>
          </div>

          <Link
            href="/register"
            style={{
              ...styles.button,
              background: "#ffffff",
              color: "#102b46",
              whiteSpace: "nowrap",
            }}
          >
            Register Now →
          </Link>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid #e8edf3",
          padding: "28px 0",
        }}
      >
        <div
          style={{
            ...styles.container,
            display: "flex",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
            color: "#718096",
            fontSize: "13px",
          }}
        >
          <span>© {new Date().getFullYear()} Medpact. All rights reserved.</span>
          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            <Link href="/vacancies" style={{ color: "inherit" }}>Vacancies</Link>
            <Link href="/register" style={{ color: "inherit" }}>Doctor Registration</Link>
            <Link href="/contact" style={{ color: "inherit" }}>Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
