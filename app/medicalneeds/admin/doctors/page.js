"use client"

import { useEffect, useState } from "react"

const empty = {
  full_name: "", slug: "", title: "Dr.", specialty: "", sub_specialty: "",
  qualifications: "", experience_years: "", city: "", state: "",
  areas_of_expertise: "", languages: "", international_patient_experience: "",
  profile_summary: "", consultation_available: true, featured: false,
  verified: false, is_published: false, profile_photo: "",
}

function toSlug(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function csv(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean)
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const response = await fetch("/api/medicalneeds/admin/doctors")
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to load doctors.")
      setDoctors(data.doctors || [])
    } catch (error) {
      setStatus(error.message || "Unable to load doctors.")
    } finally {
      setLoading(false)
    }
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save(event) {
    event.preventDefault()
    setStatus("")
    setSaving(true)

    try {
      const payload = {
        ...form,
        slug: form.slug || toSlug(form.full_name),
        qualifications: csv(form.qualifications),
        areas_of_expertise: csv(form.areas_of_expertise),
        languages: csv(form.languages),
        experience_years: form.experience_years === "" ? null : Number(form.experience_years),
      }

      const formData = new FormData()
      formData.set("fields", JSON.stringify(payload))
      if (photo) formData.set("photo", photo)
      if (editing) formData.set("id", editing)

      const response = await fetch("/api/medicalneeds/admin/doctors", {
        method: editing ? "PUT" : "POST",
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to save doctor.")

      setStatus(editing ? "Doctor profile updated successfully." : "Doctor profile created successfully.")
      setForm(empty)
      setEditing(null)
      setPhoto(null)
      await load()
    } catch (error) {
      setStatus(error.message || "Unable to save doctor.")
    } finally {
      setSaving(false)
    }
  }

  function edit(doctor) {
    setEditing(doctor.id)
    setForm({
      ...empty,
      ...doctor,
      qualifications: (doctor.qualifications || []).join(", "),
      areas_of_expertise: (doctor.areas_of_expertise || []).join(", "),
      languages: (doctor.languages || []).join(", "),
    })
    setPhoto(null)
    setStatus("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(empty)
    setPhoto(null)
    setStatus("")
  }

  async function remove(id) {
    if (!confirm("Delete this doctor profile?")) return
    setStatus("")
    try {
      const response = await fetch("/api/medicalneeds/admin/doctors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to delete doctor.")
      setStatus("Doctor profile deleted.")
      if (editing === id) cancelEdit()
      await load()
    } catch (error) {
      setStatus(error.message || "Unable to delete doctor.")
    }
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <small style={styles.eyebrow}>MEDPACT CARE · INTERNAL</small>
          <h1 style={styles.title}>Doctor Directory</h1>
          <p style={styles.subtitle}>Add, verify and publish specialist profiles independently of the hospital directory.</p>
        </div>
      </header>

      <form onSubmit={save} style={styles.form}>
        <div style={styles.formHeader}>
          <div>
            <b style={styles.formTitle}>{editing ? "Edit doctor" : "Add doctor"}</b>
            <p style={styles.formHint}>Hospital affiliation is optional and is not managed on this form.</p>
          </div>
          {status && <span role="status" style={styles.status}>{status}</span>}
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
                onChange={(event) => updateField(key, event.target.value)}
                required={label.includes("*")}
                type={key === "experience_years" ? "number" : "text"}
                min={key === "experience_years" ? "0" : undefined}
                style={styles.input}
              />
            </label>
          ))}

          <label style={styles.label}>
            Qualifications (comma separated)
            <input value={form.qualifications || ""} onChange={(event) => updateField("qualifications", event.target.value)} style={styles.input} placeholder="MBBS, MD, DM" />
          </label>

          <label style={styles.label}>
            Languages (comma separated)
            <input value={form.languages || ""} onChange={(event) => updateField("languages", event.target.value)} style={styles.input} placeholder="English, Hindi, Telugu" />
          </label>

          <label style={styles.label}>
            Areas of expertise (comma separated)
            <input value={form.areas_of_expertise || ""} onChange={(event) => updateField("areas_of_expertise", event.target.value)} style={styles.input} placeholder="Interventional Cardiology, Angioplasty" />
          </label>

          <label style={styles.label}>
            Doctor image
            <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} style={styles.fileInput} />
            {form.profile_photo && !photo && <small style={styles.helper}>An existing profile photo is saved. Choose a file only to replace it.</small>}
          </label>

          <label style={{ ...styles.label, ...styles.wide }}>
            Profile summary
            <textarea value={form.profile_summary || ""} onChange={(event) => updateField("profile_summary", event.target.value)} style={styles.textarea} placeholder="Brief professional profile..." />
          </label>

          <label style={{ ...styles.label, ...styles.wide }}>
            International patient experience
            <textarea value={form.international_patient_experience || ""} onChange={(event) => updateField("international_patient_experience", event.target.value)} style={styles.textarea} placeholder="Experience with international patients, if applicable..." />
          </label>
        </div>

        <div style={styles.checks}>
          {[
            ["consultation_available", "Consultation available"],
            ["featured", "Featured"],
            ["verified", "Verified"],
            ["is_published", "Publish publicly"],
          ].map(([key, label]) => (
            <label key={key} style={styles.checkLabel}>
              <input type="checkbox" checked={!!form[key]} onChange={(event) => updateField(key, event.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <div style={styles.formActions}>
          <button type="submit" style={styles.save} disabled={saving}>{saving ? "Saving…" : editing ? "Update doctor" : "Save doctor"}</button>
          {editing && <button type="button" onClick={cancelEdit} style={styles.cancel} disabled={saving}>Cancel</button>}
        </div>
      </form>

      <section>
        <div style={styles.existingHeader}>
          <h2 style={styles.existingTitle}>Existing profiles <small style={styles.count}>{doctors.length}</small></h2>
        </div>
        {loading ? <p>Loading doctors…</p> : doctors.length === 0 ? (
          <div style={styles.emptyState}>No doctor profiles yet. Add the first doctor using the form above.</div>
        ) : (
          <div style={styles.list}>
            {doctors.map((doctor) => (
              <article style={styles.item} key={doctor.id}>
                <div style={styles.doctorInfo}>
                  <b style={styles.doctorName}>{doctor.title || "Dr."} {doctor.full_name}</b>
                  <span style={styles.doctorMeta}>
                    {[doctor.specialty, doctor.city || "India", doctor.is_published ? "Published" : "Draft"].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <div style={styles.actions}>
                  <button type="button" onClick={() => edit(doctor)} style={styles.editButton}>Edit</button>
                  <button type="button" onClick={() => remove(doctor.id)} style={styles.deleteButton}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "45px 20px", fontFamily: "Arial, sans-serif", color: "#12201d", background: "#f6f8f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  eyebrow: { fontSize: 11, letterSpacing: "0.14em", color: "#0e7569", fontWeight: 800 },
  title: { margin: "10px 0 6px", fontSize: 38, letterSpacing: "-0.04em" },
  subtitle: { margin: 0, color: "#6b7773", fontSize: 14, lineHeight: 1.6 },
  form: { background: "white", border: "1px solid #dfe7e3", borderRadius: 20, padding: 25, marginBottom: 45 },
  formHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, marginBottom: 20, flexWrap: "wrap" },
  formTitle: { fontSize: 18 },
  formHint: { color: "#73807b", fontSize: 12, margin: "7px 0 0" },
  status: { color: "#0e7569", fontSize: 13, maxWidth: 400 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 7, fontSize: 12, fontWeight: 700, color: "#44534e", minWidth: 0 },
  wide: { gridColumn: "1 / -1" },
  input: { width: "100%", minHeight: 45, border: "1px solid #dfe7e3", borderRadius: 10, padding: "0 13px", fontSize: 14, color: "#12201d", background: "#fff", outline: "none", boxSizing: "border-box" },
  fileInput: { width: "100%", minHeight: 45, border: "1px solid #dfe7e3", borderRadius: 10, padding: 10, fontSize: 13, background: "#fff", boxSizing: "border-box" },
  textarea: { width: "100%", minHeight: 120, resize: "vertical", border: "1px solid #dfe7e3", borderRadius: 10, padding: 13, fontSize: 14, lineHeight: 1.6, color: "#12201d", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "Arial, sans-serif" },
  helper: { color: "#84908c", fontSize: 10, fontWeight: 400, lineHeight: 1.5 },
  checks: { display: "flex", gap: 20, flexWrap: "wrap", margin: "22px 0", paddingTop: 20, borderTop: "1px solid #edf1ef" },
  checkLabel: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#52605b", fontWeight: 600 },
  formActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  save: { background: "#12201d", color: "white", border: 0, borderRadius: 10, padding: "13px 18px", cursor: "pointer", fontWeight: 700 },
  cancel: { padding: "12px 18px", border: "1px solid #dfe7e3", borderRadius: 10, background: "#fff", color: "#44534e", cursor: "pointer" },
  existingHeader: { marginBottom: 15 },
  existingTitle: { fontSize: 22, margin: 0 },
  count: { display: "inline-grid", placeItems: "center", minWidth: 26, height: 26, marginLeft: 8, borderRadius: 99, background: "#e8f2ee", color: "#0e7569", fontSize: 11, verticalAlign: "middle" },
  list: { display: "grid", gap: 10 },
  item: { background: "white", border: "1px solid #dfe7e3", borderRadius: 14, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" },
  doctorInfo: { minWidth: 0, flex: "1 1 240px" },
  doctorName: { display: "block", fontSize: 14 },
  doctorMeta: { display: "block", marginTop: 5, fontSize: 11, color: "#73807b", lineHeight: 1.5 },
  actions: { display: "flex", gap: 7, flexShrink: 0 },
  editButton: { border: "1px solid #dfe7e3", background: "#fff", color: "#12201d", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700 },
  deleteButton: { border: "1px solid #f0d5d5", background: "#fff", color: "#a34b4b", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700 },
  emptyState: { padding: 24, background: "#fff", border: "1px solid #dfe7e3", borderRadius: 14, color: "#73807b" },
}
