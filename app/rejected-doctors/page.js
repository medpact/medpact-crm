
"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function RejectedDoctorsPage() {

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [city, setCity] = useState("")
  const [availability, setAvailability] = useState("")

  useEffect(() => {
    fetchRejectedDoctors()
  }, [])

  async function fetchRejectedDoctors() {

    setLoading(true)

    const { data, error } = await supabase
      .from("shortlists")
      .select(`
        id,
        doctor_id,
        requirement_id,
        status,
        remarks,
        rejected_at,
        created_at,
        doctors(
          id,
          name,
          qualification,
          experience_years,
          phone,
          email,
          city,
          preferred_location,
          expected_ctc,
          availability_status,
          specialties(name)
        ),
        requirements(
          id,
          hospital_id,
          city,
          hospitals(hospital_name),
          specialties(name)
        )
      `)
      .eq("status", "rejected")
      .order("rejected_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Rejected doctors loading error:", error)
      alert("Unable to load rejected doctors: " + error.message)
      setRecords([])
    } else {
      setRecords(data || [])
    }

    setLoading(false)

  }

  function formatDate(date) {

    if (!date) return "—"

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) return "—"

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })

  }

  function formatCurrency(amount) {

    if (amount === null || amount === undefined || amount === "") {
      return "—"
    }

    return "₹" + Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })

  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim()
  }

  const specialties = useMemo(() => {

    return [...new Set(
      records
        .map(r => r.doctors?.specialties?.name)
        .filter(Boolean)
    )].sort()

  }, [records])

  const cities = useMemo(() => {

    return [...new Set(
      records
        .map(r => r.doctors?.preferred_location || r.doctors?.city)
        .filter(Boolean)
    )].sort()

  }, [records])

  const filteredRecords = useMemo(() => {

    return records.filter(row => {

      const doctor = row.doctors || {}
      const hospital = row.requirements?.hospitals?.hospital_name || ""
      const doctorSpecialty = doctor.specialties?.name || ""
      const doctorCity = doctor.preferred_location || doctor.city || ""

      const term = normalize(search)

      const matchesSearch =
        !term ||
        normalize(doctor.name).includes(term) ||
        normalize(doctor.phone).includes(term) ||
        normalize(hospital).includes(term) ||
        normalize(doctorSpecialty).includes(term) ||
        normalize(row.remarks).includes(term)

      const matchesSpecialty =
        !specialty || doctorSpecialty === specialty

      const matchesCity =
        !city || doctorCity === city

      const matchesAvailability =
        !availability ||
        doctor.availability_status === availability

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesCity &&
        matchesAvailability
      )

    })

  }, [records, search, specialty, city, availability])

  const availableCount = records.filter(
    r => r.doctors?.availability_status === "available"
  ).length

  const unavailableCount = records.filter(
    r => r.doctors?.availability_status === "not_available"
  ).length

  async function copyDoctorProfile(row) {

    const doctor = row.doctors || {}
    const hospital = row.requirements?.hospitals?.hospital_name || "Unknown hospital"

    const profile = [
      "MEDPACT - DOCTOR PROFILE",
      "",
      `Name: ${doctor.name || "—"}`,
      `Qualification: ${doctor.qualification || "—"}`,
      `Specialty: ${doctor.specialties?.name || "—"}`,
      `Experience: ${doctor.experience_years ?? "—"} years`,
      `Current City: ${doctor.city || "—"}`,
      `Preferred Location: ${doctor.preferred_location || "—"}`,
      `Expected CTC: ${formatCurrency(doctor.expected_ctc)}`,
      `Phone: ${doctor.phone || "—"}`,
      `Email: ${doctor.email || "—"}`,
      `Availability: ${doctor.availability_status || "—"}`,
      "",
      "Previous Recruitment History",
      `Previously rejected by: ${hospital}`,
      `Rejection date: ${formatDate(row.rejected_at)}`,
      `Rejection remarks: ${row.remarks || "—"}`,
      "",
      "Shared through Medpact"
    ].join("\n")

    try {

      await navigator.clipboard.writeText(profile)
      alert("Doctor profile copied successfully.")

    } catch (error) {

      console.error("Copy error:", error)
      alert("Unable to copy profile. Please try again.")

    }

  }

  function getWhatsAppLink(phone) {

    const number = String(phone || "").replace(/\D/g, "")

    if (!number) return null

    const formattedNumber =
      number.length === 10 ? "91" + number : number

    return `https://wa.me/${formattedNumber}`

  }

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "18px"
  }

  const inputStyle = {
    padding: "9px 11px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    minWidth: "150px"
  }

  return (

    <div style={{
      padding: "25px",
      color: "#0f172a",
      minHeight: "100vh"
    }}>

      {/* HEADER */}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap",
        marginBottom: "22px"
      }}>

        <div>
          <h2 style={{ margin: "0 0 7px" }}>
            Rejected Doctors
          </h2>

          <p style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px"
          }}>
            Previously rejected candidates who may be suitable
            for other hospital requirements.
          </p>
        </div>

        <div style={{
          display: "flex",
          gap: "9px",
          flexWrap: "wrap"
        }}>

          <button
            onClick={fetchRejectedDoctors}
            style={{
              padding: "9px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            ↻ Refresh
          </button>

          <Link
            href="/shortlists"
            style={{
              padding: "9px 14px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            Recruitment Pipeline
          </Link>

        </div>

      </div>

      {/* SUMMARY */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "13px",
        marginBottom: "22px"
      }}>

        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: "13px" }}>
            Total Rejection Records
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: "700",
            marginTop: "7px"
          }}>
            {records.length}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: "13px" }}>
            Available Doctors
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#15803d",
            marginTop: "7px"
          }}>
            {availableCount}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: "13px" }}>
            Not Available
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#64748b",
            marginTop: "7px"
          }}>
            {unavailableCount}
          </div>
        </div>

      </div>

      {/* FILTERS */}

      <div style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "18px"
      }}>

        <input
          placeholder="Search doctor, hospital, phone, remarks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            flex: "1 1 250px"
          }}
        />

        <select
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Specialties</option>

          {specialties.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}

        </select>

        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Cities</option>

          {cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}

        </select>

        <select
          value={availability}
          onChange={e => setAvailability(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Availability</option>
          <option value="available">Available</option>
          <option value="not_available">Not Available</option>
          <option value="in_process">In Process</option>
        </select>

      </div>

      <div style={{
        color: "#64748b",
        fontSize: "13px",
        marginBottom: "10px"
      }}>
        {loading
          ? "Loading rejected doctors..."
          : `Showing ${filteredRecords.length} rejection record(s)`}
      </div>

      {/* TABLE */}

      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "9px",
        overflowX: "auto"
      }}>

        <table
          width="100%"
          cellPadding="11"
          style={{
            minWidth: "1350px",
            borderCollapse: "collapse",
            fontSize: "13px"
          }}
        >

          <thead style={{
            background: "#f8fafc",
            textAlign: "left"
          }}>
            <tr>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Qualification</th>
              <th>Experience</th>
              <th>Location</th>
              <th>Expected CTC</th>
              <th>Rejected By</th>
              <th>Rejection Date</th>
              <th>Rejection Remarks</th>
              <th>Availability</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {!loading && filteredRecords.length === 0 && (

              <tr>
                <td
                  colSpan={12}
                  style={{
                    textAlign: "center",
                    padding: "35px",
                    color: "#64748b"
                  }}
                >
                  No rejected doctors found.
                </td>
              </tr>

            )}

            {filteredRecords.map(row => {

              const doctor = row.doctors || {}
              const hospital =
                row.requirements?.hospitals?.hospital_name || "—"

              const whatsappLink = getWhatsAppLink(doctor.phone)

              return (

                <tr
                  key={row.id}
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    verticalAlign: "top"
                  }}
                >

                  <td style={{ minWidth: "150px" }}>
                    <Link
                      href={`/doctors/${doctor.id}`}
                      style={{
                        color: "#2563eb",
                        fontWeight: "700",
                        textDecoration: "none"
                      }}
                    >
                      {doctor.name || "Unknown Doctor"}
                    </Link>
                  </td>

                  <td>
                    {doctor.specialties?.name || "—"}
                  </td>

                  <td>
                    {doctor.qualification || "—"}
                  </td>

                  <td>
                    {doctor.experience_years != null
                      ? `${doctor.experience_years} yrs`
                      : "—"}
                  </td>

                  <td style={{ minWidth: "130px" }}>
                    {doctor.city || "—"}
                    <div style={{
                      color: "#64748b",
                      fontSize: "11px",
                      marginTop: "4px"
                    }}>
                      Preferred: {doctor.preferred_location || "—"}
                    </div>
                  </td>

                  <td>
                    {formatCurrency(doctor.expected_ctc)}
                  </td>

                  <td style={{
                    minWidth: "150px",
                    fontWeight: "600"
                  }}>
                    {hospital}
                  </td>

                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatDate(row.rejected_at)}
                  </td>

                  <td style={{
                    minWidth: "200px",
                    maxWidth: "280px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere"
                  }}>
                    {row.remarks || "—"}
                  </td>

                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                      background:
                        doctor.availability_status === "available"
                          ? "#dcfce7"
                          : "#f1f5f9",
                      color:
                        doctor.availability_status === "available"
                          ? "#166534"
                          : "#475569"
                    }}>
                      {doctor.availability_status || "Unknown"}
                    </span>
                  </td>

                  <td style={{ whiteSpace: "nowrap" }}>
                    {doctor.phone || "—"}
                  </td>

                  <td style={{ minWidth: "145px" }}>

                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Contact doctor on WhatsApp"
                        style={{
                          marginRight: "10px",
                          textDecoration: "none"
                        }}
                      >
                        💬
                      </a>
                    )}

                    <button
                      onClick={() => copyDoctorProfile(row)}
                      title="Copy doctor profile"
                      style={{
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        borderRadius: "5px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Copy Profile
                    </button>

                  </td>

                </tr>

              )

            })}

          </tbody>

        </table>

      </div>

      <div style={{
        marginTop: "14px",
        fontSize: "12px",
        color: "#64748b"
      }}>
        Each row represents one rejected hospital recruitment record.
        A doctor rejected by multiple hospitals may appear more than once.
      </div>

    </div>

  )

}
