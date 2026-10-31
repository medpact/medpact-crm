
"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function DoctorsPage() {

  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])

  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [city, setCity] = useState("")
  const [availability, setAvailability] = useState("")

  const [page, setPage] = useState(1)
  const pageSize = 20

  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchSpecialties()
  }, [])

  useEffect(() => {
    fetchDoctors()
  }, [search, specialty, city, availability, page])

  // FORMAT DATE
  function formatDate(date) {
    if (!date) return ""

    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()

    return `${day}/${month}/${year}`
  }

  // LOAD SPECIALTIES
  async function fetchSpecialties() {
    const { data, error } = await supabase
      .from("specialties")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error loading specialties:", error)
      return
    }

    setSpecialties(data || [])
  }

  // LOAD DOCTORS
  async function fetchDoctors() {

    let query = supabase
      .from("doctors")
      .select(`
        id,
        name,
        experience_years,
        phone,
        availability_status,
        specialty_id,
        preferred_location,
        created_at,
        source,
        specialties(name)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, (page * pageSize) - 1)

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    if (specialty) {
      query = query.eq("specialty_id", specialty)
    }

    if (city) {
      query = query.ilike("preferred_location", `%${city}%`)
    }

    if (availability) {
      query = query.eq("availability_status", availability)
    }

    const { data, count, error } = await query

    if (error) {
      console.error("Error loading doctors:", error)
      return
    }

    setDoctors(data || [])
    setTotal(count || 0)
  }

  // IDENTIFY REGISTRATION SOURCE
  // Direct entries intentionally return null (no symbol).
  function getSource(source) {

    const value = String(source || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "")

    // Medpact Website
    if (
      value === "medpactwebsite" ||
      value === "website" ||
      value === "medpact"
    ) {
      return {
        symbol: "W",
        label: "Medpact Website",
        color: "#1d4ed8",
        background: "#dbeafe"
      }
    }

    // Google Forms
    if (
      value === "googleform" ||
      value === "googleforms" ||
      value === "google"
    ) {
      return {
        symbol: "G",
        label: "Google Forms",
        color: "#166534",
        background: "#dcfce7"
      }
    }

    // Direct employee entry or unknown source:
    // Do not display any symbol.
    return null
  }

  const totalPages = Math.ceil(total / pageSize)

  return (

    <div style={{
      padding: "30px",
      color: "#0f172a"
    }}>

      {/* HEADER */}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px"
      }}>

        <h2>Doctors</h2>

        <Link href="/doctors/add">
          <button style={{
            padding: "10px 18px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}>
            + Add Doctor
          </button>
        </Link>

      </div>

      {/* SOURCE LEGEND */}

      <div style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "18px",
        padding: "12px 15px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        marginBottom: "20px",
        fontSize: "12px"
      }}>

        <strong>Registration Source:</strong>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "19px",
            height: "19px",
            borderRadius: "50%",
            background: "#dcfce7",
            color: "#166534",
            fontWeight: "800"
          }}>
            G
          </span>
          Google Forms
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "19px",
            height: "19px",
            borderRadius: "50%",
            background: "#dbeafe",
            color: "#1d4ed8",
            fontWeight: "800"
          }}>
            W
          </span>
          Medpact Website
        </div>

        <span style={{ color: "#64748b" }}>
          No symbol = Direct Entry
        </span>

      </div>

      {/* FILTERS */}

      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>

        <input
          placeholder="Search name or phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px"
          }}
        />

        <select
          value={specialty}
          onChange={(e) => {
            setSpecialty(e.target.value)
            setPage(1)
          }}
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px"
          }}
        >

          <option value="">All Specialties</option>

          {specialties.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}

        </select>

        <input
          placeholder="Relocation City"
          value={city}
          onChange={(e) => {
            setCity(e.target.value)
            setPage(1)
          }}
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px"
          }}
        />

        <select
          value={availability}
          onChange={(e) => {
            setAvailability(e.target.value)
            setPage(1)
          }}
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px"
          }}
        >

          <option value="">Availability</option>
          <option value="available">Available</option>
          <option value="not_available">Not Available</option>
          <option value="in_process">In Process</option>

        </select>

      </div>

      {/* TABLE */}

      <div style={{
        border: "1px solid #eee",
        borderRadius: "8px",
        overflowX: "auto"
      }}>

        <table width="100%" cellPadding="12">

          <thead style={{
            background: "#f8fafc",
            textAlign: "left"
          }}>

            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Specialty</th>
              <th>Experience</th>
              <th>Relocation City</th>
              <th>Availability</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {doctors.map(d => {

              const source = getSource(d.source)

              return (

                <tr
                  key={d.id}
                  style={{ borderTop: "1px solid #eee" }}
                >

                  <td>{formatDate(d.created_at)}</td>

                  {/* DOCTOR NAME AND SOURCE */}

                  <td>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "flex-start",
                      gap: "5px"
                    }}>

                      <span style={{
                        fontWeight: "600"
                      }}>
                        {d.name}
                      </span>

                      {source && (
                        <span
                          title={source.label}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "17px",
                            height: "17px",
                            borderRadius: "50%",
                            background: source.background,
                            color: source.color,
                            fontSize: "10px",
                            fontWeight: "800",
                            cursor: "help",
                            marginTop: "-5px",
                            flexShrink: 0
                          }}
                        >
                          {source.symbol}
                        </span>
                      )}

                    </div>
                  </td>

                  <td>{d.specialties?.name}</td>

                  <td>{d.experience_years} yrs</td>

                  <td>{d.preferred_location}</td>

                  <td>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      background: "#e0f2fe",
                      fontSize: "12px"
                    }}>
                      {d.availability_status}
                    </span>
                  </td>

                  <td>{d.phone}</td>

                  <td>

                    <a
                      href={`https://wa.me/91${d.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginRight: "10px" }}
                      title="WhatsApp"
                    >
                      💬
                    </a>

                    <Link href={`/doctors/${d.id}`}>
                      👁
                    </Link>

                  </td>

                </tr>

              )
            })}

            {doctors.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b"
                  }}
                >
                  No doctors found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div style={{
        marginTop: "20px",
        display: "flex",
        gap: "6px",
        flexWrap: "wrap"
      }}>

        {Array.from({ length: totalPages }).map((_, i) => {

          const p = i + 1

          return (

            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: page === p ? "#2563eb" : "#fff",
                color: page === p ? "#fff" : "#000",
                cursor: "pointer"
              }}
            >
              {p}
            </button>

          )

        })}

      </div>

    </div>
  )
}
