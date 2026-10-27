import { getAdminSupabase, getRequestSession, jsonError, CALL_OUTCOMES, OUTREACH_STATUSES } from "../../../../lib/outreach-server"
export const runtime = "nodejs"

export async function GET(request) {
  if (!getRequestSession(request)) return jsonError("Please log in again",401)
  const url = new URL(request.url)
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0,10)
  try {
    const db = getAdminSupabase()
    const {data,error} = await db.from("outreach_calls").select("*, outreach_hospitals(hospital_name,city,state)")
      .gte("call_date",`${date}T00:00:00.000Z`).lte("call_date",`${date}T23:59:59.999Z`)
      .order("call_date",{ascending:false}).limit(1000)
    if (error) throw error
    return Response.json({success:true,calls:data || []})
  } catch (error) {
    console.error(error)
    return jsonError("Could not load daily report",500)
  }
}
export async function POST(request) {
  const session = getRequestSession(request)
  if (!session) return jsonError("Please log in again",401)
  try {
    const body = await request.json()
    if (!body.hospital_id) return jsonError("Hospital is required")
    if (!CALL_OUTCOMES.includes(body.outcome)) return jsonError("Choose a valid call outcome")
    const numeric = v => v === "" || v == null ? null : Number(v)
    const doctorsRequired = numeric(body.doctors_required), salary = numeric(body.salary_offered)
    if (doctorsRequired !== null && (!Number.isInteger(doctorsRequired) || doctorsRequired < 0)) return jsonError("Doctors required must be a non-negative whole number")
    if (salary !== null && (!Number.isFinite(salary) || salary < 0)) return jsonError("Salary must be a valid non-negative amount")
    const payload = {
      hospital_id:body.hospital_id, employee_username:session.username, outcome:body.outcome,
      contact_person:String(body.contact_person || "").trim() || null,
      contact_designation:String(body.contact_designation || "").trim() || null,
      contact_phone:String(body.contact_phone || "").trim() || null,
      remarks:String(body.remarks || "").trim() || null,
      follow_up_date:body.follow_up_date || null,
      doctor_specialty:String(body.doctor_specialty || "").trim() || null,
      doctor_qualification:String(body.doctor_qualification || "").trim() || null,
      doctors_required:doctorsRequired,
      experience_required:String(body.experience_required || "").trim() || null,
      salary_offered:salary,
      job_location:String(body.job_location || "").trim() || null
    }
    const db = getAdminSupabase()
    const {data,error} = await db.from("outreach_calls").insert(payload).select("*").single()
    if (error) throw error
    const statusMap = {interested:"interested",requirement_identified:"requirement_identified",call_back:"follow_up",busy:"follow_up",no_answer:"follow_up",answered:"follow_up",no_current_requirement:"no_current_requirement",not_interested:"not_interested",out_of_service:"invalid_number",not_connected:"follow_up"}
    const newStatus = statusMap[body.outcome]
    if (newStatus && OUTREACH_STATUSES.includes(newStatus)) {
      const result = await db.from("outreach_hospitals").update({current_status:newStatus}).eq("id",body.hospital_id)
      if (result.error) console.error("Call saved but status update failed",result.error)
    }
    return Response.json({success:true,call:data},{status:201})
  } catch (error) {
    console.error(error)
    return jsonError("Could not save call record",500)
  }
}
