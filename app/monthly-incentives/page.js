
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../../lib/supabase"

const money = (value) =>
  "₹" + Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })

const monthLabel = (month) => {
  const [year, monthNumber] = month.split("-").map(Number)
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })
}

function getIncentiveRate(total) {
  if (total < 500000) return 0
  if (total < 650000) return 7
  if (total < 750000) return 8
  if (total < 900000) return 10
  return 12
}

export default function MonthlyIncentivesPage() {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("all")

  useEffect(() => {
    loadPlacements()
  }, [])

  async function loadPlacements() {
    setLoading(true)
    setErrorMessage("")

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
          specialties (
            name
          )
        ),
        hospitals (
          hospital_name
        )
      `)
      .order("joining_date", { ascending: false })

    if (error) {
      console.error("Unable to load placements:", error)
      setErrorMessage(error.message)
      setPlacements([])
    } else {
      setPlacements(data || [])
    }

    setLoading(false)
  }

  // Group placements by actual joining month.
  const grouped = {}

  placements.forEach((placement) => {
    if (!placement.joining_date) return

    const month = placement.joining_date.slice(0, 7)

    if (!grouped[month]) {
      grouped[month] = {
        month,
        count: 0,
        totalFees: 0,
        placements: [],
      }
    }

    const fee = Number(placement.placement_fee || 0)

    grouped[month].count += 1
    grouped[month].totalFees += fee
    grouped[month].placements.push(placement)
  })

  const monthlyData = Object.values(grouped)
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((item) => {
      const rate = getIncentiveRate(item.totalFees)

      return {
        ...item,
        rate,
        incentive: Math.round(item.totalFees * rate) / 100,
      }
    })

  const visibleMonths =
    selectedMonth === "all"
      ? monthlyData
      : monthlyData.filter((item) => item.month === selectedMonth)

  const visiblePlacements = placements.filter((placement) => {
    if (!placement.joining_date) return false

    return (
      selectedMonth === "all" ||
      placement.joining_date.slice(0, 7) === selectedMonth
    )
  })

  const visibleTotalFees = visibleMonths.reduce(
    (sum, item) => sum + item.totalFees,
    0
  )

  const visibleIncentive = visibleMonths.reduce(
    (sum, item) => sum + item.incentive,
    0
  )

  const visibleCount = visibleMonths.reduce(
    (sum, item) => sum + item.count,
    0
  )

  return (
    <div
      style={{
        padding: "24px",
        color: "#0f172a",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "26px" }}>
            Monthly Placements & Incentives
          </h1>
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            Monthly placement fees and estimated team incentive
          </p>
        </div>

        <button
          onClick={loadPlacements}
          style={{
            background: "#0f4c81",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: "14px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          Unable to load placements: {errorMessage}
        </div>
      )}

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <label htmlFor="month-filter" style={{ fontWeight: 600 }}>
          Select Month:
        </label>

        <select
          id="month-filter"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          style={{
            padding: "10px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#fff",
            minWidth: "200px",
          }}
        >
          <option value="all">All Months</option>
          {monthlyData.map((item) => (
            <option key={item.month} value={item.month}>
              {monthLabel(item.month)}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {[
          {
            label: "Total Placements",
            value: visibleCount,
            color: "#1d4ed8",
          },
          {
            label: "Commissionable Placement Fees",
            value: money(visibleTotalFees),
            color: "#047857",
          },
          {
            label: "Estimated Team Incentive",
            value: money(visibleIncentive),
            color: "#7c3aed",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#fff",
              padding: "22px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
                marginBottom: "10px",
              }}
            >
              {card.label}
            </div>

            <div
              style={{
                fontSize: "25px",
                fontWeight: 700,
                color: card.color,
                overflowWrap: "anywhere",
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "28px",
        }}
      >
        <h2 style={{ fontSize: "19px", marginTop: 0 }}>
          Monthly Summary
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "750px",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {[
                  "Month",
                  "Placements",
                  "Total Placement Fees",
                  "Incentive Rate",
                  "Estimated Incentive",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "13px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
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
                  <td colSpan={5} style={{ padding: "24px", textAlign: "center" }}>
                    Loading placements...
                  </td>
                </tr>
              ) : visibleMonths.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "24px", textAlign: "center" }}>
                    No placements found for this selection.
                  </td>
                </tr>
              ) : (
                visibleMonths.map((item) => (
                  <tr key={item.month}>
                    <td style={cellStyle}>
                      <button
                        onClick={() =>
                          setSelectedMonth(
                            selectedMonth === item.month ? "all" : item.month
                          )
                        }
                        style={{
                          color: "#1d4ed8",
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          cursor: "pointer",
                          textDecoration: "underline",
                          font: "inherit",
                          fontWeight: 600,
                        }}
                      >
                        {monthLabel(item.month)}
                      </button>
                    </td>

                    <td style={cellStyle}>{item.count}</td>
                    <td style={cellStyle}>{money(item.totalFees)}</td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          background: item.rate ? "#dcfce7" : "#f1f5f9",
                          color: item.rate ? "#166534" : "#64748b",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontWeight: 700,
                        }}
                      >
                        {item.rate}%
                      </span>
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        fontWeight: 700,
                        color: "#047857",
                      }}
                    >
                      {money(item.incentive)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "28px",
        }}
      >
        <h2 style={{ fontSize: "19px", marginTop: 0 }}>
          Placement Details
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "800px",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {[
                  "Joining Date",
                  "Doctor",
                  "Specialty",
                  "Hospital",
                  "Annual CTC",
                  "Placement Fee",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "13px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
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
                  <td colSpan={6} style={{ padding: "24px", textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : visiblePlacements.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "24px", textAlign: "center" }}>
                    No placement details available.
                  </td>
                </tr>
              ) : (
                visiblePlacements.map((p) => (
                  <tr key={p.id}>
                    <td style={cellStyle}>{p.joining_date || "—"}</td>

                    <td style={cellStyle}>
                      <Link
                        href={`/doctors/${p.doctors?.id || p.doctor_id}`}
                        style={{ color: "#1d4ed8" }}
                      >
                        {p.doctors?.name || "Unknown Doctor"}
                      </Link>
                    </td>

                    <td style={cellStyle}>
                      {p.doctors?.specialties?.name || "—"}
                    </td>

                    <td style={cellStyle}>
                      {p.hospitals?.hospital_name || "—"}
                    </td>

                    <td style={cellStyle}>{money(p.ctc)}</td>

                    <td style={{ ...cellStyle, fontWeight: 600 }}>
                      {money(p.placement_fee)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h2 style={{ fontSize: "19px", marginTop: 0 }}>
          Team Incentive Structure
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "480px",
            }}
          >
            <thead>
              <tr style={{ background: "#0f4c81", color: "#fff" }}>
                <th style={cellStyle}>Monthly Placement Fees</th>
                <th style={cellStyle}>Team Incentive</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Below ₹5,00,000", "0%"],
                ["₹5,00,000 – ₹6,49,999", "7%"],
                ["₹6,50,000 – ₹7,49,999", "8%"],
                ["₹7,50,000 – ₹8,99,999", "10%"],
                ["₹9,00,000 and above", "12%"],
              ].map(([range, rate]) => (
                <tr key={range}>
                  <td style={cellStyle}>{range}</td>
                  <td style={cellStyle}>{rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: 0 }}>
          Incentive is estimated on the entire month's total placement fees.
          Confirm the incentive slabs before using these figures for payroll.
        </p>
      </section>
    </div>
  )
}

const cellStyle = {
  padding: "13px",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
}
