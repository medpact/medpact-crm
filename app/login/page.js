
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { USERS } from "../../lib/users"

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function login() {
    setError("")

    const user = USERS.find(
      (u) =>
        u.username === username.trim() &&
        u.password === password
    )

    if (!user) {
      setError("Invalid username or password")
      return
    }

    try {
      // Save the logged-in user
      localStorage.setItem(
        "medpact_user",
        JSON.stringify(user)
      )

      // Start the 10-hour session
      localStorage.setItem(
        "medpact_login_time",
        String(Date.now())
      )

      setLoading(true)

      // Return to the dashboard
      router.push("/")
      router.refresh()
    } catch (err) {
      localStorage.removeItem("medpact_user")
      localStorage.removeItem("medpact_login_time")
      setError("Unable to save login. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: "20px"
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          width: "350px",
          maxWidth: "100%",
          boxShadow: "0 4px 16px rgba(15,23,42,0.06)"
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          Medpact CRM Login
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            login()
          }}
        >
          <input
            type="text"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              boxSizing: "border-box",
              width: "100%",
              padding: "10px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px"
            }}
          />

          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              boxSizing: "border-box",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px"
            }}
          />

          {error && (
            <p
              style={{
                color: "#dc2626",
                fontSize: "14px"
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              background: loading ? "#64748b" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              marginTop: "10px",
              cursor: loading ? "wait" : "pointer"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}
