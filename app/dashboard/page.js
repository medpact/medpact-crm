"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js"
import dynamic from "next/dynamic"

const Pie = dynamic(
  () => import("react-chartjs-2").then((m) => m.Pie),
  { ssr: false }
)

const Bar = dynamic(
  () => import("react-chartjs-2").then((m) => m.Bar),
  { ssr: false }
)

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
)

const stateColors = [
  { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
  { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  { bg: "#f3e8ff", text: "#7e22ce", border: "#d8b4fe" },
  { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
  { bg: "#cffafe", text: "#155e75", border: "#67e8f9" },
  { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
  { bg: "#e0e7ff", text: "#3730a3", border: "#a5b4fc" },
  { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
  { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  { bg: "#fae8ff", text: "#86198f", border: "#f0abfc" },
  { bg: "#ecfccb", text: "#3f6212", border: "#bef264" },
  { bg: "#ffedd5", text: "#7c2d12", border: "#fed7aa" },
  { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
  { bg: "#fef9c3", text: "#854d0e", border: "#fde047" }
]

function getStateColor(state) {
  if (!state || state === "Unknown") {
    return {
      bg: "#f1f5f9",
      text: "#475569",
      border: "#cbd5e1"
    }
  }

  let hash = 0
  const normalized = state.trim().toLowerCase()

  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0
  }

  return stateColors[hash % stateColors.length]
}

// Fixed display figures for the Rajesh dashboard.
// Other users continue to see live Supabase state-wise data.
const RAJESH_STATE_FIGURES = [
  { state: "Andhra Pradesh", requirements: 68, placements: 43 },
  { state: "Telangana", requirements: 57, placements: 23 },
  { state: "Odisha", requirements: 14, placements: 6 },
  { state: "Chhattisgarh", requirements: 11, placements: 8 },
  { state: "Uttar Pradesh", requirements: 11, placements: 3 },
  { state: "Assam", requirements: 7, placements: 2 },
  { state: "Delhi", requirements: 20, placements: 9 },
  { state: "Karnataka", requirements: 18, placements: 11 },
  { state: "Maharashtra", requirements: 10, placements: 4 }
]

export default function Dashboard() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({})
  const [pipeline, setPipeline] = useState({})
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState("")

  const [specialtyChart, setSpecialtyChart] = useState({
    labels: [],
    datasets: []
  })

  const [hospitalChart, setHospitalChart] = useState({
    labels: [],
    datasets: []
  })

  const [stateSummary, setStateSummary] = useState([])

  useEffect(() => {
    const host = window.location.hostname

    if (host.includes("care.medpact.in")) {
      router.replace("/medicalneeds")
      return
    }

    const SESSION_KEY = "medpact_login_time"
    const SESSION_DURATION_MS = 10 * 60 * 60 * 1000

    const userStr = localStorage.getItem("medpact_user")
    const loginTimeRaw = localStorage.getItem(SESSION_KEY)
    const loginTime = Number(loginTimeRaw)

    if (
      !userStr ||
      !loginTimeRaw ||
      !Number.isFinite(loginTime) ||
      loginTime <= 0
    ) {
      localStorage.removeItem("medpact_user")
      localStorage.removeItem(SESSION_KEY)
      router.replace("/login")
      return
    }

    const elapsed = Date.now() - loginTime

    if (elapsed >= SESSION_DURATION_MS || elapsed < 0) {
      localStorage.removeItem("medpact_user")
      localStorage.removeItem(SESSION_KEY)
      router.replace("/login")
      return
    }

    let userObj

    try {
      userObj = JSON.parse(userStr)
    } catch {
      localStorage.removeItem("medpact_user")
      localStorage.removeItem(SESSION_KEY)
      router.replace("/login")
      return
    }

    const username =
      userObj.username?.trim().toLowerCase() || ""

    if (!username) {
      localStorage.removeItem("medpact_user")
      localStorage.removeItem(SESSION_KEY)
      router.replace("/login")
      return
    }

    setCurrentUser(username)
    setMounted(true)
    loadDashboard(username)

    const remaining = SESSION_DURATION_MS - elapsed

    const logoutTimer = window.setTimeout(() => {
      localStorage.removeItem("medpact_user")
      localStorage.removeItem(SESSION_KEY)
      router.replace("/login")
    }, remaining)

    return () => window.clearTimeout(logoutTimer)
  }, [router])

  async function sendReport() {
    setSending(true)

    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!res.ok) {
        alert("API not reachable")
        setSending(false)
        return
      }

      const data = await res.json()

      if (data.success) {
        alert("Report sent successfully")
      } else {
        alert("Failed: " + data.error)
      }
    } catch (err) {
      alert("Error: " + err.message)
    }

    setSending(false)
  }

  async function loadDashboard(username = "") {
    const [
      doctors,
      hospitals,
      requirements,
      shortlists,
      placements
    ] = await Promise.all([
      supabase.from("doctors").select("*", {
        count: "exact",
        head: true
      }),
      supabase.from("hospitals").select("*", {
        count: "exact",
        head: true
      }),
      supabase.from("requirements").select("*", {
        count: "exact",
        head: true
      }),
      supabase.from("shortlists").select("status"),
      supabase.from("placements").select("*", {
        count: "exact",
        head: true
      })
    ])

    const isRajesh = username === "rajesh"

    setStats({
      doctors: doctors.count || 0,
      hospitals: hospitals.count || 0,
      requirements: requirements.count || 0,
      shortlists: shortlists.data?.length || 0,
      placements: isRajesh ? 89 : (placements.count || 0)
    })

    const counts = {
      shortlisted: 0,
      interview: 0,
      offer: 0,
      placed: 0
    }

    shortlists.data?.forEach((s) => {
      if (s.status === "shortlisted") counts.shortlisted++
      if (s.status === "interview_assigned") counts.interview++
      if (s.status === "offer_released") counts.offer++
    })

    counts.placed = isRajesh ? 89 : (placements.count || 0)
    setPipeline(counts)

    const { data: specs } = await supabase
      .from("specialties")
      .select("id,name")

    const { data: doctorCounts } = await supabase
      .from("doctors")
      .select("specialty_id")

    const { data: reqCounts } = await supabase
      .from("requirements")
      .select("specialty_id")

    const doctorMap = {}
    const reqMap = {}

    doctorCounts?.forEach((d) => {
      doctorMap[d.specialty_id] =
        (doctorMap[d.specialty_id] || 0) + 1
    })

    reqCounts?.forEach((r) => {
      reqMap[r.specialty_id] =
        (reqMap[r.specialty_id] || 0) + 1
    })

    const labels = []
    const doctorData = []
    const reqData = []

    specs?.forEach((s) => {
      labels.push(s.name)
      doctorData.push(doctorMap[s.id] || 0)
      reqData.push(reqMap[s.id] || 0)
    })

    setSpecialtyChart({
      labels,
      datasets: [
        {
          label: "Doctors",
          data: doctorData,
          backgroundColor: "#2563eb"
        },
        {
          label: "Requirements",
          data: reqData,
          backgroundColor: "#ef4444"
        }
      ]
    })

    const { data: hosps } = await supabase
      .from("hospitals")
      .select("id,hospital_name")

    const { data: reqHosp } = await supabase
      .from("requirements")
      .select("hospital_id")

    const hospMap = {}
    const hLabels = []
    const hData = []

    reqHosp?.forEach((r) => {
      hospMap[r.hospital_id] =
        (hospMap[r.hospital_id] || 0) + 1
    })

    hosps?.forEach((h) => {
      if (hospMap[h.id]) {
        hLabels.push(h.hospital_name)
        hData.push(hospMap[h.id])
      }
    })

    setHospitalChart({
      labels: hLabels,
      datasets: [
        {
          label: "Open Requirements",
          data: hData,
          backgroundColor: "#8b5cf6"
        }
      ]
    })

    const { data: hospitalsData, error: stateError } =
      await supabase
        .from("hospitals")
        .select(`
          id,
          states!fk_hospital_state (
            name
          )
        `)

    if (stateError) {
      console.error(
        "Error fetching hospital states:",
        stateError
      )

      if (isRajesh) {
        setStateSummary(RAJESH_STATE_FIGURES)
      } else {
        setStateSummary([])
      }

      return
    }

    const hospitalStateMap = {}

    hospitalsData?.forEach((h) => {
      hospitalStateMap[h.id] =
        h.states?.name || "Unknown"
    })

    const { data: requirementsData, error: reqError } =
      await supabase
        .from("requirements")
        .select("hospital_id")

    if (reqError) {
      console.error(
        "Error fetching state requirements:",
        reqError
      )
    }

    const { data: placementsData, error: placementError } =
      await supabase
        .from("placements")
        .select("hospital_id")

    if (placementError) {
      console.error(
        "Error fetching state placements:",
        placementError
      )
    }

    const stateMap = {}

    requirementsData?.forEach((r) => {
      const state =
        hospitalStateMap[r.hospital_id] || "Unknown"

      if (!stateMap[state]) {
        stateMap[state] = {
          state,
          requirements: 0,
          placements: 0
        }
      }

      stateMap[state].requirements++
    })

    placementsData?.forEach((p) => {
      const state =
        hospitalStateMap[p.hospital_id] || "Unknown"

      if (!stateMap[state]) {
        stateMap[state] = {
          state,
          requirements: 0,
          placements: 0
        }
      }

      stateMap[state].placements++
    })

    const actualStateSummary = Object.values(stateMap).sort(
      (a, b) => b.requirements - a.requirements
    )

    if (isRajesh) {
      setStateSummary(RAJESH_STATE_FIGURES)
    } else {
      setStateSummary(actualStateSummary)
    }
  }

  function card(title, value, color) {
    return (
      <div
        key={title}
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "20px",
          width: "220px",
          boxShadow: "0 2px 5px rgba(15,23,42,0.03)"
        }}
      >
        <h4 style={{ margin: 0, color: "#64748b" }}>
          {title}
        </h4>

        <h2 style={{ marginTop: "10px", color }}>
          {value}
        </h2>
      </div>
    )
  }

  const pieData = {
    labels: [
      "Shortlisted",
      "Interview",
      "Offer",
      "Placed"
    ],
    datasets: [
      {
        data: [
          pipeline.shortlisted || 0,
          pipeline.interview || 0,
          pipeline.offer || 0,
          pipeline.placed || 0
        ],
        backgroundColor: [
          "#f59e0b",
          "#3b82f6",
          "#8b5cf6",
          "#22c55e"
        ]
      }
    ]
  }

  const barData = {
    labels: [
      "Doctors",
      "Hospitals",
      "Requirements",
      "Placements"
    ],
    datasets: [
      {
        label: "System Overview",
        data: [
          stats.doctors || 0,
          stats.hospitals || 0,
          stats.requirements || 0,
          stats.placements || 0
        ],
        backgroundColor: [
          "#2563eb",
          "#16a34a",
          "#f59e0b",
          "#22c55e"
        ]
      }
    ]
  }

  return (
    <div style={{ color: "#0f172a" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "25px"
        }}
      >
        <h2>Dashboard- From April 2026</h2>

        {currentUser === "nagireddy" && (
          <button
            onClick={sendReport}
            disabled={sending}
            style={{
              padding: "8px 16px",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.7 : 1
            }}
          >
            {sending ? "Sending..." : "Send Report"}
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "40px"
        }}
      >
        {card("Doctors", stats.doctors, "#2563eb")}
        {card("Hospitals", stats.hospitals, "#16a34a")}
        {card("Requirements", stats.requirements, "#f59e0b")}
        {card("Shortlisted", stats.shortlists, "#8b5cf6")}
        {card("Placements", stats.placements, "#22c55e")}
      </div>

      <h3 style={{ marginBottom: "20px" }}>
        Requirements by State
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "40px"
        }}
      >
        {stateSummary.map((s) => {
          const colors = getStateColor(s.state)

          return (
            <div
              key={s.state}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderLeft: `5px solid ${colors.text}`,
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "0 3px 8px rgba(15,23,42,0.04)",
                transition:
                  "transform 0.15s ease, box-shadow 0.15s ease"
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "7px",
                    padding: "7px 12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "0.2px"
                  }}
                >
                  {s.state}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px"
                }}
              >
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  Open Requirements
                </span>

                <span
                  style={{
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    borderRadius: "8px",
                    minWidth: "34px",
                    padding: "5px 9px",
                    textAlign: "center",
                    fontWeight: 700
                  }}
                >
                  {s.requirements}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  Placements
                </span>

                <span
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: "8px",
                    minWidth: "34px",
                    padding: "5px 9px",
                    textAlign: "center",
                    fontWeight: 700
                  }}
                >
                  {s.placements}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {mounted && (
        <>
          <div
            style={{
              display: "flex",
              gap: "40px",
              flexWrap: "wrap",
              marginBottom: "40px"
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                width: "420px"
              }}
            >
              <h4>Recruitment Pipeline</h4>
              <Pie data={pieData} />
            </div>

            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                width: "520px"
              }}
            >
              <h4>System Overview</h4>
              <Bar data={barData} />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "40px",
              flexWrap: "wrap"
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                width: "520px"
              }}
            >
              <h4>Demand vs Supply by Specialty</h4>

              {specialtyChart.datasets?.length > 0 && (
                <Bar data={specialtyChart} />
              )}
            </div>

            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                width: "520px"
              }}
            >
              <h4>Top Hiring Hospitals</h4>

              {hospitalChart.datasets?.length > 0 && (
                <Bar data={hospitalChart} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
