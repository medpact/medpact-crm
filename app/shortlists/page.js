
"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function ShortlistsPage() {
  const [search, setSearch] = useState("")
  const [shortlists, setShortlists] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchShortlists()
  }, [])

  function formatDate(date) {
    if (!date) return ""

    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return ""

    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`
  }

  function formatCurrency(amount) {
    return Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })
  }

  /* FETCH PIPELINE */

  async function fetchShortlists() {
    setLoading(true)

    const { data, error } = await supabase
      .from("shortlists")
      .select(`
        id,
        doctor_id,
        requirement_id,
        status,
        remarks,
        created_at,
        doctors(
          id,
          name,
          phone,
          city,
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
      .neq("status", "rejected")
      .neq("status", "placement_done")
      .neq("status", "closed")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Pipeline loading error:", error)
      alert("Unable to load recruitment pipeline.")
      setLoading(false)
      return
    }

    setShortlists(data || [])
    setLoading(false)
  }

  /* STATUS CHANGE */

  async function changeStatus(row, newStatus, message) {
    if (processingId !== null) return

    /* PLACEMENT CONFIRMATION */

    if (newStatus === "placement_done") {
      const salaryInput = prompt(
        "Enter the agreed annual CTC in INR (numbers only):"
      )

      if (salaryInput === null || !salaryInput.trim()) {
        alert("Annual CTC is mandatory.")
        return
      }

      const salaryText = salaryInput.trim()

      if (!/^\d+(\.\d{1,2})?$/.test(salaryText)) {
        alert("Enter a valid annual CTC using numbers only.")
        return
      }

      const ctc = Number(salaryText)

      if (!Number.isFinite(ctc) || ctc <= 0) {
        alert("Annual CTC must be greater than zero.")
        return
      }

      const feeInput = prompt(
        "Enter the fixed Medpact placement fee in INR (numbers only):"
      )

      if (feeInput === null || !feeInput.trim()) {
        alert("Placement fee is mandatory.")
        return
      }

      const feeText = feeInput.trim()

      if (!/^\d+(\.\d{1,2})?$/.test(feeText)) {
        alert("Enter a valid placement fee using numbers only.")
        return
      }

      const placementFee = Number(feeText)

      if (!Number.isFinite(placementFee) || placementFee <= 0) {
        alert("Placement fee must be greater than zero.")
        return
      }

      const joiningDateInput = prompt(
        "Enter the doctor's actual joining date (YYYY-MM-DD):"
      )

      if (joiningDateInput === null || !joiningDateInput.trim()) {
        alert("Actual joining date is mandatory.")
        return
      }

      const joiningDate = joiningDateInput.trim()

      if (!/^\d{4}-\d{2}-\d{2}$/.test(joiningDate)) {
        alert("Enter joining date in YYYY-MM-DD format.")
        return
      }

      const parsedDate = new Date(`${joiningDate}T00:00:00.000Z`)

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== joiningDate
      ) {
        alert("Enter a valid calendar date.")
        return
      }

      const doctorName = row.doctors?.name || "Unknown doctor"
      const hospitalName =
        row.requirements?.hospitals?.hospital_name || "Unknown hospital"

      const confirmed = confirm(
        `Confirm placement?\n\n` +
        `Doctor: ${doctorName}\n` +
        `Hospital: ${hospitalName}\n` +
        `Annual CTC: ₹${formatCurrency(ctc)}\n` +
        `Placement Fee: ₹${formatCurrency(placementFee)}\n` +
        `Actual Joining Date: ${formatDate(joiningDate)}`
      )

      if (!confirmed) return

      setProcessingId(row.id)

      try {
        /* STEP 1: CREATE PLACEMENT */

        const { error: placementError } = await supabase
          .from("placements")
          .insert({
            doctor_id: row.doctor_id,
            hospital_id: row.requirements?.hospital_id,
            requirement_id: row.requirement_id || null,
            joining_date: joiningDate,
            ctc: ctc,
            placement_fee: placementFee
          })

        if (placementError) {
          console.error("Placement creation error:", placementError)
          alert(
            "Failed to create placement: " + placementError.message
          )
          return
        }

        /* STEP 2: UPDATE PIPELINE STATUS */

        const { error: shortlistError } = await supabase
          .from("shortlists")
          .update({ status: "placement_done" })
          .eq("id", row.id)

        if (shortlistError) {
          console.error("Pipeline update error:", shortlistError)
          alert(
            "Placement was saved, but the pipeline status could not " +
            "be updated. Check the Placements page before retrying."
          )
          await fetchShortlists()
          return
        }

        /* STEP 3: UPDATE DOCTOR AVAILABILITY */

        const { error: doctorError } = await supabase
          .from("doctors")
          .update({ availability_status: "not_available" })
          .eq("id", row.doctor_id)

        if (doctorError) {
          console.error("Doctor availability update error:", doctorError)
          alert(
            "Placement saved, but doctor availability could not be updated."
          )
        }

        /* STEP 4: DELETE FULFILLED REQUIREMENT */

        if (row.requirement_id) {
          const { error: requirementError } = await supabase
            .from("requirements")
            .delete()
            .eq("id", row.requirement_id)

          if (requirementError) {
            console.error(
              "Requirement deletion error:",
              requirementError
            )
            alert(
              "Placement saved, but the requirement could not be deleted."
            )
          }
        }

        alert(
          "Placement recorded successfully.\n\n" +
          `Annual CTC: ₹${formatCurrency(ctc)}\n` +
          `Placement Fee: ₹${formatCurrency(placementFee)}\n` +
          `Joining Date: ${formatDate(joiningDate)}`
        )

        await fetchShortlists()
      } catch (error) {
        console.error("Placement processing error:", error)
        alert(
          "An unexpected error occurred. Check the Placements page " +
          "before attempting this placement again."
        )
      } finally {
        setProcessingId(null)
      }

      return
    }

    /* OTHER STATUS CHANGES */

    if (!confirm(message)) return

    setProcessingId(row.id)

    try {
      const { error } = await supabase
        .from("shortlists")
        .update({ status: newStatus })
        .eq("id", row.id)

      if (error) {
        console.error("Status update error:", error)
        alert("Error updating status: " + error.message)
        return
      }

      await fetchShortlists()
    } finally {
      setProcessingId(null)
    }
  }

  /* REJECT CANDIDATE */

  async function rejectCandidate(row) {
    if (processingId !== null) return

    const reason = prompt("Enter rejection reason (Mandatory):")

    if (!reason || !reason.trim()) {
      alert("Rejection reason is mandatory.")
      return
    }

    setProcessingId(row.id)

    try {
      const hospitalName =
        row.requirements?.hospitals?.hospital_name || "Unknown Hospital"

      const { data: doctorData, error: doctorFetchError } = await supabase
        .from("doctors")
        .select("remarks")
        .eq("id", row.doctor_id)
        .single()

      if (doctorFetchError) {
        console.error("Doctor remarks loading error:", doctorFetchError)
        alert("Unable to load doctor remarks.")
        return
      }

      const d = new Date()

      const formattedDate =
        `${String(d.getDate()).padStart(2, "0")}/` +
        `${String(d.getMonth() + 1).padStart(2, "0")}/` +
        `${d.getFullYear()}`

      const newRemark =
        `${formattedDate} | ${hospitalName} | Rejected | ${reason.trim()}`

      const updatedRemarks = doctorData?.remarks
        ? doctorData.remarks + "\n" + newRemark
        : newRemark

      const { error: shortlistError } = await supabase
        .from("shortlists")
        .update({
          status: "rejected",
          remarks: reason.trim()
        })
        .eq("id", row.id)

      if (shortlistError) {
        console.error("Rejection update error:", shortlistError)
        alert("Unable to reject this candidate.")
        return
      }

      const { error: doctorError } = await supabase
        .from("doctors")
        .update({ remarks: updatedRemarks })
        .eq("id", row.doctor_id)

      if (doctorError) {
        console.error("Doctor remarks update error:", doctorError)
        alert("Candidate rejected, but doctor remarks could not be updated.")
      }

      await fetchShortlists()
    } finally {
      setProcessingId(null)
    }
  }

  /* AGE OF PIPELINE RECORD */

  function getAge(createdDate) {
    if (!createdDate) return 0

    const today = new Date()
    const created = new Date(createdDate)

    return Math.floor(
      (today - created) / (1000 * 60 * 60 * 24)
    )
  }

  /* STATUS COLORS */

  function statusColor(status) {
    if (status === "shortlisted") return "#f59e0b"
    if (status === "interview_assigned") return "#3b82f6"
    if (status === "interview_completed") return "#fb923c"
    if (status === "offer_released") return "#8b5cf6"
    if (status === "placement_done") return "#16a34a"
    if (status === "rejected") return "#ef4444"
    if (status === "closed") return "#6b7280"
    return "#64748b"
  }

  /* CLOSE PIPELINE */

  async function closePipeline(row) {
    if (processingId !== null) return

    const reason = prompt("Reason for closing this pipeline?")

    if (!reason || !reason.trim()) {
      alert("Close reason is mandatory.")
      return
    }

    setProcessingId(row.id)

    try {
      const { error } = await supabase
        .from("shortlists")
        .update({
          status: "closed",
          remarks: reason.trim()
        })
        .eq("id", row.id)

      if (error) {
        console.error("Pipeline close error:", error)
        alert("Unable to close pipeline.")
        return
      }

      alert("Pipeline closed successfully.")
      await fetchShortlists()
    } finally {
      setProcessingId(null)
    }
  }

  /* ACTION BUTTONS */

  function actionButton(row) {
    const busy = processingId !== null

    if (row.status === "shortlisted") {
      return (
        <>
          <button
            disabled={busy}
            onClick={() =>
              changeStatus(
                row,
                "interview_assigned",
                "Assign candidate for interview?"
              )
            }
          >
            Assign Interview
          </button>

          <button
            disabled={busy}
            style={{ marginLeft: "6px" }}
            onClick={() => rejectCandidate(row)}
          >
            Reject
          </button>

          {getAge(row.created_at) > 45 && (
            <button
              disabled={busy}
              style={closeButtonStyle}
              onClick={() => closePipeline(row)}
            >
              Close
            </button>
          )}
        </>
      )
    }

    if (row.status === "interview_assigned") {
      return (
        <>
          <button
            disabled={busy}
            onClick={() =>
              changeStatus(
                row,
                "interview_completed",
                "Mark interview completed?"
              )
            }
          >
            Interview Done
          </button>

          <button
            disabled={busy}
            style={{ marginLeft: "6px" }}
            onClick={() => rejectCandidate(row)}
          >
            Reject
          </button>

          {getAge(row.created_at) > 45 && (
            <button
              disabled={busy}
              style={closeButtonStyle}
              onClick={() => closePipeline(row)}
            >
              Close
            </button>
          )}
        </>
      )
    }

    if (row.status === "interview_completed") {
      return (
        <>
          <button
            disabled={busy}
            onClick={() =>
              changeStatus(
                row,
                "offer_released",
                "Release offer?"
              )
            }
          >
            Release Offer
          </button>

          <button
            disabled={busy}
            style={{ marginLeft: "6px" }}
            onClick={() => rejectCandidate(row)}
          >
            Reject
          </button>

          {getAge(row.created_at) > 45 && (
            <button
              disabled={busy}
              style={closeButtonStyle}
              onClick={() => closePipeline(row)}
            >
              Close
            </button>
          )}
        </>
      )
    }

    if (row.status === "offer_released") {
      return (
        <>
          <button
            disabled={busy}
            onClick={() =>
              changeStatus(
                row,
                "placement_done",
                "Confirm placement?"
              )
            }
          >
            Placement Done
          </button>

          <button
            disabled={busy}
            style={{ marginLeft: "6px" }}
            onClick={() => rejectCandidate(row)}
          >
            Reject
          </button>

          {getAge(row.created_at) > 45 && (
            <button
              disabled={busy}
              style={closeButtonStyle}
              onClick={() => closePipeline(row)}
            >
              Close
            </button>
          )}
        </>
      )
    }

    return "-"
  }

  const closeButtonStyle = {
    marginLeft: "6px",
    background: "#6b7280",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer"
  }

  /* SEARCH */

  const filteredShortlists = shortlists.filter((s) => {
    const term = search.toLowerCase()

    return (
      (s.doctors?.name || "").toLowerCase().includes(term) ||
      (s.doctors?.specialties?.name || "").toLowerCase().includes(term) ||
      (s.requirements?.hospitals?.hospital_name || "").toLowerCase().includes(term) ||
      (s.requirements?.specialties?.name || "").toLowerCase().includes(term) ||
      (s.requirements?.city || "").toLowerCase().includes(term)
    )
  })

  /* UI */

  return (
    <div style={{ color: "#0f172a" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Recruitment Pipeline
      </h2>

      <input
        placeholder="Search doctor, hospital, specialty, city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "20px",
          padding: "8px",
          width: "min(100%, 350px)",
          border: "1px solid #ddd",
          borderRadius: "6px"
        }}
      />

      <div
        style={{
          marginBottom: "10px",
          fontSize: "14px",
          color: "#64748b"
        }}
      >
        {loading
          ? "Loading recruitment pipeline..."
          : `Showing ${filteredShortlists.length} active candidate(s)`}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflowX: "auto"
        }}
      >
        <table width="100%" cellPadding="12" style={{ minWidth: "1050px" }}>
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>
              <th>Date</th>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Hospital</th>
              <th>Requirement</th>
              <th>City</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filteredShortlists.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "30px", textAlign: "center" }}>
                  No active candidates found.
                </td>
              </tr>
            ) : (
              filteredShortlists.map((s) => {
                const age = getAge(s.created_at)

                return (
                  <tr key={s.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td
                      title={`${age} Days Old`}
                      style={{
                        color:
                          age > 45
                            ? "#dc2626"
                            : age > 30
                            ? "#f59e0b"
                            : "#16a34a",
                        fontWeight: age > 45 ? "700" : "500",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {age > 45 ? "⚠ " : ""}
                      {formatDate(s.created_at)}
                    </td>

                    <td>
                      <Link href={`/doctors/${s.doctors?.id}`}>
                        {s.doctors?.name || "Unknown doctor"}
                      </Link>
                    </td>

                    <td>{s.doctors?.specialties?.name || "—"}</td>
                    <td>{s.requirements?.hospitals?.hospital_name || "—"}</td>
                    <td>{s.requirements?.specialties?.name || "—"}</td>
                    <td>{s.requirements?.city || "—"}</td>

                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          color: "#fff",
                          background: statusColor(s.status)
                        }}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td style={{ fontSize: "12px" }}>
                      {s.remarks || "—"}
                    </td>

                    <td style={{ minWidth: "220px" }}>
                      {s.doctors?.phone && (
                        <a
                          href={`https://wa.me/91${String(
                            s.doctors.phone
                          ).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginRight: "10px" }}
                          title="WhatsApp doctor"
                        >
                          💬
                        </a>
                      )}

                      {actionButton(s)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
