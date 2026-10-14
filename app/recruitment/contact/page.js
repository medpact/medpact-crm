
"use client"

import Link from "next/link"
import { useState } from "react"

const C = {
  navy: "#102b46",
  teal: "#087e8b",
  text: "#24364b",
  muted: "#64748b",
  border: "#e2eaf0",
  pale: "#f3f8fb",
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #d8e2eb",
  borderRadius: 9,
  fontSize: 14,
  color: C.text,
  background: "#fff",
  outlineColor: C.teal,
}

function Field({ label, children, required = false }) {
  return (
    <label style={{ display: "block", minWidth: 0 }}>
      <span
        style={{
          display: "block",
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 700,
          color: C.text,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </span>
      {children}
    </label>
  )
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    enquiryType: "Hospital recruitment",
    message: "",
  })

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const subject = encodeURIComponent(
      "Medpact Website Enquiry - " + form.enquiryType
    )

    const body = encodeURIComponent(
      "Name: " + form.name +
      "\nOrganization / Hospital: " + (form.organization || "Not provided") +
      "\nEmail: " + form.email +
      "\nPhone: " + form.phone +
      "\nEnquiry Type: " + form.enquiryType +
      "\n\nMessage:\n" + form.message
    )

    window.location.href =
      "mailto:info@medpact.in?subject=" + subject + "&body=" + body
  }

  function contactWhatsApp() {
    const message = encodeURIComponent(
      "Hello Medpact, I would like to enquire about your doctor recruitment services."
    )

    window.open(
      "https://wa.me/919542667667?text=" + message,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: C.text,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* HEADER */}
      <header style={{ borderBottom: "1px solid " + C.border }}>
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
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <img
              src="/medpact-recruitment-logo.png"
              alt="Medpact Healthcare Private Limited"
              style={{
                display: "block",
                width: 190,
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Link>

          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Link href="/" style={navStyle}>Home</Link>
            <Link href="/vacancies" style={navStyle}>Find Jobs</Link>
            <Link href="/about" style={navStyle}>About Us</Link>
            <Link href="/contact" style={{ ...navStyle, color: C.teal }}>
              Contact
            </Link>
            <Link href="/register" style={primaryButton}>
              Join Medpact
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          background:
            "radial-gradient(circle at 85% 15%, #d7f2ed 0, transparent 32%), linear-gradient(120deg, #edf5fa, #fff 75%)",
          padding: "62px 0",
        }}
      >
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              color: C.teal,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              marginBottom: 15,
            }}
          >
            WE'RE HERE TO HELP
          </div>

          <h1
            style={{
              color: C.navy,
              fontSize: "clamp(36px, 5vw, 54px)",
              letterSpacing: "-1.7px",
              lineHeight: 1.15,
              maxWidth: 720,
              margin: "0 0 18px",
            }}
          >
            Let's start a conversation.
          </h1>

          <p
            style={{
              color: C.muted,
              fontSize: 16,
              lineHeight: 1.9,
              maxWidth: 690,
              margin: 0,
            }}
          >
            Whether you are a hospital looking for medical professionals
            or a doctor exploring your next career opportunity, we'd be
            happy to hear from you.
          </p>
        </div>
      </section>

      {/* CONTACT DETAILS AND FORM */}
      <section style={{ padding: "55px 0 75px" }}>
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 290px), 0.8fr))",
            gap: 28,
            alignItems: "start",
          }}
        >
          {/* LEFT CONTACT PANEL */}
          <div>
            <h2
              style={{
                color: C.navy,
                fontSize: 25,
                margin: "0 0 12px",
              }}
            >
              Contact Medpact
            </h2>

            <p
              style={{
                color: C.muted,
                fontSize: 14,
                lineHeight: 1.9,
                margin: "0 0 25px",
              }}
            >
              Reach out to discuss recruitment requirements, career
              opportunities or any questions about our services.
            </p>

            <div
              style={{
                display: "grid",
                gap: 15,
                marginBottom: 25,
              }}
            >
              <a
                href="mailto:info@medpact.in"
                style={contactCardStyle}
              >
                <div style={iconBoxStyle}>✉</div>
                <div>
                  <div style={smallLabelStyle}>EMAIL US</div>
                  <div style={contactValueStyle}>info@medpact.in</div>
                  <div style={smallDescriptionStyle}>
                    Send us your enquiry by email
                  </div>
                </div>
              </a>

              <a
                href="https://wa.me/919542667667?text=Hello%20Medpact%2C%20I%20would%20like%20to%20make%20an%20enquiry."
                target="_blank"
                rel="noreferrer"
                style={contactCardStyle}
              >
                <div
                  style={{
                    ...iconBoxStyle,
                    background: "#dcfce7",
                    color: "#15803d",
                  }}
                >
                  ☎
                </div>
                <div>
                  <div style={smallLabelStyle}>WHATSAPP / PHONE</div>
                  <div style={contactValueStyle}>+91 95426 67667</div>
                  <div style={smallDescriptionStyle}>
                    Message our team directly
                  </div>
                </div>
              </a>
            </div>

            <div
              style={{
                padding: 23,
                borderRadius: 13,
                background: C.pale,
                border: "1px solid " + C.border,
              }}
            >
              <h3
                style={{
                  color: C.navy,
                  fontSize: 17,
                  margin: "0 0 9px",
                }}
              >
                Are you a doctor?
              </h3>

              <p
                style={{
                  color: C.muted,
                  fontSize: 13,
                  lineHeight: 1.8,
                  margin: "0 0 17px",
                }}
              >
                Register your professional profile and explore
                medical vacancies across India.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/register" style={primaryButton}>
                  Register Now →
                </Link>

                <Link href="/vacancies" style={secondaryButton}>
                  Find Jobs
                </Link>
              </div>
            </div>
          </div>

          {/* ENQUIRY FORM */}
          <div
            style={{
              background: "#fff",
              border: "1px solid " + C.border,
              borderRadius: 16,
              padding: "clamp(22px, 4vw, 34px)",
              boxShadow: "0 15px 45px rgba(16,43,70,0.06)",
            }}
          >
            <div
              style={{
                color: C.teal,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                marginBottom: 10,
              }}
            >
              SEND AN ENQUIRY
            </div>

            <h2
              style={{
                color: C.navy,
                fontSize: 25,
                margin: "0 0 10px",
              }}
            >
              How can we help?
            </h2>

            <p
              style={{
                color: C.muted,
                fontSize: 13,
                lineHeight: 1.8,
                margin: "0 0 25px",
              }}
            >
              Share a few details and your email application will open
              with your enquiry prepared for info@medpact.in.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 19 }}>
                <Field label="I am contacting as" required>
                  <select
                    required
                    value={form.enquiryType}
                    onChange={(e) =>
                      updateField("enquiryType", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="Hospital recruitment">
                      Hospital / Healthcare Organization
                    </option>
                    <option value="Doctor enquiry">Doctor</option>
                    <option value="General enquiry">General Enquiry</option>
                  </select>
                </Field>

                <Field label="Your name" required>
                  <input
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Hospital / Organization">
                  <input
                    value={form.organization}
                    onChange={(e) =>
                      updateField("organization", e.target.value)
                    }
                    placeholder="Enter organization name (if applicable)"
                    style={inputStyle}
                  />
                </Field>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                    gap: 16,
                  }}
                >
                  <Field label="Email address" required>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@example.com"
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Phone number" required>
                    <input
                      required
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Enter contact number"
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <Field label="How can we help?" required>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder="For example, tell us about your doctor recruitment requirement or enquiry."
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      lineHeight: 1.7,
                    }}
                  />
                </Field>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: 15,
                    border: "none",
                    borderRadius: 9,
                    background: C.teal,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Prepare Email Enquiry →
                </button>

                <p
                  style={{
                    color: C.muted,
                    fontSize: 11,
                    lineHeight: 1.7,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  This form opens your default email application. It does
                  not send or store your details on the website.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: C.navy,
          color: "#d2dfeb",
          padding: "30px 0",
        }}
      >
        <div
          style={{
            width: "min(1160px, calc(100% - 36px))",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <img
              src="/medpact-recruitment-logo.png"
              alt="Medpact Healthcare Private Limited"
              style={{
                display: "block",
                width: 175,
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
                background: "#fff",
                borderRadius: 5,
                padding: 4,
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: 12, marginTop: 9 }}>
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
            <Link href="/" style={footerLinkStyle}>Home</Link>
            <Link href="/vacancies" style={footerLinkStyle}>Vacancies</Link>
            <Link href="/about" style={footerLinkStyle}>About Us</Link>
            <Link href="/register" style={footerLinkStyle}>Doctor Registration</Link>
          </div>

          <div style={{ fontSize: 12 }}>
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

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 17px",
  background: "#087e8b",
  color: "#fff",
  textDecoration: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
}

const secondaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 16px",
  background: "#fff",
  color: "#102b46",
  textDecoration: "none",
  border: "1px solid #d8e2eb",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
}

const contactCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: 15,
  padding: 18,
  border: "1px solid #e2eaf0",
  borderRadius: 12,
  textDecoration: "none",
  background: "#fff",
}

const iconBoxStyle = {
  width: 45,
  height: 45,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#dff3f0",
  color: "#087e8b",
  borderRadius: 11,
  fontSize: 21,
}

const smallLabelStyle = {
  color: "#64748b",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.2,
  marginBottom: 5,
}

const contactValueStyle = {
  color: "#102b46",
  fontSize: 15,
  fontWeight: 800,
  overflowWrap: "anywhere",
}

const smallDescriptionStyle = {
  color: "#64748b",
  fontSize: 12,
  marginTop: 5,
}

const footerLinkStyle = {
  color: "#d2dfeb",
  textDecoration: "none",
}
