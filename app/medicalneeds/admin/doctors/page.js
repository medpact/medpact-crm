"use client"

import { useEffect, useRef, useState } from "react"

const empty = {
  full_name: "",
  slug: "",
  title: "Dr.",
  specialty: "",
  sub_specialty: "",
  qualifications: "",
  experience_years: "",
  city: "",
  state: "",
  areas_of_expertise: "",
  languages: "",
  international_patient_experience: "",
  profile_summary: "",
  consultation_available: true,
  featured: false,
  verified: false,
  is_published: false,
  profile_photo: "",
  hospital_ids: [],
}

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function csv(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)

  const [hospitalOpen, setHospitalOpen] = useState(false)
  const [hospitalSearch, setHospitalSearch] = useState("")
  const hospitalBoxRef = useRef(null)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        hospitalBoxRef.current &&
        !hospitalBoxRef.current.contains(event.target)
      ) {
        setHospitalOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  async function load() {
    setLoading(true)

    try {
      const r = await fetch("/api/medicalneeds/admin/doctors")
      const d = await r.json()

      if (!r.ok) {
        throw new Error(d.error)
      }

      setDoctors(d.doctors || [])
      setHospitals(d.hospitals || [])
    } catch (e) {
      setStatus(e.message)
    } finally {
      setLoading(false)
    }
  }

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function toggleHospital(id) {
    setForm((current) => {
      const selected = current.hospital_ids || []

      const exists = selected.includes(id)

      return {
        ...current,
        hospital_ids: exists
          ? selected.filter((hospitalId) => hospitalId !== id)
          : [...selected, id],
      }
    })
  }

  function removeHospital(id) {
    setForm((current) => ({
      ...current,
      hospital_ids: (current.hospital_ids || []).filter(
        (hospitalId) => hospitalId !== id
      ),
    }))
  }

  function clearHospitals() {
    setForm((current) => ({
      ...current,
      hospital_ids: [],
    }))
  }

  async function save(e) {
    e.preventDefault()

    setStatus("Saving…")

    try {
      const payload = {
        ...form,
        slug: form.slug || toSlug(form.full_name),
        qualifications: csv(form.qualifications),
        areas_of_expertise: csv(form.areas_of_expertise),
        languages: csv(form.languages),
        experience_years:
          form.experience_years === ""
            ? null
            : Number(form.experience_years),
        hospital_ids: form.hospital_ids || [],
      }

      const fd = new FormData()

      fd.set("fields", JSON.stringify(payload))

      if (photo) {
        fd.set("photo", photo)
      }

      if (editing) {
        fd.set("id", editing)
      }

      const r = await fetch("/api/medicalneeds/admin/doctors", {
        method: editing ? "PUT" : "POST",
        body: fd,
      })

      const d = await r.json()

      if (!r.ok) {
        throw new Error(d.error)
      }

      setStatus("Saved successfully.")
      setForm(empty)
      setEditing(null)
      setPhoto(null)
      setHospitalOpen(false)
      setHospitalSearch("")

      await load()
    } catch (err) {
      setStatus(err.message || "Unable to save doctor.")
    }
  }

  function edit(d) {
    setEditing(d.id)

    setForm({
      ...empty,
      ...d,
      hospital_ids: d.hospital_ids || [],
      qualifications: (d.qualifications || []).join(", "),
      areas_of_expertise: (d.areas_of_expertise || []).join(", "),
      languages: (d.languages || []).join(", "),
    })

    setPhoto(null)
    setHospitalSearch("")
    setHospitalOpen(false)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(empty)
    setPhoto(null)
    setStatus("")
    setHospitalSearch("")
    setHospitalOpen(false)
  }

  async function remove(id) {
    if (!confirm("Delete this doctor profile?")) {
      return
    }

    const r = await fetch("/api/medicalneeds/admin/doctors", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })

    const d = await r.json()

    if (!r.ok) {
      setStatus(d.error)
    } else {
      await load()
    }
  }

  const selectedHospitalIds = form.hospital_ids || []

  const selectedHospitals = hospitals.filter((hospital) =>
    selectedHospitalIds.includes(hospital.id)
  )

  const filteredHospitals = hospitals.filter((hospital) => {
    const q = hospitalSearch.trim().toLowerCase()

    if (!q) {
      return true
    }

    return (
      String(hospital.name || "")
        .toLowerCase()
        .includes(q) ||
      String(hospital.city || "")
        .toLowerCase()
        .includes(q) ||
      String(hospital.state || "")
        .toLowerCase()
        .includes(q)
    )
  })

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <small style={styles.eyebrow}>MEDPACT CARE · INTERNAL</small>

          <h1 style={styles.title}>Doctor Directory</h1>

          <p style={styles.subtitle}>
            Add, verify and publish specialist profiles.
          </p>
        </div>
      </div>

      <form onSubmit={save} style={styles.form}>
        <div style={styles.formHeader}>
          <div>
            <b style={styles.formTitle}>
              {editing ? "Edit doctor" : "Add doctor"}
            </b>

            {status && <span style={styles.status}>{status}</span>}
          </div>
        </div>

        <div style={styles.grid}>
          {[
            ["full_name", "Full name *"],
            ["slug", "Profile slug (optional)"],
            ["title", "Title"],
            ["specialty", "Specialty *"],
            ["sub_specialty", "Sub-specialty"],
            ["experience_years", "Experience (years)"],
            ["city", "City"],
            ["state", "State"],
          ].map(([key, label]) => (
            <label key={key} style={styles.label}>
              {label}

              <input
                value={form[key] ?? ""}
                onChange={(e) => updateField(key, e.target.value)}
                required={label.includes("*")}
                style={styles.input}
              />
            </label>
          ))}

          <label style={styles.label}>
            Qualifications (comma separated)

            <input
              value={form.qualifications}
              onChange={(e) =>
                updateField("qualifications", e.target.value)
              }
              style={styles.input}
              placeholder="MBBS, MD, DM"
            />
          </label>

          <label style={styles.label}>
            Languages (comma separated)

            <input
              value={form.languages}
              onChange={(e) => updateField("languages", e.target.value)}
              style={styles.input}
              placeholder="English, Hindi, Telugu"
            />
          </label>

          <label style={styles.label}>
            Areas of expertise (comma separated)

            <input
              value={form.areas_of_expertise}
              onChange={(e) =>
                updateField("areas_of_expertise", e.target.value)
              }
              style={styles.input}
              placeholder="Interventional Cardiology, Angioplasty"
            />
          </label>

          <label style={styles.label}>
            Doctor image

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPhoto(e.target.files?.[0] || null)
              }
              style={styles.fileInput}
            />
          </label>

          {/* HOSPITAL MULTI SELECT */}
          <div
            ref={hospitalBoxRef}
            style={{
              ...styles.label,
              ...styles.wide,
              position: "relative",
            }}
          >
            <div style={styles.fieldLabelRow}>
              <span>Hospitals</span>

              {selectedHospitals.length > 0 && (
                <button
                  type="button"
                  onClick={clearHospitals}
                  style={styles.clearButton}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* SELECTED HOSPITAL CHIPS */}
            {selectedHospitals.length > 0 && (
              <div style={styles.selectedChips}>
                {selectedHospitals.map((hospital) => (
                  <div key={hospital.id} style={styles.selectedChip}>
                    <div>
                      <strong>{hospital.name}</strong>

                      {hospital.city && (
                        <small>
                          {hospital.city}
                          {hospital.state
                            ? `, ${hospital.state}`
                            : ""}
                        </small>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeHospital(hospital.id)}
                      style={styles.removeChip}
                      aria-label={`Remove ${hospital.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SEARCH / TRIGGER */}
            <button
              type="button"
              onClick={() => setHospitalOpen((value) => !value)}
              style={{
                ...styles.multiSelectTrigger,
                borderColor: hospitalOpen
                  ? "#0e7569"
                  : "#dfe7e3",
              }}
            >
              <span>
                {selectedHospitals.length === 0
                  ? "Select hospitals..."
                  : `${selectedHospitals.length} hospital${
                      selectedHospitals.length === 1 ? "" : "s"
                    } selected`}
              </span>

              <span
                style={{
                  ...styles.chevron,
                  transform: hospitalOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                ↓
              </span>
            </button>

            {/* DROPDOWN */}
            {hospitalOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownSearch}>
                  <span style={styles.searchIcon}>⌕</span>

                  <input
                    autoFocus
                    value={hospitalSearch}
                    onChange={(e) =>
                      setHospitalSearch(e.target.value)
                    }
                    placeholder="Search hospitals..."
                    style={styles.dropdownInput}
                  />
                </div>

                <div style={styles.dropdownHeader}>
                  <span>
                    {filteredHospitals.length} hospital
                    {filteredHospitals.length === 1 ? "" : "s"}
                  </span>

                  {selectedHospitals.length > 0 && (
                    <span style={styles.selectedCount}>
                      {selectedHospitals.length} selected
                    </span>
                  )}
                </div>

                <div style={styles.options}>
                  {filteredHospitals.length === 0 && (
                    <div style={styles.noResults}>
                      No hospitals found.
                    </div>
                  )}

                  {filteredHospitals.map((hospital) => {
                    const selected = selectedHospitalIds.includes(
                      hospital.id
                    )

                    return (
                      <button
                        type="button"
                        key={hospital.id}
                        onClick={() => toggleHospital(hospital.id)}
                        style={{
                          ...styles.option,
                          background: selected
                            ? "#e8f2ee"
                            : "#ffffff",
                        }}
                      >
                        <span
                          style={{
                            ...styles.checkbox,
                            background: selected
                              ? "#0e7569"
                              : "#ffffff",
                            borderColor: selected
                              ? "#0e7569"
                              : "#cbd7d2",
                          }}
                        >
                          {selected ? "✓" : ""}
                        </span>

                        <span style={styles.optionText}>
                          <strong>{hospital.name}</strong>

                          <small>
                            {hospital.city || "India"}
                            {hospital.state
                              ? `, ${hospital.state}`
                              : ""}

                            {!hospital.is_published && (
                              <em> · Draft</em>
                            )}
                          </small>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <small style={styles.helper}>
              Select one or more hospitals where this doctor practices.
            </small>
          </div>

          <label style={{ ...styles.label, ...styles.wide }}>
            Profile summary

            <textarea
              value={form.profile_summary}
              onChange={(e) =>
                updateField("profile_summary", e.target.value)
              }
              style={styles.textarea}
              placeholder="Brief professional profile..."
            />
          </label>

          <label style={{ ...styles.label, ...styles.wide }}>
            International patient experience

            <textarea
              value={form.international_patient_experience}
              onChange={(e) =>
                updateField(
                  "international_patient_experience",
                  e.target.value
                )
              }
              style={styles.textarea}
              placeholder="Experience with international patients, if applicable..."
            />
          </label>
        </div>

        <div style={styles.checks}>
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.consultation_available}
              onChange={(e) =>
                updateField(
                  "consultation_available",
                  e.target.checked
                )
              }
            />
            Consultation available
          </label>

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                updateField("featured", e.target.checked)
              }
            />
            Featured
          </label>

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) =>
                updateField("verified", e.target.checked)
              }
            />
            Verified
          </label>

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) =>
                updateField("is_published", e.target.checked)
              }
            />
            Publish publicly
          </label>
        </div>

        <button type="submit" style={styles.save}>
          {editing ? "Update doctor" : "Save doctor"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={cancelEdit}
            style={styles.cancel}
          >
            Cancel
          </button>
        )}
      </form>

      <section>
        <div style={styles.existingHeader}>
          <h2 style={styles.existingTitle}>
            Existing profiles

            <small style={styles.count}>
              {doctors.length}
            </small>
          </h2>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div style={styles.list}>
            {doctors.map((d) => (
              <div style={styles.item} key={d.id}>
                <div>
                  <b style={styles.doctorName}>
                    {d.title} {d.full_name}
                  </b>

                  <span style={styles.doctorMeta}>
                    {d.specialty} · {d.city || "India"} ·{" "}
                    {d.is_published ? "Published" : "Draft"}
                  </span>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    onClick={() => edit(d)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(d.id)}
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

const styles = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "45px 20px",
    fontFamily: "Arial, sans-serif",
    color: "#12201d",
    background: "#f6f8f5",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.14em",
    color: "#0e7569",
    fontWeight: 800,
  },

  title: {
    margin: "10px 0 6px",
    fontSize: 38,
    letterSpacing: "-0.04em",
  },

  subtitle: {
    margin: 0,
    color: "#6b7773",
    fontSize: 14,
  },

  form: {
    background: "white",
    border: "1px solid #dfe7e3",
    borderRadius: 20,
    padding: 25,
    marginBottom: 45,
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    fontSize: 12,
    fontWeight: 700,
    color: "#44534e",
  },

  wide: {
    gridColumn: "1 / -1",
  },

  input: {
    width: "100%",
    minHeight: 45,
    border: "1px solid #dfe7e3",
    borderRadius: 10,
    padding: "0 13px",
    fontSize: 14,
    color: "#12201d",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },

  fileInput: {
    width: "100%",
    minHeight: 45,
    border: "1px solid #dfe7e3",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    background: "#fff",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: 120,
    resize: "vertical",
    border: "1px solid #dfe7e3",
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#12201d",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  fieldLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  clearButton: {
    border: 0,
    background: "transparent",
    color: "#0e7569",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },

  selectedChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },

  selectedChip: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#e8f2ee",
    border: "1px solid #cfe2db",
    borderRadius: 11,
    padding: "8px 8px 8px 11px",
    color: "#24483f",
    minWidth: 170,
  },

  removeChip: {
    width: 23,
    height: 23,
    border: 0,
    borderRadius: "50%",
    background: "#d3e6df",
    color: "#24483f",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  multiSelectTrigger: {
    width: "100%",
    minHeight: 48,
    border: "1px solid #dfe7e3",
    borderRadius: 11,
    background: "#fff",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#44534e",
    cursor: "pointer",
    textAlign: "left",
  },

  chevron: {
    color: "#0e7569",
    fontSize: 17,
    transition: "transform .18s ease",
  },

  dropdown: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
    marginTop: 7,
    background: "#fff",
    border: "1px solid #dfe7e3",
    borderRadius: 15,
    boxShadow: "0 20px 50px rgba(18,32,29,.14)",
    zIndex: 50,
    overflow: "hidden",
  },

  dropdownSearch: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 13px",
    borderBottom: "1px solid #edf1ef",
  },

  searchIcon: {
    fontSize: 21,
    color: "#0e7569",
  },

  dropdownInput: {
    flex: 1,
    border: 0,
    outline: 0,
    fontSize: 13,
    padding: "7px 0",
    color: "#12201d",
    background: "transparent",
  },

  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 13px",
    fontSize: 10,
    color: "#84908c",
    textTransform: "uppercase",
    letterSpacing: ".08em",
    fontWeight: 800,
    background: "#fafcfb",
  },

  selectedCount: {
    color: "#0e7569",
  },

  options: {
    maxHeight: 270,
    overflowY: "auto",
    padding: 6,
  },

  option: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 11,
    border: 0,
    borderRadius: 10,
    padding: "10px 9px",
    cursor: "pointer",
    textAlign: "left",
    color: "#12201d",
  },

  checkbox: {
    width: 20,
    height: 20,
    border: "1px solid",
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  },

  optionText: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  },

  optionTextStrong: {
    fontSize: 13,
  },

  optionTextSmall: {
    fontSize: 10,
  },

  noResults: {
    padding: 25,
    textAlign: "center",
    color: "#7b8581",
    fontSize: 13,
  },

  helper: {
    color: "#84908c",
    fontSize: 10,
    fontWeight: 400,
  },

  checks: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    margin: "22px 0",
    paddingTop: 20,
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
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: "13px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },

  cancel: {
    marginLeft: 8,
    padding: "12px 18px",
    border: "1px solid #dfe7e3",
    borderRadius: 10,
    background: "#fff",
    color: "#44534e",
    cursor: "pointer",
  },

  existingHeader: {
    marginBottom: 15,
  },

  existingTitle: {
    fontSize: 22,
    margin: 0,
  },

  count: {
    display: "inline-grid",
    placeItems: "center",
    minWidth: 26,
    height: 26,
    marginLeft: 8,
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
    background: "white",
    border: "1px solid #dfe7e3",
    borderRadius: 14,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },

  doctorName: {
    display: "block",
    fontSize: 14,
  },

  doctorMeta: {
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
