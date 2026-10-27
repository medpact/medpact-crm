
import {
  getAdminSupabase,
  getRequestSession,
  jsonError,
  OUTREACH_STATUSES,
} from "../../../../lib/outreach-server"

export const runtime = "nodejs"

export async function GET(request) {
  if (!getRequestSession(request)) {
    return jsonError("Please log in again", 401)
  }

  const url = new URL(request.url)
  const search = (url.searchParams.get("search") || "")
    .trim()
    .replace(/[%(),]/g, " ")
  const status = url.searchParams.get("status") || ""

  try {
    const db = getAdminSupabase()

    let query = db
      .from("outreach_hospitals")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500)

    if (search) {
      query = query.or(
        `hospital_name.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq("current_status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Hospital list database error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return jsonError("Could not load hospitals. Check the server logs.", 500)
    }

    return Response.json({
      success: true,
      hospitals: data || [],
    })
  } catch (error) {
    console.error("Hospital list API error:", error)
    return jsonError("Could not load hospitals. Check the server logs.", 500)
  }
}

export async function POST(request) {
  const session = getRequestSession(request)

  if (!session) {
    return jsonError("Your session has expired. Please log in again.", 401)
  }

  try {
    const body = await request.json()

    const hospital_name = String(body.hospital_name || "").trim()
    const city = String(body.city || "").trim()

    if (!hospital_name || !city) {
      return jsonError("Hospital name and city are required.", 400)
    }

    const payload = {
      hospital_name,
      city,
      state: String(body.state || "").trim() || null,
      area: String(body.area || "").trim() || null,
      address: String(body.address || "").trim() || null,
      phone: String(body.phone || "").trim() || null,
      alternate_phone: String(body.alternate_phone || "").trim() || null,
      hospital_type: String(body.hospital_type || "").trim() || null,
      current_status: OUTREACH_STATUSES.includes(body.current_status)
        ? body.current_status
        : "not_contacted",
      assigned_to: session.username,
      general_remarks: String(body.general_remarks || "").trim() || null,
    }

    const db = getAdminSupabase()

    const { data, error } = await db
      .from("outreach_hospitals")
      .insert(payload)
      .select("*")
      .single()

    if (error) {
      console.error("Hospital save database error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })

      return jsonError(
        `Could not save hospital: ${error.message}`,
        500
      )
    }

    return Response.json(
      { success: true, hospital: data },
      { status: 201 }
    )
  } catch (error) {
    console.error("Hospital save API error:", error)

    return jsonError(
      error instanceof Error
        ? `Could not save hospital: ${error.message}`
        : "Could not save hospital due to an unexpected server error.",
      500
    )
  }
}
