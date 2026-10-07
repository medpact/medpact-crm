import { NextResponse } from "next/server"
import { getAdminCookieName, getAdminSupabase, verifyAdminToken } from "../../../../../lib/medpact-admin"
async function guard(request) { return verifyAdminToken(request.cookies.get(getAdminCookieName())?.value) }
function csv(value) { return String(value || "").split(",").map(x => x.trim()).filter(Boolean) }
function num(value) { return value === "" || value == null ? null : Number(value) }
function slugify(value) { return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }

export async function GET(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = getAdminSupabase()
  const [{ data: treatments, error }, { data: hospitals, error: hospitalError }] = await Promise.all([supabase.from("medical_treatments").select("*").order("created_at", { ascending: false }), supabase.from("medical_hospitals").select("id,name,city,state").order("name")])
  if (error || hospitalError) return NextResponse.json({ error: (error || hospitalError).message }, { status: 500 })
  return NextResponse.json({ treatments: treatments || [], hospitals: hospitals || [] })
}

export async function POST(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { const fields = await request.json(); const payload = normalizeTreatment(fields); const { data, error } = await getAdminSupabase().from("medical_treatments").insert(payload).select("id").single(); if (error) throw error; return NextResponse.json({ id: data.id }) } catch (error) { return NextResponse.json({ error: error.message || "Unable to save treatment." }, { status: 400 }) }
}
export async function PUT(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { const { id, ...fields } = await request.json(); if (!id) throw new Error("Treatment id is required."); const { error } = await getAdminSupabase().from("medical_treatments").update(normalizeTreatment(fields)).eq("id", id); if (error) throw error; return NextResponse.json({ ok: true }) } catch (error) { return NextResponse.json({ error: error.message || "Unable to update treatment." }, { status: 400 }) }
}
export async function DELETE(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { const { id } = await request.json(); const { error } = await getAdminSupabase().from("medical_treatments").delete().eq("id", id); if (error) throw error; return NextResponse.json({ ok: true }) } catch (error) { return NextResponse.json({ error: error.message || "Unable to delete treatment." }, { status: 400 }) }
}

function normalizeTreatment(fields) {
  return { ...fields, slug: fields.slug || slugify(fields.name), india_cost_min: num(fields.india_cost_min), india_cost_max: num(fields.india_cost_max), international_benchmark_min: num(fields.international_benchmark_min), international_benchmark_max: num(fields.international_benchmark_max), included_items: csv(fields.included_items), exclusions: csv(fields.exclusions), featured: !!fields.featured, verified: !!fields.verified, is_published: !!fields.is_published }
}
