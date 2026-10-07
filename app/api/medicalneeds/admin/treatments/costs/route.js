import { NextResponse } from "next/server"
import { getAdminCookieName, getAdminSupabase, verifyAdminToken } from "../../../../../../lib/medpact-admin"
async function guard(request) { return verifyAdminToken(request.cookies.get(getAdminCookieName())?.value) }
function csv(value) { return String(value || "").split(",").map(x => x.trim()).filter(Boolean) }
function num(value) { return value === "" || value == null ? null : Number(value) }

export async function GET(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const treatmentId = new URL(request.url).searchParams.get("treatment_id")
  if (!treatmentId) return NextResponse.json({ costs: [] })
  const { data, error } = await getAdminSupabase().from("medical_treatment_costs").select("*,hospital:medical_hospitals(name,city,state)").eq("treatment_id", treatmentId).order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ costs: data || [] })
}
export async function POST(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { const fields = await request.json(); if (!fields.treatment_id || !fields.hospital_id) throw new Error("Select a treatment and hospital."); const { data: hospital } = await getAdminSupabase().from("medical_hospitals").select("city").eq("id", fields.hospital_id).maybeSingle(); const payload = normalize(fields, hospital?.city); const { data, error } = await getAdminSupabase().from("medical_treatment_costs").insert(payload).select("id").single(); if (error) throw error; return NextResponse.json({ id: data.id }) } catch (error) { return NextResponse.json({ error: error.message || "Unable to save cost record." }, { status: 400 }) }
}
export async function PUT(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { const { id, ...fields } = await request.json(); if (!id) throw new Error("Cost record id is required."); const { data: hospital } = await getAdminSupabase().from("medical_hospitals").select("city").eq("id", fields.hospital_id).maybeSingle(); const { error } = await getAdminSupabase().from("medical_treatment_costs").update(normalize(fields, hospital?.city)).eq("id", id); if (error) throw error; return NextResponse.json({ ok: true }) } catch (error) { return NextResponse.json({ error: error.message || "Unable to update cost record." }, { status: 400 }) }
}
export async function DELETE(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { const { id } = await request.json(); const { error } = await getAdminSupabase().from("medical_treatment_costs").delete().eq("id", id); if (error) throw error; return NextResponse.json({ ok: true }) } catch (error) { return NextResponse.json({ error: error.message || "Unable to delete cost record." }, { status: 400 }) }
}
function normalize(fields, hospitalCity) {
  return { ...fields, city: fields.city || hospitalCity || null, package_min: num(fields.package_min), package_max: num(fields.package_max), inclusions: csv(fields.inclusions), exclusions: csv(fields.exclusions), hospital_charges_included: !!fields.hospital_charges_included, surgeon_fee_included: !!fields.surgeon_fee_included, implant_included: !!fields.implant_included, diagnostics_included: !!fields.diagnostics_included, accommodation_included: !!fields.accommodation_included, verified: !!fields.verified, is_published: !!fields.is_published }
}
