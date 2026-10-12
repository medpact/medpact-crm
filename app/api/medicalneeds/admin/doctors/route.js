import { NextResponse } from "next/server"
import { getAdminCookieName, getAdminSupabase, verifyAdminToken } from "../../../../../lib/medpact-admin"

async function guard(request) {
  return verifyAdminToken(request.cookies.get(getAdminCookieName())?.value)
}

export async function GET(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = getAdminSupabase()
  const { data: doctors, error } = await supabase
    .from("medical_doctors").select("*").order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return existing hospital links for information only. The admin form does not edit them.
  const { data: links, error: linksError } = await supabase
    .from("medical_doctor_hospitals").select("doctor_id,hospital_id")

  if (linksError) return NextResponse.json({ error: linksError.message }, { status: 500 })

  const byDoctor = {}
  ;(links || []).forEach((link) => {
    ;(byDoctor[link.doctor_id] ||= []).push(link.hospital_id)
  })

  return NextResponse.json({
    doctors: (doctors || []).map((doctor) => ({
      ...doctor,
      hospital_ids: byDoctor[doctor.id] || [],
    })),
  })
}

function csv(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean)
}

function asBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1"
}

async function getProfilePhoto(supabase, form, fields) {
  const photo = form.get("photo")
  let profilePhoto = fields.profile_photo || null

  if (photo && typeof photo.arrayBuffer === "function" && photo.size > 0) {
    const extension =
      String(photo.name || "jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
    const slug = fields.slug || String(fields.full_name || "doctor")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const path = `${slug}-${Date.now()}.${extension}`

    const upload = await supabase.storage.from("medical-doctors").upload(
      path,
      Buffer.from(await photo.arrayBuffer()),
      { contentType: photo.type || "image/jpeg", upsert: true }
    )
    if (upload.error) throw upload.error
    profilePhoto = supabase.storage.from("medical-doctors").getPublicUrl(path).data.publicUrl
  }

  return profilePhoto
}

function makePayload(fields, profilePhoto) {
  const payload = {
    ...fields,
    slug: fields.slug || String(fields.full_name || "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    experience_years:
      fields.experience_years === "" || fields.experience_years == null
        ? null
        : Number(fields.experience_years),
    qualifications: csv(fields.qualifications),
    areas_of_expertise: csv(fields.areas_of_expertise),
    languages: csv(fields.languages),
    profile_photo: profilePhoto,
    consultation_available: asBoolean(fields.consultation_available),
    featured: asBoolean(fields.featured),
    verified: asBoolean(fields.verified),
    is_published: asBoolean(fields.is_published),
  }

  // Hospital associations are separate from the doctor profile.
  delete payload.hospital_ids
  return payload
}

export async function POST(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const form = await request.formData()
    const fields = JSON.parse(form.get("fields") || "{}")
    const supabase = getAdminSupabase()
    const profilePhoto = await getProfilePhoto(supabase, form, fields)
    const payload = makePayload(fields, profilePhoto)

    const { data, error } = await supabase.from("medical_doctors").insert(payload).select("id").single()
    if (error) throw error

    // Hospital affiliation is optional; no mapping row is required.
    return NextResponse.json({ id: data.id })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to save doctor." }, { status: 400 })
  }
}

export async function PUT(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const form = await request.formData()
    const id = form.get("id")
    const fields = JSON.parse(form.get("fields") || "{}")
    if (!id) return NextResponse.json({ error: "Doctor id is required." }, { status: 400 })

    const supabase = getAdminSupabase()
    const profilePhoto = await getProfilePhoto(supabase, form, fields)
    const payload = makePayload(fields, profilePhoto)

    const { error } = await supabase.from("medical_doctors").update(payload).eq("id", id)
    if (error) throw error

    // Do not delete or overwrite medical_doctor_hospitals during a profile edit.
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to update doctor." }, { status: 400 })
  }
}

export async function DELETE(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "Doctor id is required." }, { status: 400 })
    const supabase = getAdminSupabase()
    const { error } = await supabase.from("medical_doctors").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to delete doctor." }, { status: 400 })
  }
}
