
"use client"

import Link from "next/link"

const C = {
  navy: "#102b46",
  teal: "#087e8b",
  text: "#24364b",
  muted: "#64748b",
  border: "#e2eaf0",
  pale: "#f3f8fb",
}

const buttonPrimary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 22px",
  background: C.teal,
  color: "#fff",
  textDecoration: "none",
  borderRadius: 9,
  fontSize: 14,
  fontWeight: 700,
}

const buttonSecondary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "13px 21px",
  background: "#fff",
  color: C.navy,
  textDecoration: "none",
  border: "1px solid #d6e1e9",
  borderRadius: 9,
  fontSize: 14,
  fontWeight: 700,
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        color: C.teal,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 13,
      }}
    >
      {children}
    </div>
  )
}

function ValueCard({ icon, title, description }) {
  return (
    <div
      style={{
        padding: 25,
        border: "1px solid " + C.border,
        borderRadius: 14,
        background: "#fff",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e5f5f4",
          color: C.teal,
          borderRadius: 12,
          fontSize: 23,
          marginBottom: 20,
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          color: C.navy,
          fontSize: 18,
          margin: "0 0 10px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: C.muted,
          fontSize: 14,
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <main
      style={{
        background: "#fff",
        color: C.text,
        fontFamily: "Arial, Helvetica, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          borderBottom: "1px solid " + C.border,
          background: "#fff",
        }}
      >
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            minHeight: 78,
            margin: "0 auto",
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
              color: C.navy,
              textDecoration: "none",
              fontSize: 27,
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            medpact<span style={{ color: C.teal }}>.</span>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: C.muted,
                marginTop: 3,
              }}
            >
              DOCTORS NETWORK
            </div>
          </Link>

          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 21,
              flexWrap: "wrap",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Link href="/" style={navStyle}>
              Home
            </Link>
            <Link href="/vacancies" style={navStyle}>
              Find Jobs
            </Link>
            <Link href="/about" style={{ ...navStyle, color: C.teal }}>
              About Us
            </Link>
            <Link href="/contact" style={navStyle}>
              Contact
            </Link>
            <Link href="/register" style={buttonPrimary}>
              Join Medpact
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          background:
            "radial-gradient(circle at 88% 15%, #ccefe9 0, transparent 30%), linear-gradient(120deg, #edf5fa 0%, #ffffff 72%)",
          padding: "76px 0 70px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 45,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "#dff3f0",
                borderRadius: 30,
                color: "#086b74",
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 23,
              }}
            >
              <span>✦</span>
              HEALTHCARE RECRUITMENT
            </div>

            <h1
              style={{
                color: C.navy,
                fontSize: "clamp(37px, 5vw, 58px)",
                lineHeight: 1.12,
                letterSpacing: "-2px",
                margin: "0 0 22px",
                maxWidth: 650,
              }}
            >
              Connecting medical talent with the right opportunities.
            </h1>

            <p
              style={{
                color: C.muted,
                fontSize: 16,
                lineHeight: 1.9,
                maxWidth: 580,
                margin: "0 0 28px",
              }}
            >
              Medpact brings experience and a people-first approach to
              doctor recruitment. Since 2014, we have helped place over
              1,000 doctors across India, supporting medical professionals
              as they take their next career step.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link href="/register" style={buttonPrimary}>
                Register Your Profile →
              </Link>
              <Link href="/vacancies" style={buttonSecondary}>
                Explore Vacancies
              </Link>
            </div>

            <p
              style={{
                color: C.muted,
                fontSize: 12,
                marginTop: 18,
              }}
            >
              Opportunities for medical professionals across India.
            </p>
          </div>

          {/* EXPERIENCE CARD */}
          <div
            style={{
              position: "relative",
              padding: 12,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(210,225,235,0.9)",
              borderRadius: 24,
              boxShadow: "0 24px 65px rgba(16,43,70,0.09)",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(145deg, #102b46 0%, #164d65 100%)",
                borderRadius: 17,
                padding: "38px 30px",
                color: "#fff",
              }}
            >
              <div
                style={{
                  color: "#8ce0d4",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 2,
                }}
              >
                OUR TRACK RECORD
              </div>

              <div
                style={{
                  fontSize: "clamp(58px, 8vw, 82px)",
                  fontWeight: 800,
                  letterSpacing: "-4px",
                  lineHeight: 1.15,
                  marginTop: 16,
                }}
              >
                1,000+
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginTop: 7,
                }}
              >
                Doctors placed
              </div>

              <p
                style={{
                  color: "#d4e4ed",
                  fontSize: 14,
                  lineHeight: 1.8,
                  margin: "12px 0 28px",
                }}
              >
                A recruitment journey built around medical professionals
                and healthcare opportunities across India.
              </p>

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.18)",
                  paddingTop: 23,
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(140,224,212,0.14)",
                    color: "#8ce0d4",
                    borderRadius: 12,
                    fontSize: 23,
                  }}
                >
                  ◷
                </div>

                <div>
                  <div style={{ fontSize: 23, fontWeight: 800 }}>
                    Since 2014
                  </div>
                  <div
                    style={{
                      color: "#d4e4ed",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Healthcare recruitment experience
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section
        style={{
          borderBottom: "1px solid " + C.border,
          borderTop: "1px solid " + C.border,
          background: "#fff",
        }}
      >
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            padding: "25px 0",
            gap: 20,
          }}
        >
          {[
            ["2014", "Recruitment journey began"],
            ["1,000+", "Doctors placed"],
            ["India", "Nationwide reach"],
          ].map((item) => (
            <div
              key={item[0]}
              style={{
                textAlign: "center",
                padding: "8px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 25,
                  fontWeight: 800,
                  color: C.navy,
                }}
              >
                {item[0]}
              </div>
              <div
                style={{
                  color: C.muted,
                  fontSize: 13,
                  marginTop: 6,
                }}
              >
                {item[1]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "82px 0" }}>
        <div
          style={{
            width: "min(1000px, calc(100% - 36px))",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <SectionLabel>About Medpact</SectionLabel>

          <h2
            style={{
              color: C.navy,
              fontSize: "clamp(29px, 4vw, 42px)",
              letterSpacing: "-1px",
              lineHeight: 1.25,
              maxWidth: 780,
              margin: "0 auto 22px",
            }}
          >
            Recruitment is about people, not just positions.
          </h2>

          <p
            style={{
              color: C.muted,
              fontSize: 15,
              lineHeight: 2,
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            Every medical professional brings a unique combination of
            qualifications, clinical experience, career goals and
            personal preferences. Every healthcare organization has its
            own staffing needs and expectations. Medpact works to bring
            these two sides together by understanding requirements,
            identifying relevant opportunities and facilitating the
            recruitment process.
          </p>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section
        style={{
          padding: "72px 0",
          background: C.pale,
          borderTop: "1px solid " + C.border,
          borderBottom: "1px solid " + C.border,
        }}
      >
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 38 }}>
            <SectionLabel>Who We Serve</SectionLabel>

            <h2
              style={{
                color: C.navy,
                fontSize: "clamp(28px, 4vw, 39px)",
                letterSpacing: "-1px",
                margin: "0 0 14px",
              }}
            >
              Supporting both sides of healthcare recruitment
            </h2>

            <p
              style={{
                color: C.muted,
                fontSize: 15,
                lineHeight: 1.8,
                maxWidth: 670,
                margin: "0 auto",
              }}
            >
              Our focus is to help doctors explore suitable career
              opportunities and help healthcare organizations find
              professionals who match their requirements.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 22,
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid " + C.border,
                borderRadius: 16,
                padding: 30,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 18 }}>🩺</div>

              <h3
                style={{
                  color: C.navy,
                  fontSize: 22,
                  margin: "0 0 13px",
                }}
              >
                For Doctors
              </h3>

              <p
                style={{
                  color: C.muted,
                  fontSize: 14,
                  lineHeight: 1.9,
                  margin: "0 0 23px",
                }}
              >
                Build your professional profile, share your career
                preferences and explore medical vacancies that may suit
                your qualifications and experience.
              </p>

              <Link href="/register" style={textLinkStyle}>
                Register as a Doctor →
              </Link>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid " + C.border,
                borderRadius: 16,
                padding: 30,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 18 }}>🏥</div>

              <h3
                style={{
                  color: C.navy,
                  fontSize: 22,
                  margin: "0 0 13px",
                }}
              >
                For Hospitals
              </h3>

              <p
                style={{
                  color: C.muted,
                  fontSize: 14,
                  lineHeight: 1.9,
                  margin: "0 0 23px",
                }}
              >
                Share your medical staffing requirements and connect
                with a recruitment team that understands the importance
                of qualifications, experience and role suitability.
              </p>

              <Link href="/contact" style={textLinkStyle}>
                Discuss Your Requirements →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section style={{ padding: "82px 0" }}>
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 42 }}>
            <SectionLabel>Our Approach</SectionLabel>

            <h2
              style={{
                color: C.navy,
                fontSize: "clamp(29px, 4vw, 40px)",
                letterSpacing: "-1px",
                margin: "0 0 14px",
              }}
            >
              A clear, people-first process
            </h2>

            <p
              style={{
                color: C.muted,
                fontSize: 15,
                lineHeight: 1.8,
                maxWidth: 660,
                margin: "0 auto",
              }}
            >
              We focus on understanding the requirement and helping both
              doctors and healthcare organizations take the next step.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
              gap: 18,
            }}
          >
            <ValueCard
              icon="01"
              title="Understand"
              description="Understand the doctor's qualifications and career preferences, or the healthcare organization's staffing needs."
            />

            <ValueCard
              icon="02"
              title="Identify"
              description="Review relevant profiles and opportunities based on the role, specialty, experience and stated preferences."
            />

            <ValueCard
              icon="03"
              title="Connect"
              description="Facilitate communication between suitable candidates and healthcare organizations."
            />

            <ValueCard
              icon="04"
              title="Support"
              description="Help coordinate the recruitment process as candidates and organizations move through the next steps."
            />
          </div>
        </div>
      </section>

      {/* OUR PRINCIPLES */}
      <section
        style={{
          padding: "70px 0",
          background: "#f8fafc",
          borderTop: "1px solid " + C.border,
        }}
      >
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 35,
            alignItems: "center",
          }}
        >
          <div>
            <SectionLabel>What Matters to Us</SectionLabel>

            <h2
              style={{
                color: C.navy,
                fontSize: "clamp(29px, 4vw, 40px)",
                lineHeight: 1.25,
                letterSpacing: "-1px",
                margin: "0 0 18px",
              }}
            >
              Professional relationships built on clarity and trust.
            </h2>

            <p
              style={{
                color: C.muted,
                fontSize: 15,
                lineHeight: 1.9,
                margin: 0,
              }}
            >
              Recruitment decisions matter to doctors, healthcare
              organizations and the people they serve. We believe the
              process should respect professional experience, communicate
              requirements clearly and treat every profile with care.
            </p>
          </div>

          <div style={{ display: "grid", gap: 15 }}>
            {[
              {
                title: "Professional suitability",
                text: "Give due attention to qualifications, experience and the requirements of each role.",
              },
              {
                title: "Clear communication",
                text: "Help candidates and organizations understand role expectations and recruitment steps.",
              },
              {
                title: "Respect for individuals",
                text: "Treat doctors as professionals with their own career goals, preferences and decisions.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  gap: 15,
                  padding: 20,
                  border: "1px solid " + C.border,
                  background: "#fff",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#dff3f0",
                    color: C.teal,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>

                <div>
                  <h3
                    style={{
                      color: C.navy,
                      fontSize: 15,
                      margin: "2px 0 7px",
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      color: C.muted,
                      fontSize: 13,
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "72px 0" }}>
        <div
          style={{
            width: "min(1100px, calc(100% - 36px))",
            margin: "0 auto",
            padding: "clamp(28px, 5vw, 52px)",
            borderRadius: 20,
            background:
              "linear-gradient(120deg, #102b46 0%, #164e63 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 30,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 600 }}>
            <div
              style={{
                color: "#8ce0d4",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                marginBottom: 12,
              }}
            >
              TAKE THE NEXT STEP
            </div>

            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 38px)",
                lineHeight: 1.25,
                letterSpacing: "-1px",
                margin: "0 0 13px",
              }}
            >
              Your next opportunity starts with a conversation.
            </h2>

            <p
              style={{
                color: "#d2dfeb",
                fontSize: 14,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Whether you are a doctor exploring your next role or a
              healthcare organization with a recruitment requirement,
              Medpact invites you to connect with us.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minWidth: 190,
            }}
          >
            <Link
              href="/register"
              style={{
                ...buttonPrimary,
                background: "#8ce0d4",
                color: C.navy,
              }}
            >
              Register as a Doctor →
            </Link>

            <Link
              href="/contact"
              style={{
                ...buttonSecondary,
                background: "transparent",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.35)",
              }}
            >
              Contact Medpact
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: C.navy,
          color: "#d2dfeb",
          padding: "34px 0",
        }}
      >
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#fff",
                fontSize: 23,
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              medpact<span style={{ color: "#8ce0d4" }}>.</span>
            </div>
            <div style={{ fontSize: 12, marginTop: 7 }}>
              Healthcare recruitment across India
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
              fontSize: 13,
            }}
          >
            <Link href="/" style={footerLinkStyle}>
              Home
            </Link>
            <Link href="/vacancies" style={footerLinkStyle}>
              Vacancies
            </Link>
            <Link href="/register" style={footerLinkStyle}>
              Doctor Registration
            </Link>
            <Link href="/contact" style={footerLinkStyle}>
              Contact
            </Link>
          </div>

          <div style={{ fontSize: 12, color: "#b8c9d7" }}>
            © {new Date().getFullYear()} Medpact. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

const navStyle = {
  color: "#40566b",
  textDecoration: "none",
}

const textLinkStyle = {
  color: "#087e8b",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 800,
}

const footerLinkStyle = {
  color: "#d2dfeb",
  textDecoration: "none",
}
