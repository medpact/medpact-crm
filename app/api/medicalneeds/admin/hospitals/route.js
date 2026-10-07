import { NextResponse } from "next/server"
import { getAdminCookieName, getAdminSupabase, verifyAdminToken } from "../../../../../lib/medpact-admin"

async function guard(request) { return verifyAdminToken(request.cookies.get(getAdminCookieName())?.value) }
function csv(value) { return String(value || "").split(",").map(x => x.trim()).filter(Boolean) }
function slugify(value) { return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }

export async function GET(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data, error } = await getAdminSupabase().from("medical_hospitals").select("*").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ hospitals: data || [] })
}

async function save(request, editing = false) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const form = await request.formData()
    const fields = JSON.parse(form.get("fields") || "{}")
    const supabase = getAdminSupabase()
    let images = Array.isArray(fields.images) ? [...fields.images] : []
    const photos = form.getAll("photos")
    for (const photo of photos) {
      if (!photo || typeof photo.arrayBuffer !== "function" || !photo.size) continue
      const ext = String(photo.name || "jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
      const path = `${slugify(fields.name || "hospital")}-${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`
      const upload = await supabase.storage.from("medical-hospitals").upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type || "image/jpeg", upsert: true })
      if (upload.error) throw upload.error
      images.push(supabase.storage.from("medical-hospitals").getPublicUrl(path).data.publicUrl)
    }
    const payload = { ...fields, slug: fields.slug || slugify(fields.name), accreditations: csv(fields.accreditations), key_specialties: csv(fields.key_specialties), key_procedures: csv(fields.key_procedures), images, featured: !!fields.featured, verified: !!fields.verified, is_published: !!fields.is_published }
    const id = form.get("id")
    let result
    if (editing) result = await supabase.from("medical_hospitals").update(payload).eq("id", id)
    else result = await supabase.from("medical_hospitals").insert(payload)
    if (result.error) throw result.error
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ error: error.message || "Unable to save hospital." }, { status: 400 }) }
}
export async function POST(request) { return save(request, false) }
export async function PUT(request) { return save(request, true) }
export async function DELETE(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { const { id } = await request.json(); const { error } = await getAdminSupabase().from("medical_hospitals").delete().eq("id", id); if (error) throw error; return NextResponse.json({ ok: true }) } catch (error) { return NextResponse.json({ error: error.message || "Unable to delete hospital." }, { status: 400 }) }
}
