
"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

const SOURCE_OPTIONS = [
  "Direct",
  "Naukri",
  "Indeed",
  "LinkedIn",
  "SMS",
  "WhatsApp",
  "Email",
  "Ref",
]

export default function DoctorProfile() {

  const [isAdmin, setIsAdmin] = useState(false)

  const { id } = useParams()
  const router = useRouter()

  const [doctor, setDoctor] = useState(null)
  const [specialties, setSpecialties] = useState([])
  const [saving, setSaving] = useState(false)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {

    const user = localStorage.getItem("medpact_user")

    if (user && user.trim().toLowerCase() === "admin") {
      setIsAdmin(true)
    }

    loadDoctor()
    loadSpecialties()
    loadTimeline()

  }, [id])

  async function loadDoctor() {

    const { data, error } = await supabase
      .from("doctors")
      .select(`
        id,
        name,
        qualification,
        specialty_id,
        experience_years,
        phone,
        email,
        city,
        preferred_location,
        expected_ctc,
        availability_status,
        source,
        remarks
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.log(error)
      return
    }

    setDoctor(data)

  }

  async function loadSpecialties() {

    const { data, error } = await supabase
      .from("specialties")
      .select("id,name")
      .order("name")

    if (error) {
      console.log(error)
      return
    }

    setSpecialties(data || [])

  }

  async function loadTimeline() {

    const { data, error } = await supabase
      .from("shortlists")
      .select(`
        id,
        status,
        remarks,
        created_at,
        requirements(
          hospital_id,
          hospitals(hospital_name),
          specialties(name)
        )
      `)
      .eq("doctor_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setTimeline(data || [])

  }

  function formatDate(date) {

    if (!date) return "-"

    const d = new Date(date)

    return d.toLocaleDateString("en-GB")

  }

  function timelineColor(status) {

    switch (status) {

      case "shortlisted":
        return "#f59e0b"

      case "interview_assigned":
        return "#3b82f6"

      case "interview_completed":
        return "#fb923c"

      case "offer_released":
        return "#8b5cf6"

      case "placement_done":
        return "#16a34a"

      case "rejected":
        return "#ef4444"

      default:
        return "#64748b"

    }

  }

  function updateField(field, value) {

    setDoctor(prev => ({
      ...prev,
      [field]: value
    }))

  }

  async function saveDoctor() {

    const confirmChange = confirm("Save changes to doctor profile?")

    if (!confirmChange) return

    setSaving(true)

    const { error } = await supabase
      .from("doctors")
      .update({
        name: doctor.name,
        qualification: doctor.qualification,
        specialty_id: doctor.specialty_id || null,
        experience_years: doctor.experience_years || null,
        phone: doctor.phone,
        email: doctor.email,
        city: doctor.city,
        preferred_location: doctor.preferred_location,
        expected_ctc: doctor.expected_ctc || null,
        availability_status: doctor.availability_status,
        source: doctor.source || null,
        remarks: doctor.remarks
      })
      .eq("id", id)

    setSaving(false)

    if (error) {
      console.log(error)
      alert("Error updating doctor: " + error.message)
      return
    }

    alert("Doctor updated successfully")

  }

  if (!doctor) {

    return (
      <div style={{ padding: "30px" }}>
        Loading doctor...
      </div>
    )

  }

  // Preserve historical source values that are not in the dropdown.
  const sourceIsCustom =
    doctor.source &&
    !SOURCE_OPTIONS.includes(doctor.source)

  return (

    <div style={{ color: "#0f172a" }}>

      <div style={{ marginBottom: "20px" }}>
        <Link href="/doctors">← Back to Doctors</Link>
      </div>

      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "25px",
        maxWidth: "700px"
      }}>

        <h2>Edit Doctor</h2>

        {/* Name */}

        <p>
          <b>Name</b><br />
          <input
            value={doctor.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </p>

        {/* Qualification */}

        <p>
          <b>Qualification</b><br />
          <input
            value={doctor.qualification || ""}
            onChange={(e) => updateField("qualification", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </p>

        {/* Specialty */}

        <p>
          <b>Specialty</b><br />
          <select
            value={doctor.specialty_id || ""}
            onChange={(e) =>
              updateField(
                "specialty_id",
                e.target.value ? Number(e.target.value) : null
              )
            }
            style={{ width: "100%", padding: "8px" }}
          >

            <option value="">Select Specialty</option>

            {specialties.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}

          </select>
        </p>

        {/* Experience */}

        <p>
          <b>Experience (Years)</b><br />
          <input
            type="number"
            value={doctor.experience_years ?? ""}
            onChange={(e) => updateField("experience_years", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </p>

        {/* Phone */}

        <p>
          <b>Phone</b><br />
          <input
            value={doctor.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </p>

        {/* Email */}

        <p>
          <b>Email</b><br />
          <input
            value={doctor.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </p>

        {/* City */}

        <p>
          <b>City</b><br />
          <input
            value={doctor.city || ""}
            onChange={(e) => updateField("city", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </p>

        {/* Preferred Location */}

        <p>
          <b>Preferred Relocation City</b><br />
          <input
            value={doctor.preferred_location || ""}
            onChange={(e) => updateField("preferred_location", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </p>

        {/* Expected CTC */}

        <p>
          <b>Expected CTC</b><br />
          <input
            type="number"
            value={doctor.expected_ctc ?? ""}
            onChange={(e) => updateField("expected_ctc", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </p>

        {/* Availability */}

        <p>
          <b>Availability</b><br />
          <select
            value={doctor.availability_status || ""}
            onChange={(e) => updateField("availability_status", e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >

            <option value="available">Available</option>
            <option value="not_available">Not Available</option>
            <option value="in_process">In Process</option>

          </select>
        </p>

        {/* Source */}

        <p>
          <b>Source</b><br />

          <select
            value={
              sourceIsCustom
                ? "__custom__"
                : doctor.source || ""
            }
            onChange={(e) => {
              const value = e.target.value

              if (value === "__custom__") return

              updateField("source", value)
            }}
            style={{
              width: "100%",
              padding: "9px",
              border: "1px solid #d1d5db",
              borderRadius: "5px",
              background: "#fff"
            }}
          >

            <option value="">Not Specified</option>

            {sourceIsCustom && (
              <option value="__custom__">
                Existing value: {doctor.source}
              </option>
            )}

            {SOURCE_OPTIONS.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}

          </select>

          <small style={{ color: "#64748b" }}>
            Select where this doctor's details were sourced from.
          </small>

        </p>

        {/* Remarks */}

        <p>
          <b>Remarks</b><br />
          <textarea
            value={doctor.remarks || ""}
            onChange={(e) => updateField("remarks", e.target.value)}
            rows="4"
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box"
            }}
          />
        </p>

        {/* Save */}

        <button
          onClick={saveDoctor}
          disabled={saving}
          style={{
            padding: "10px 18px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

      <div style={{ marginTop: "20px" }}>

        {isAdmin && (

          <button
            onClick={async () => {

              const confirmDelete = confirm(
                "Are you sure you want to delete this doctor?"
              )

              if (!confirmDelete) return

              const { error } = await supabase
                .from("doctors")
                .delete()
                .eq("id", id)

              if (error) {
                alert("Error deleting doctor: " + error.message)
                return
              }

              alert("Doctor deleted")

              router.push("/doctors")

            }}
            style={{
              padding: "10px 18px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Delete Doctor
          </button>

        )}

      </div>

      <hr style={{ margin: "30px 0" }} />

      <h3>Recruitment Timeline</h3>

      {timeline.length === 0 && (
        <p>No recruitment history.</p>
      )}

      {timeline.map(t => (

        <div
          key={t.id}
          style={{
            border: "1px solid #e5e7eb",
            padding: "15px",
            marginBottom: "12px",
            borderRadius: "8px"
          }}
        >

          <div
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "20px",
              background: timelineColor(t.status),
              color: "#fff",
              fontSize: "12px",
              marginBottom: "10px"
            }}
          >
            {t.status.replaceAll("_", " ")}
          </div>

          <p>
            <b>Hospital:</b>{" "}
            {t.requirements?.hospitals?.hospital_name}
          </p>

          <p>
            <b>Specialty:</b>{" "}
            {t.requirements?.specialties?.name}
          </p>

          <p>
            <b>Date:</b>{" "}
            {formatDate(t.created_at)}
          </p>

          <p>
            <b>Remarks:</b>{" "}
            {t.remarks || "-"}
          </p>

        </div>

      ))}

    </div>

  )

}
