
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../../../lib/supabase"

const C = {
  navy: "#102b46",
  teal: "#087e8b",
  text: "#24364b",
  muted: "#718096",
  border: "#e1e8ef",
  pale: "#f3f8fb",
}

const initialForm = {
  name: "",
  specialty_id: "",
  qualification: "",
  experience_years: "",
  phone: "",
  email: "",
  current_location: "",
  preferred_location: "",
  expected_ctc: "",
  availability_status: "available",
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: "#fff",
  color: C.text,
  fontSize: 14,
  outlineColor: C.teal,
}

function Field({ label, required, children, error, hint }) {
  return (
    <label style={{ display: "block", minWidth: 0 }}>
      <span
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 8,
          color: C.text,
        }}
      >
        {label} {required && <span style={{ color: "#c2413b" }}>*</span>}
      </span>
      {children}
      {hint && (
        <span style={{
          display: "block",
          color: C.muted,
          fontSize: 12,
          marginTop: 6,
          lineHeight: 1.5,
        }}>
          {hint}
        </span>
      )}
      {error && (
        <span role="alert" style={{
          display: "block",
          color: "#b91c1c",
          fontSize: 12,
          marginTop: 6,
        }}>
          {error}
        </span>
      )}
    </label>
  )
}

export default function DoctorRegistrationPage() {
  const [form, setForm] = useState(initialForm)
  const [specialties, setSpecialties] = useState([])
  const [loadingSpecialties, setLoadingSpecialties] = useState(true)
  const [specialtyError, setSpecialtyError] = useState("")
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let active = true

    async function loadSpecialties() {
      try {
        

        const { data, error } = await supabase
          .from("specialties")
          .select("id, name")
          .order("name", { ascending: true })

        if (error) throw error

        if (active) {
          setSpecialties(data || [])
          setSpecialtyError("")
        }
      } catch (error) {
        if (active) {
          setSpecialtyError(
            "Unable to load specialties. Please refresh and try again."
          )
        }
      } finally {
        if (active) setLoadingSpecialties(false)
      }
    }

    loadSpecialties()

    return () => {
      active = false
    }
  }, [])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: "" }))
    setMessage(null)
  }

  function validate() {
    const next = {}

    if (!form.name.trim()) {
      next.name = "Please enter your full name."
    }

    if (!form.specialty_id) {
      next.specialty_id = "Please select your specialty."
    }

    if (!form.qualification.trim()) {
      next.qualification = "Please enter your qualification."
    }

    if (
      form.experience_years === "" ||
      !Number.isFinite(Number(form.experience_years)) ||
      Number(form.experience_years) < 0 ||
      Number(form.experience_years) > 70
    ) {
      next.experience_years = "Enter experience between 0 and 70 years."
    }

    const phoneDigits = form.phone.replace(/\D/g, "")
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      next.phone = "Enter a valid phone number with 10–15 digits."
    }

    if (!form.email.trim()) {
      next.email = "Please enter your email address."
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      next.email = "Please enter a valid email address."
    }

    if (
      form.expected_ctc.trim() !== "" &&
      (!Number.isFinite(Number(form.expected_ctc)) ||
        Number(form.expected_ctc) < 0)
    ) {
      next.expected_ctc = "Enter a valid non-negative expected CTC."
    }

    if (!form.availability_status) {
      next.availability_status = "Please select your availability."
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage(null)

    if (!validate()) return

    if (!specialties.length) {
      setMessage({
        type: "error",
        text: "Specialties are unavailable. Please try again later.",
      })
      return
    }

    setSubmitting(true)

    try {
      

      const selectedSpecialty = specialties.find(
        (item) => String(item.id) === String(form.specialty_id)
      )

      if (!selectedSpecialty) {
        throw new Error("Please select a valid specialty.")
      }

      const payload = {
        name: form.name.trim(),
        specialty_id: Number(form.specialty_id),
        specialty: selectedSpecialty.name,
        qualification: form.qualification.trim(),
        experience_years: Number(form.experience_years),
        phone: form.phone.trim(),
        email: form.email.trim(),
        current_location: form.current_location.trim() || null,
        preferred_location: form.preferred_location.trim() || null,
        expected_ctc:
          form.expected_ctc.trim() === ""
            ? null
            : Number(form.expected_ctc),
        availability_status: form.availability_status,
        source: "Medpact Website",
      }

      const { error } = await supabase
        .from("doctors")
        .insert([payload])

      if (error) {
        console.error("Doctor registration failed:", error.message)
        throw new Error(
          "We could not save your registration. Please try again. If the problem continues, contact Medpact."
        )
      }

      setForm(initialForm)
      setErrors({})
      setMessage({
        type: "success",
        text: "Your registration has been submitted successfully. Thank you for registering with Medpact.",
      })
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Registration failed. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#fff",
      color: C.text,
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>
      <header style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          width: "min(1160px, calc(100% - 36px))",
          minHeight: 78,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          flexWrap: "wrap",
        }}>
          <Link href="/" style={{
            color: C.navy,
            textDecoration: "none",
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: "-1px",
          }}>
            medpact<span style={{ color: C.teal }}>.</span>
            <div style={{
              fontSize: 10,
              letterSpacing: 2,
              color: C.muted,
              marginTop: 3,
            }}>
              DOCTORS NETWORK
            </div>
          </Link>

          <Link href="/vacancies" style={{
            color: C.teal,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 700,
          }}>
            Explore Vacancies →
          </Link>
        </div>
      </header>

      <section style={{
        background: "radial-gradient(circle at 85% 15%, #d9f5f0 0, transparent 35%), linear-gradient(120deg, #f2f7fb, #fff 75%)",
        padding: "48px 0",
      }}>
        <div style={{
          width: "min(1160px, calc(100% - 36px))",
          margin: "0 auto",
        }}>
          <Link href="/" style={{
            color: C.teal,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
          }}>
            ← Home
          </Link>

          <p style={{
            color: C.teal,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 2,
            marginTop: 25,
          }}>
            JOIN THE MEDPACT NETWORK
          </p>

          <h1 style={{
            color: C.navy,
            fontSize: "clamp(34px, 5vw, 52px)",
            letterSpacing: "-1.7px",
            lineHeight: 1.15,
            margin: "10px 0",
          }}>
            Your next career move
            <br />
            starts with your profile.
          </h1>

          <p style={{
            maxWidth: 650,
            color: C.muted,
            fontSize: 16,
            lineHeight: 1.8,
            marginBottom: 0,
          }}>
            Share your professional details and location preferences to help
            Medpact connect you with relevant medical opportunities.
          </p>
        </div>
      </section>

      <section style={{ padding: "38px 0 75px" }}>
        <div style={{
          width: "min(900px, calc(100% - 36px))",
          margin: "0 auto",
        }}>
          <div style={{
            background: C.navy,
            color: "#fff",
            borderRadius: "16px 16px 0 0",
            padding: "25px 28px",
          }}>
            <div style={{
              color: "#8ce0d4",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
            }}>
              DOCTOR PROFILE
            </div>
            <h2 style={{ fontSize: 24, margin: "10px 0 7px" }}>
              Doctor Registration
            </h2>
            <p style={{
              color: "#d2dfeb",
              fontSize: 13,
              lineHeight: 1.7,
              margin: 0,
            }}>
              Fields marked * are required.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              border: `1px solid ${C.border}`,
              borderTop: "none",
              borderRadius: "0 0 16px 16px",
              padding: "28px",
              boxShadow: "0 12px 35px rgba(16,43,70,0.055)",
            }}
          >
            <h3 style={{ color: C.navy, marginTop: 0 }}>
              Personal information
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 20,
            }}>
              <Field label="Full name" required error={errors.name}>
                <input
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Dr. XXX XXXX"
                  style={inputStyle}
                />
              </Field>

              <Field label="Phone number" required error={errors.phone}>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="Enter contact number"
                  style={inputStyle}
                />
              </Field>

              <Field label="Email address" required error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </Field>
            </div>

            <hr style={{
              border: 0,
              borderTop: `1px solid ${C.border}`,
              margin: "30px 0",
            }} />

            <h3 style={{ color: C.navy }}>Professional details</h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 20,
            }}>
              <Field
                label="Specialty"
                required
                error={errors.specialty_id || specialtyError}
              >
                <select
                  value={form.specialty_id}
                  onChange={(event) => updateField("specialty_id", event.target.value)}
                  disabled={loadingSpecialties || specialties.length === 0}
                  style={inputStyle}
                >
                  <option value="">
                    {loadingSpecialties ? "Loading specialties..." : "Select specialty"}
                  </option>
                  {specialties.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Qualification"
                required
                error={errors.qualification}
                hint="Examples: MBBS, MD, MS, DNB, DM, MCh"
              >
                <input
                  value={form.qualification}
                  onChange={(event) => updateField("qualification", event.target.value)}
                  placeholder="Enter highest qualification"
                  style={inputStyle}
                />
              </Field>

              <Field
                label="Years of experience"
                required
                error={errors.experience_years}
              >
                <input
                  type="number"
                  min="0"
                  max="70"
                  step="1"
                  value={form.experience_years}
                  onChange={(event) => updateField("experience_years", event.target.value)}
                  placeholder="e.g. 5"
                  style={inputStyle}
                />
              </Field>

              <Field
                label="Availability"
                required
                error={errors.availability_status}
              >
                <select
                  value={form.availability_status}
                  onChange={(event) => updateField("availability_status", event.target.value)}
                  style={inputStyle}
                >
                  <option value="available">Available</option>
                  <option value="within_30_days">Available within 30 days</option>
                  <option value="within_60_days">Available within 60 days</option>
                  <option value="not_available">Not currently available</option>
                </select>
              </Field>
            </div>

            <hr style={{
              border: 0,
              borderTop: `1px solid ${C.border}`,
              margin: "30px 0",
            }} />

            <h3 style={{ color: C.navy }}>Location preferences</h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 20,
            }}>
              <Field
                label="Current location"
                hint="Optional — enter your current city or town."
              >
                <input
                  value={form.current_location}
                  onChange={(event) => updateField("current_location", event.target.value)}
                  placeholder="e.g. Hyderabad"
                  style={inputStyle}
                />
              </Field>

              <Field
                label="Preferred location"
                hint="Optional — enter the city or cities where you prefer to work."
              >
                <input
                  value={form.preferred_location}
                  onChange={(event) => updateField("preferred_location", event.target.value)}
                  placeholder="e.g. Vizag, Hyderabad"
                  style={inputStyle}
                />
              </Field>

              <Field
                label="Expected CTC (annual, ₹)"
                error={errors.expected_ctc}
                hint="Optional. Enter your expected annual compensation."
              >
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.expected_ctc}
                  onChange={(event) => updateField("expected_ctc", event.target.value)}
                  placeholder="e.g. 2400000"
                  style={inputStyle}
                />
              </Field>
            </div>

            <div style={{
              marginTop: 28,
              background: C.pale,
              borderRadius: 12,
              padding: 18,
            }}>
              <p style={{
                margin: 0,
                color: C.muted,
                fontSize: 13,
                lineHeight: 1.8,
              }}>
                By submitting this form, you agree that Medpact may use the
                information provided to manage your professional profile and
                contact you regarding relevant career opportunities.
              </p>
            </div>

            {message && (
              <div
                role="status"
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 10,
                  background: message.type === "success" ? "#ecfdf5" : "#fff1f2",
                  color: message.type === "success" ? "#166534" : "#9f1239",
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loadingSpecialties || specialties.length === 0}
              style={{
                display: "block",
                width: "100%",
                marginTop: 24,
                padding: 15,
                background: submitting ? "#7aaeb3" : C.teal,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                cursor: submitting ? "wait" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Register with Medpact →"}
            </button>

            <p style={{
              textAlign: "center",
              color: C.muted,
              fontSize: 12,
              lineHeight: 1.7,
              marginBottom: 0,
            }}>
              Looking for an opportunity?{" "}
              <Link href="/vacancies" style={{ color: C.teal, fontWeight: 700 }}>
                View vacancies
              </Link>
            </p>
          </form>
        </div>
      </section>

      <footer style={{
        background: C.navy,
        color: "#d2dfeb",
        padding: "28px 0",
      }}>
        <div style={{
          width: "min(1160px, calc(100% - 36px))",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 15,
          flexWrap: "wrap",
          fontSize: 13,
        }}>
          <span>© {new Date().getFullYear()} Medpact. All rights reserved.</span>
          <Link href="/vacancies" style={{ color: "inherit" }}>
            Explore Vacancies
          </Link>
        </div>
      </footer>
    </main>
  )
}
