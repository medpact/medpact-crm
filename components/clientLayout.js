
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "./sidebar"

export default function ClientLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const host = window.location.hostname.toLowerCase()

    const isMedicalSite = host === "care.medpact.in"

    const isRecruitmentSite =
      host === "www.medpact.in" ||
      host === "medpact.in" ||
      pathname === "/recruitment" ||
      pathname.startsWith("/recruitment/")

    if (isMedicalSite || isRecruitmentSite || pathname === "/login") {
      setChecked(true)
      return
    }

    const userStr = localStorage.getItem("medpact_user")
    let loggedIn = false

    if (userStr) {
      try {
        const userObj = JSON.parse(userStr)
        loggedIn = Boolean(userObj.username)
      } catch {
        loggedIn = false
      }
    }

    if (!loggedIn) {
      router.replace("/login")
      return
    }

    setChecked(true)
  }, [pathname, router])

  if (!checked) return null

  const host =
    typeof window !== "undefined"
      ? window.location.hostname.toLowerCase()
      : ""

  const isMedicalSite = host === "care.medpact.in"

  const isRecruitmentSite =
    host === "www.medpact.in" ||
    host === "medpact.in" ||
    pathname === "/recruitment" ||
    pathname.startsWith("/recruitment/")

  if (
    pathname === "/login" ||
    isMedicalSite ||
    isRecruitmentSite
  ) {
    return children
  }

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
