
"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([])
  const [shortlists, setShortlists] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState("")
  const pageSize = 25

  useEffect(() => {
    fetchHospitals()
  }, [])

  async function fetchHospitals() {
    setLoading(true)

    const { data: hospitalData, error: hospitalError } =
      await supabase
        .from("hospitals")
        .select(`
          id,
          hospital_name,
          hospital_type,
          contact_person,
          contact_designation,
          phone,
          email,
          status,
          source,
          cities(name),
          states(name)
        `)
        .order("hospital_name", { ascending: true })

    if (hospitalError) {
      console.error("Hospital loading error:", hospitalError)
      setLoading(false)
      return
    }

    setHospitals(hospitalData || [])

    const { data: shortlistData, error: shortlistError } =
      await supabase
        .from("shortlists")
        .select(`
          id,
          requirement_id,
          doctor_id,
          shortlisted_at,
          created_at,
          status,
          doctors(
            id,
            name,
            specialty,
            qualification
          ),
          requirements(
            id,
            hospital_id
          )
        `)
        .order("shortlisted_at", { ascending: false })

    if (shortlistError) {
      console.error("Shortlist loading error:", shortlistError)
      setProfileError(
        "Unable to load profile submission counts. Check Supabase permissions and relationships."
      )
    } else {
      setShortlists(shortlistData || [])
      setProfileError("")
    }

    setLoading(false)
  }

  function statusColor(status) {
    if (status === "active") return "#16a34a"
    if (status === "inactive") return "#ef4444"
    return "#64748b"
  }

  // Count shortlist records linked to each hospital.
  // Rejected records are included because those profiles were also sent.
  function getProfilesForHospital(hospitalId) {
    return shortlists
      .filter((item) =>
        item.requirements?.hospital_id === hospitalId
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.shortlisted_at || a.created_at || 0
        ).getTime()

        const dateB = new Date(
          b.shortlisted_at || b.created_at || 0
        ).getTime()

        return dateB - dateA
      })
  }

  function getProfession(doctor) {
    if (!doctor) return "Not specified"

    return (
      doctor.specialty ||
      doctor.qualification ||
      "Not specified"
    )
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Date unavailable"

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable"
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const filteredHospitals = hospitals.filter((h) => {
    const term = search.toLowerCase()

    return (
      (h.hospital_name || "").toLowerCase().includes(term) ||
      (h.hospital_type || "").toLowerCase().includes(term) ||
      (h.contact_person || "").toLowerCase().includes(term) ||
      (h.phone || "").toLowerCase().includes(term) ||
      (h.cities?.name || "").toLowerCase().includes(term) ||
      (h.states?.name || "").toLowerCase().includes(term)
    )
  })

  const totalPages = Math.ceil(filteredHospitals.length / pageSize)

  const paginated = filteredHospitals.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const selectedProfiles = selectedHospital
    ? getProfilesForHospital(selectedHospital.id)
    : []

  return (
    <div style={{ color: "#0f172a" }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        <h2 style={{ margin: 0 }}>Hospitals</h2>

        <Link href="/hospitals/add" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "10px 16px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            + Add Hospital
          </button>
        </Link>
      </div>

      <input
        placeholder="Search hospital, city, state, contact..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        style={{
          marginBottom: "20px",
          padding: "8px",
          width: "min(100%, 350px)",
          border: "1px solid #ddd",
          borderRadius: "6px"
        }}
      />

      {profileError && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "6px",
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: "13px"
          }}
        >
          {profileError}
        </div>
      )}

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflowX: "auto"
        }}
      >
        <table
          width="100%"
          cellPadding="12"
          style={{
            borderCollapse: "collapse",
            minWidth: "1050px"
          }}
        >
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>
              <th>Hospital</th>
              <th>Type</th>
              <th>City</th>
              <th>State</th>
              <th>Contact Person</th>
              <th>Designation</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Profiles Sent</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "30px" }}>
                  Loading hospitals and profile counts...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "30px" }}>
                  No hospitals found.
                </td>
              </tr>
            ) : (
              paginated.map((h) => {
                const profileCount =
                  getProfilesForHospital(h.id).length

                return (
                  <tr
                    key={h.id}
                    style={{ borderTop: "1px solid #e5e7eb" }}
                  >
                    <td>
                      {h.hospital_name}

                      {h.source === "google_form" && (
                        <span
                          title="Submitted through Google Form"
                          style={{
                            display: "inline-block",
                            marginLeft: "6px",
                            fontSize: "9px",
                            fontWeight: "700",
                            color: "#2563eb",
                            background: "#dbeafe",
                            padding: "2px 4px",
                            borderRadius: "3px",
                            verticalAlign: "super",
                            lineHeight: "1"
                          }}
                        >
                          FORM
                        </span>
                      )}
                    </td>

                    <td>{h.hospital_type || "—"}</td>
                    <td>{h.cities?.name || "—"}</td>
                    <td>{h.states?.name || "—"}</td>
                    <td>{h.contact_person || "—"}</td>
                    <td>{h.contact_designation || "—"}</td>
                    <td>{h.phone || "—"}</td>

                    <td>
                      <span
                        style={{
                          background: statusColor(h.status),
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px"
                        }}
                      >
                        {h.status || "unknown"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedHospital(h)}
                        title="View doctors sent to this hospital"
                        style={{
                          minWidth: "38px",
                          padding: "6px 12px",
                          border: "1px solid #bfdbfe",
                          background: profileCount > 0 ? "#dbeafe" : "#f8fafc",
                          color: profileCount > 0 ? "#1d4ed8" : "#64748b",
                          borderRadius: "6px",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        {profileCount}
                      </button>
                    </td>

                    <td>
                      <Link href={`/hospitals/${h.id}`} title="View hospital">
                        👁
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap"
        }}
      >
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1

          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: "6px 10px",
                border: "1px solid #ddd",
                background: page === p ? "#2563eb" : "#fff",
                color: page === p ? "#fff" : "#000",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              {p}
            </button>
          )
        })}
      </div>

      {/* DOCTORS SENT MODAL */}
      {selectedHospital && (
        <div
          onClick={() => setSelectedHospital(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Profiles sent to hospital"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "min(900px, 100%)",
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: "20px" }}>
                  Profiles Sent
                </h3>

                <div style={{ color: "#64748b", fontSize: "14px" }}>
                  {selectedHospital.hospital_name}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    color: "#2563eb",
                    fontWeight: "700",
                    fontSize: "13px"
                  }}
                >
                  {selectedProfiles.length} profile submission
                  {selectedProfiles.length === 1 ? "" : "s"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHospital(null)}
                aria-label="Close"
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "6px",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "20px",
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>

            <div style={{ overflow: "auto", padding: "0 20px 20px" }}>
              {selectedProfiles.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 10px",
                    color: "#64748b"
                  }}
                >
                  No profile submissions recorded for this hospital.
                </div>
              ) : (
                <table
                  width="100%"
                  cellPadding="12"
                  style={{
                    borderCollapse: "collapse",
                    minWidth: "520px"
                  }}
                >
                  <thead
                    style={{
                      textAlign: "left",
                      background: "#f8fafc",
                      position: "sticky",
                      top: 0
                    }}
                  >
                    <tr>
                      <th>Doctor</th>
                      <th>Profession / Specialty</th>
                      <th>Date Sent</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedProfiles.map((profile) => {
                      const doctor = profile.doctors

                      return (
                        <tr
                          key={profile.id}
                          style={{ borderTop: "1px solid #e5e7eb" }}
                        >
                          <td style={{ fontWeight: "600" }}>
                            {doctor?.name || "Doctor unavailable"}
                          </td>

                          <td>
                            {getProfession(doctor)}
                          </td>

                          <td>
                            {formatDate(
                              profile.shortlisted_at ||
                              profile.created_at
                            )}
                          </td>

                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                background:
                                  profile.status === "rejected"
                                    ? "#fee2e2"
                                    : profile.status === "placement_done"
                                    ? "#dcfce7"
                                    : "#f1f5f9",
                                color:
                                  profile.status === "rejected"
                                    ? "#b91c1c"
                                    : profile.status === "placement_done"
                                    ? "#166534"
                                    : "#475569",
                                fontSize: "12px"
                              }}
                            >
                              {profile.status || "sent"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end"
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedHospital(null)}
                style={{
                  padding: "9px 16px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
