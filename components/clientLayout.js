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

    // 🔒 Protect everything except public pages
    if (
      !user &&
      !pathname.startsWith("/medicaltourism") &&
      pathname !== "/login"
    ) {
      router.push("/login")
    }

    setChecked(true)

  }, [pathname])

  // ⏳ Wait until auth check completes
  if (!checked) return null

  // 🌍 Public pages (no sidebar)
  if (
    pathname === "/login" ||
    pathname.startsWith("/medicaltourism")
  ) {
    return children
  }

  // 🔒 Protected layout
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "30px", background: "#f8fafc" }}>
        {children}
      </div>
    </div>
  )
}
