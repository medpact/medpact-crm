import { NextResponse } from "next/server"
import { getAdminCookieName, getAdminSupabase, verifyAdminToken } from "../../../../../lib/medpact-admin"

async function guard(request) {
  return verifyAdminToken(request.cookies.get(getAdminCookieName())?.value)
}

export async function GET(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = getAdminSupabase()
  const [{ data, error }, { data: hospitals, error: hospitalError }] = await Promise.all([
    supabase.from("medical_doctors").select("*").order("created_at", { ascending: false }),
    supabase.from("medical_hospitals").select("id,name,city,state,is_published").order("name")
  ])
  if (error || hospitalError) return NextResponse.json({ error: (error || hospitalError).message }, { status: 500 })
  const { data: links } = await supabase.from("medical_doctor_hospitals").select("doctor_id,hospital_id")
  const byDoctor = {}
  ;(links || []).forEach(x => { (byDoctor[x.doctor_id] ||= []).push(x.hospital_id) })
  return NextResponse.json({ doctors: (data || []).map(d => ({ ...d, hospital_ids: byDoctor[d.id] || [] })), hospitals: hospitals || [] })
}

function csv(value) { return String(value || "").split(",").map(x => x.trim()).filter(Boolean) }

export async function POST(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const form = await request.formData()
    const fields = JSON.parse(form.get("fields") || "{}")
    const photo = form.get("photo")
    const supabase = getAdminSupabase()
    let profile_photo = fields.profile_photo || null
    if (photo && typeof photo.arrayBuffer === "function" && photo.size > 0) {
      const ext = String(photo.name || "jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
      const path = `${fields.slug || String(fields.full_name || "doctor").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.${ext}`
      const upload = await supabase.storage.from("medical-doctors").upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type || "image/jpeg", upsert: true })
      if (upload.error) throw upload.error
      profile_photo = supabase.storage.from("medical-doctors").getPublicUrl(path).data.publicUrl
    }
    const payload = { ...fields, slug: fields.slug || String(fields.full_name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), experience_years: fields.experience_years ? Number(fields.experience_years) : null, qualifications: csv(fields.qualifications), areas_of_expertise: csv(fields.areas_of_expertise), languages: csv(fields.languages), profile_photo, consultation_available: !!fields.consultation_available, featured: !!fields.featured, verified: !!fields.verified, is_published: !!fields.is_published }
    delete payload.hospital_ids
    const { data, error } = await supabase.from("medical_doctors").insert(payload).select("id").single()
    if (error) throw error
    await syncHospitals(supabase, data.id, fields.hospital_ids || [])
    return NextResponse.json({ id: data.id })
  } catch (error) { return NextResponse.json({ error: error.message || "Unable to save doctor." }, { status: 400 }) }
}

export async function PUT(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const form = await request.formData()
    const id = form.get("id")
    const fields = JSON.parse(form.get("fields") || "{}")
    if (!id) return NextResponse.json({ error: "Doctor id is required." }, { status: 400 })
    const photo = form.get("photo")
    const supabase = getAdminSupabase()
    let profile_photo = fields.profile_photo || null
    if (photo && typeof photo.arrayBuffer === "function" && photo.size > 0) {
      const ext = String(photo.name || "jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
      const path = `${fields.slug || String(fields.full_name || "doctor").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.${ext}`
      const upload = await supabase.storage.from("medical-doctors").upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type || "image/jpeg", upsert: true })
      if (upload.error) throw upload.error
      profile_photo = supabase.storage.from("medical-doctors").getPublicUrl(path).data.publicUrl
    }
    const payload = { ...fields, experience_years: fields.experience_years ? Number(fields.experience_years) : null, qualifications: csv(fields.qualifications), areas_of_expertise: csv(fields.areas_of_expertise), languages: csv(fields.languages), profile_photo, consultation_available: !!fields.consultation_available, featured: !!fields.featured, verified: !!fields.verified, is_published: !!fields.is_published }
    delete payload.hospital_ids
    const { error } = await supabase.from("medical_doctors").update(payload).eq("id", id)
    if (error) throw error
    await syncHospitals(supabase, id, fields.hospital_ids || [])
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ error: error.message || "Unable to update doctor." }, { status: 400 }) }
}

export async function DELETE(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id } = await request.json()
    const supabase = getAdminSupabase()
    const { error } = await supabase.from("medical_doctors").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ error: error.message || "Unable to delete doctor." }, { status: 400 }) }
}

async function syncHospitals(supabase, doctorId, hospitalIds) {
  const { error: deleteError } = await supabase.from("medical_doctor_hospitals").delete().eq("doctor_id", doctorId)
  if (deleteError) throw deleteError
  if (hospitalIds.length) {
    const { error } = await supabase.from("medical_doctor_hospitals").insert(hospitalIds.map(hospital_id => ({ doctor_id: doctorId, hospital_id })))
    if (error) throw error
  }
}
