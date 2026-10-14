```javascript
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
  const [source, setSource] = useState("")

  const [page, setPage] = useState(1)
  const pageSize = 20
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSpecialties()
  }, [])

  useEffect(() => {
    fetchDoctors()
  }, [search, specialty, city, availability, source, page])

  function formatDate(date) {
  if (!date) return ""

  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()

  return day + "/" + month + "/" + year
}
  function getSourceLabel(value) {
    if (value === "Online Registration") return "Online Registration"
    if (value === "Google Form") return "Google Form"
    if (value === "Manual Entry") return "Manual Entry"
    return value || "Manual Entry"
  }

  function getSourceStyle(value) {
    const label = getSourceLabel(value)

    if (label === "Online Registration") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      }
    }

    if (label === "Google Form") {
      return {
        background: "#dcfce7",
        color: "#166534",
      }
    }

    return {
      background: "#f1f5f9",
      color: "#475569",
    }
  }

  async function fetchSpecialties() {
    const { data, error } = await supabase
      .from("specialties")
      .select("*")
      .order("name")

    if (error) {
      console.error("Unable to load specialties:", error.message)
      return
    }

    setSpecialties(data || [])
  }

  async function fetchDoctors() {
    setLoading(true)

    try {
      let query = supabase
        .from("doctors")
        .select(
          `
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
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (search.trim()) {
        const term = search.trim().replace(/[%(),]/g, " ")
        query = query.or(
          `name.ilike.%${term}%,phone.ilike.%${term}%`
        )
      }

      if (specialty) {
        query = query.eq("specialty_id", specialty)
      }

      if (city.trim()) {
        query = query.ilike(
          "preferred_location",
          `%${city.trim()}%`
        )
      }

      if (availability) {
        query = query.eq("availability_status", availability)
      }

      if (source === "Manual Entry") {
        query = query.or("source.is.null,source.eq.")
      } else if (source) {
        query = query.eq("source", source)
      }

      const { data, count, error } = await query

      if (error) {
        console.error("Unable to load doctors:", error.message)
        alert("Unable to load doctors. Please refresh the page.")
        setDoctors([])
        setTotal(0)
        return
      }

      setDoctors(data || [])
      setTotal(count || 0)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  function updateFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  const inputStyle = {
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    minWidth: "150px",
    background: "#fff",
    color: "#0f172a",
  }

  return (
    <div
      style={{
        padding: "30px",
        color: "#0f172a",
        maxWidth: "100%",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "26px" }}>Doctors</h2>
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            Total doctors: {total}
          </p>
        </div>

        <Link href="/doctors/add" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "10px 18px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            + Add Doctor
          </button>
        </Link>
      </div>

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          placeholder="Search name or phone"
          value={search}
          onChange={(e) => updateFilter(setSearch, e.target.value)}
          style={inputStyle}
        />

        <select
          value={specialty}
          onChange={(e) => updateFilter(setSpecialty, e.target.value)}
          style={inputStyle}
        >
          <option value="">All Specialties</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Relocation City"
          value={city}
          onChange={(e) => updateFilter(setCity, e.target.value)}
          style={inputStyle}
        />

        <select
          value={availability}
          onChange={(e) =>
            updateFilter(setAvailability, e.target.value)
          }
          style={inputStyle}
        >
          <option value="">All Availability</option>
          <option value="available">Available</option>
          <option value="not_available">Not Available</option>
          <option value="in_process">In Process</option>
        </select>

        <select
          value={source}
          onChange={(e) => updateFilter(setSource, e.target.value)}
          style={inputStyle}
        >
          <option value="">All Registration Sources</option>
          <option value="Online Registration">
            Online Registration
          </option>
          <option value="Google Form">Google Form</option>
          <option value="Manual Entry">Manual Entry</option>
        </select>
      </div>

      {/* DOCTORS TABLE */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          overflowX: "auto",
          background: "#fff",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "1100px",
            borderCollapse: "collapse",
          }}
        >
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>
              {[
                "Date",
                "Name / Source",
                "Specialty",
                "Experience",
                "Relocation City",
                "Availability",
                "Phone",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    padding: "12px",
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: "25px", textAlign: "center" }}>
                  Loading doctors...
                </td>
              </tr>
            ) : doctors.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "25px", textAlign: "center" }}>
                  No doctors found.
                </td>
              </tr>
            ) : (
              doctors.map((d) => {
                const label = getSourceLabel(d.source)
                const badgeStyle = getSourceStyle(d.source)

                return (
                  <tr key={d.id}>
                    <td style={cellStyle}>{formatDate(d.created_at)}</td>

                    <td style={{ ...cellStyle, minWidth: "190px" }}>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "6px",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          ...badgeStyle,
                        }}
                      >
                        {label}
                      </span>
                    </td>

                    <td style={cellStyle}>
                      {d.specialties?.name || "—"}
                    </td>

                    <td style={cellStyle}>
                      {d.experience_years ?? "—"} yrs
                    </td>

                    <td style={cellStyle}>
                      {d.preferred_location || "—"}
                    </td>

                    <td style={cellStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          background: "#e0f2fe",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.availability_status || "—"}
                      </span>
                    </td>

                    <td style={cellStyle}>{d.phone || "—"}</td>

                    <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                      {d.phone && (
                        <a
                          href={`https://wa.me/91${String(d.phone).replace(/\D/g, "").replace(/^91/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginRight: "12px", textDecoration: "none" }}
                          title="WhatsApp"
                        >
                          💬
                        </a>
                      )}

                      <Link
                        href={`/doctors/${d.id}`}
                        title="View doctor"
                        style={{ textDecoration: "none" }}
                      >
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

      {/* PAGINATION */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {totalPages > 1 &&
          Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: "7px 11px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: page === p ? "#2563eb" : "#fff",
                color: page === p ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}

        <span style={{ color: "#64748b", fontSize: "13px" }}>
          {total === 0
            ? "0 doctors"
            : `Showing ${(page - 1) * pageSize + 1}–${Math.min(
                page * pageSize,
                total
              )} of ${total}`}
        </span>
      </div>
    </div>
  )
}

const cellStyle = {
  padding: "12px",
  borderTop: "1px solid #eee",
  verticalAlign: "middle",
}
```
