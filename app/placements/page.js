
"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function PlacementsPage() {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlacements()
  }, [])

  async function loadPlacements() {
    setLoading(true)

    const { data, error } = await supabase
      .from("placements")
      .select(`
        id,
        doctor_id,
        hospital_id,
        joining_date,
        ctc,
        placement_fee,
        doctors (
          id,
          name,
          phone,
          specialties(name)
        ),
        hospitals (
          hospital_name
        )
      `)
      .order("joining_date", { ascending: false })

    if (error) {
      console.error("Error loading placements:", error)
      setLoading(false)
      return
    }

    setPlacements(data || [])
    setLoading(false)
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === "") {
      return "—"
    }

    return "₹" + Number(amount).toLocaleString("en-IN")
  }

  return (
    <div style={{ color: "#0f172a" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Placements
      </h2>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        <table
          width="100%"
          cellPadding="12"
          style={{
            borderCollapse: "collapse",
            minWidth: "750px",
          }}
        >
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th align="left">Doctor</th>
              <th align="left">Specialty</th>
              <th align="left">Hospital</th>
              <th align="left">Joining Date</th>
              <th align="left">Salary</th>
              <th align="left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>
                  Loading placements...
                </td>
              </tr>
            ) : placements.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>
                  No placements found.
                </td>
              </tr>
            ) : (
              placements.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderTop: "1px solid #e5e7eb" }}
                >
                  <td>
                    <Link href={`/doctors/${p.doctors?.id}`}>
                      {p.doctors?.name || "Unknown Doctor"}
                    </Link>
                  </td>

                  <td>
                    {p.doctors?.specialties?.name || "—"}
                  </td>

                  <td>
                    {p.hospitals?.hospital_name || "—"}
                  </td>

                  <td>
                    {p.joining_date || "—"}
                  </td>

                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatCurrency(p.ctc)}
                  </td>

                  <td>
                    {p.doctors?.phone ? (
                      <a
                        href={`https://wa.me/91${String(
                          p.doctors.phone
                        ).replace(/\D/g, "").replace(/^91/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Contact doctor on WhatsApp"
                      >
                        💬
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
