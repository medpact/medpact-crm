"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "./sidebar"

export default function ClientLayout({ children }) {

  const router = useRouter()
  const pathname = usePathname()

  const [checked, setChecked] = useState(false)

  useEffect(() => {

    const user = localStorage.getItem("medpact_user")

    const host = window.location.hostname

    const isMedicalSite = host.includes("care.medpact.in")

    // 🔒 Only protect dashboard domain
    if (!user && !isMedicalSite && pathname !== "/login") {
      router.push("/login")
    }

    setChecked(true)

  }, [pathname])

  // ⏳ Wait until auth check completes
  if (!checked) return null

  const host =
    typeof window !== "undefined" ? window.location.hostname : ""

  const isMedicalSite = host.includes("care.medpact.in")

  // 🌍 Public pages (no sidebar)
  if (pathname === "/login" || isMedicalSite) {
    return children
  }

  // 🔒 Protected dashboard layout
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          padding: "30px",
          background: "#f8fafc",
        }}
      >
        {children}
      </div>
    </div>
  )
}
