"use client"

import { useEffect, useState } from "react"

const empty = {
  name: "",
  slug: "",
  city: "",
  state: "",
  hospital_type: "",
  accreditations: "",
  key_specialties: "",
  key_procedures: "",
  international_patient_services: "",
  address: "",
  website: "",
  airport_information: "",
  description: "",
  featured: false,
  verified: false,
  is_published: false,
  images: [],
}

function toSlug(v) {
  return String(v || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function csv(v) {
  return String(v || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
}

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [photos, setPhotos] = useState([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)

    try {
      const r = await fetch("/api/medicalneeds/admin/hospitals")
      const d = await r.json()

      if (!r.ok) {
        throw new Error(d.error)
      }

      setHospitals(d.hospitals || [])
    } catch (e) {
      setStatus(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function save(e) {
    e.preventDefault()

    setStatus("Saving…")

    try {
      const payload = {
        ...form,
        slug: form.slug || toSlug(form.name),
        accreditations: csv(form.accreditations),
        key_specialties: csv(form.key_specialties),
        key_procedures: csv(form.key_procedures),
      }

      const fd = new FormData()

      fd.set("fields", JSON.stringify(payload))

      if (editing) {
        fd.set("id", editing)
      }

      photos.forEach((p) => {
        fd.append("photos", p)
      })

      const r = await fetch(
        "/api/medicalneeds/admin/hospitals",
        {
          method: editing ? "PUT" : "POST",
          body: fd,
        }
      )

      const d = await r.json()

      if (!r.ok) {
        throw new Error(d.error)
      }

      setStatus("Saved successfully.")
      setForm(empty)
      setEditing(null)
      setPhotos([])

      await load()
    } catch (err) {
      setStatus(
        err.message || "Unable to save hospital."
      )
    }
  }

  function edit(h) {
    setEditing(h.id)

    setForm({
      ...empty,
      ...h,
      accreditations: (h.accreditations || []).join(", "),
      key_specialties: (h.key_specialties || []).join(", "),
      key_procedures: (h.key_procedures || []).join(", "),
    })

    setPhotos([])

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(empty)
    setPhotos([])
    setStatus("")
  }

  async function remove(id) {
    if (!confirm("Delete this hospital profile?")) {
      return
    }

    const r = await fetch(
      "/api/medicalneeds/admin/hospitals",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    )

    const d = await r.json()

    if (!r.ok) {
      setStatus(d.error)
    } else {
      await load()
    }
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <small style={styles.eyebrow}>
            MEDPACT CARE · INTERNAL
          </small>

          <h1 style={styles.title}>
            Hospital Directory
          </h1>

          <p style={styles.subtitle}>
            Add, verify and publish hospital profiles.
          </p>
        </div>
      </header>

      <form onSubmit={save} style={styles.form}>
        <div style={styles.formHead}>
          <div>
            <b style={styles.formTitle}>
              {editing ? "Edit hospital" : "Add hospital"}
            </b>

            {status && (
              <span style={styles.status}>
                {status}
              </span>
            )}
          </div>
        </div>

        <div style={styles.grid}>

          {/* BASIC DETAILS */}

          <Field
            label="Hospital name *"
            value={form.name}
            onChange={(value) =>
              updateField("name", value)
            }
            required
          />

          <Field
            label="Profile slug (optional)"
            value={form.slug}
            onChange={(value) =>
              updateField("slug", value)
            }
            placeholder="hospital-name-city"
          />

          <Field
            label="City"
            value={form.city}
            onChange={(value) =>
              updateField("city", value)
            }
          />

          <Field
            label="State"
            value={form.state}
            onChange={(value) =>
              updateField("state", value)
            }
          />

          <Field
            label="Hospital type"
            value={form.hospital_type}
            onChange={(value) =>
              updateField("hospital_type", value)
            }
            placeholder="Multi-specialty / Super-specialty"
          />

          <Field
            label="Website"
            value={form.website}
            onChange={(value) =>
              updateField("website", value)
            }
            placeholder="https://..."
          />

          {/* ACCREDITATION */}

          <Field
            label="Accreditations"
            value={form.accreditations}
            onChange={(value) =>
              updateField("accreditations", value)
            }
            placeholder="NABH, JCI"
          />

          {/* PHOTOS */}

          <label style={styles.label}>
            Hospital photos

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setPhotos(
                  Array.from(
                    e.target.files || []
                  )
                )
              }
              style={styles.fileInput}
            />

            {photos.length > 0 && (
              <small style={styles.fileInfo}>
                {photos.length} photo
                {photos.length === 1 ? "" : "s"} selected
              </small>
            )}
          </label>

          {/* SPECIALTIES */}

          <TextAreaField
            label="Key specialties"
            value={form.key_specialties}
            onChange={(value) =>
              updateField(
                "key_specialties",
                value
              )
            }
            placeholder={
              "Diabetes, Endocrinology, Cardiology, Nephrology..."
            }
            helper="Separate specialties with commas."
          />

          {/* PROCEDURES */}

          <TextAreaField
            label="Key procedures"
            value={form.key_procedures}
            onChange={(value) =>
              updateField(
                "key_procedures",
                value
              )
            }
            placeholder={
              "General Surgery, Laparoscopic Surgery, Joint Replacement..."
            }
            helper="Separate procedures with commas."
          />

          {/* ADDRESS */}

          <TextAreaField
            label="Address"
            value={form.address}
            onChange={(value) =>
              updateField("address", value)
            }
            placeholder="Complete hospital address..."
            rows={4}
          />

          {/* INTERNATIONAL PATIENT SERVICES */}

          <TextAreaField
            label="International patient services"
            value={
              form.international_patient_services
            }
            onChange={(value) =>
              updateField(
                "international_patient_services",
                value
              )
            }
            placeholder={
              "International patient desk, visa assistance, airport pickup, translators, accommodation support..."
            }
            rows={5}
          />

          {/* AIRPORT */}

          <TextAreaField
            label="Airport / travel information"
            value={form.airport_information}
            onChange={(value) =>
              updateField(
                "airport_information",
                value
              )
            }
            placeholder={
              "Distance from airport, approximate travel time, transportation options..."
            }
            rows={4}
          />

          {/* DESCRIPTION */}

          <TextAreaField
            label="Hospital description"
            value={form.description}
            onChange={(value) =>
              updateField(
                "description",
                value
              )
            }
            placeholder={
              "Write a detailed overview of the hospital, its facilities, major specialties, clinical strengths and international patient capabilities..."
            }
            rows={8}
          />
        </div>

        {/* STATUS OPTIONS */}

        <div style={styles.checks}>
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                updateField(
                  "featured",
                  e.target.checked
                )
              }
            />
            Featured
          </label>

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) =>
                updateField(
                  "verified",
                  e.target.checked
                )
              }
            />
            Verified
          </label>

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) =>
                updateField(
                  "is_published",
                  e.target.checked
                )
              }
            />
            Publish publicly
          </label>
        </div>

        <button
          type="submit"
          style={styles.save}
        >
          {editing
            ? "Update hospital"
            : "Save hospital"}
        </button>

        {editing && (
          <button
            type="button"
            style={styles.cancel}
            onClick={cancelEdit}
          >
            Cancel
          </button>
        )}
      </form>

      {/* EXISTING HOSPITALS */}

      <section>
        <h2 style={styles.existingTitle}>
          Existing profiles{" "}
          <small style={styles.count}>
            {hospitals.length}
          </small>
        </h2>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div style={styles.list}>
            {hospitals.map((h) => (
              <div
                style={styles.item}
                key={h.id}
              >
                <div>
                  <b style={styles.hospitalName}>
                    {h.name}
                  </b>

                  <span style={styles.hospitalMeta}>
                    {h.city || "India"}
                    {h.state
                      ? `, ${h.state}`
                      : ""}{" "}
                    ·{" "}
                    {h.is_published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    onClick={() => edit(h)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      remove(h.id)
                    }
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}


/* --------------------------------
   REUSABLE FIELD
-------------------------------- */

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <label style={styles.label}>
      {label}

      <input
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        required={required}
        style={styles.input}
      />
    </label>
  )
}


/* --------------------------------
   REUSABLE TEXTAREA
-------------------------------- */

function TextAreaField({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 5,
  helper = "",
}) {
  return (
    <label
      style={{
        ...styles.label,
        ...styles.wide,
      }}
    >
      {label}

      <textarea
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        style={styles.textarea}
      />

      {helper && (
        <small style={styles.helper}>
          {helper}
        </small>
      )}
    </label>
  )
}


/* --------------------------------
   STYLES
-------------------------------- */

const styles = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 20px 70px",
    fontFamily: "Arial, sans-serif",
    color: "#12201d",
    background: "#f6f8f5",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.14em",
    color: "#0e7569",
    fontWeight: 800,
  },

  title: {
    fontSize: 38,
    letterSpacing: "-0.04em",
    margin: "10px 0 6px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7773",
    fontSize: 14,
  },

  form: {
    background: "#fff",
    border: "1px solid #dfe7e3",
    borderRadius: 20,
    padding: 25,
    marginBottom: 45,
  },

  formHead: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  formTitle: {
    fontSize: 18,
  },

  status: {
    marginLeft: 15,
    color: "#0e7569",
    fontSize: 13,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    fontSize: 12,
    fontWeight: 700,
    color: "#44534e",
    minWidth: 0,
  },

  wide: {
    gridColumn: "1 / -1",
  },

  input: {
    width: "100%",
    height: 46,
    border: "1px solid #dfe7e3",
    borderRadius: 10,
    padding: "0 13px",
    fontSize: 14,
    color: "#12201d",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    border: "1px solid #dfe7e3",
    borderRadius: 10,
    padding: "12px 13px",
    fontSize: 14,
    lineHeight: 1.55,
    color: "#12201d",
    background: "#fff",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
    minHeight: 110,
  },

  fileInput: {
    width: "100%",
    minHeight: 46,
    border: "1px solid #dfe7e3",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    background: "#fff",
    boxSizing: "border-box",
  },

  fileInfo: {
    color: "#0e7569",
    fontWeight: 600,
    fontSize: 10,
  },

  helper: {
    color: "#87928e",
    fontSize: 10,
    fontWeight: 400,
  },

  checks: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    margin: "25px 0",
    paddingTop: 22,
    borderTop: "1px solid #edf1ef",
  },

  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12,
    color: "#52605b",
    fontWeight: 600,
  },

  save: {
    background: "#12201d",
    color: "#fff",
    border: 0,
    borderRadius: 10,
    padding: "13px 20px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },

  cancel: {
    marginLeft: 8,
    padding: "12px 18px",
    border: "1px solid #dfe7e3",
    borderRadius: 10,
    background: "#fff",
    color: "#44534e",
    cursor: "pointer",
    fontSize: 13,
  },

  existingTitle: {
    fontSize: 22,
    margin: "0 0 15px",
  },

  count: {
    display: "inline-grid",
    placeItems: "center",
    minWidth: 26,
    height: 26,
    marginLeft: 7,
    borderRadius: 99,
    background: "#e8f2ee",
    color: "#0e7569",
    fontSize: 11,
    verticalAlign: "middle",
  },

  list: {
    display: "grid",
    gap: 10,
  },

  item: {
    background: "#fff",
    border: "1px solid #dfe7e3",
    borderRadius: 14,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },

  hospitalName: {
    display: "block",
    fontSize: 14,
  },

  hospitalMeta: {
    display: "block",
    marginTop: 5,
    fontSize: 11,
    color: "#73807b",
  },

  actions: {
    display: "flex",
    gap: 7,
    flexShrink: 0,
  },

  editButton: {
    border: "1px solid #dfe7e3",
    background: "#fff",
    color: "#12201d",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
  },

  deleteButton: {
    border: "1px solid #f0d5d5",
    background: "#fff",
    color: "#a34b4b",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
  },
}
