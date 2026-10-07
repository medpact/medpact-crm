import { NextResponse } from "next/server"
import { getAdminCookieName, getAdminSupabase, verifyAdminToken } from "../../../../../lib/medpact-admin"

async function guard(request) {
  return verifyAdminToken(request.cookies.get(getAdminCookieName())?.value)
}

export async function GET(request) {
  if (!(await guard(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = getAdminSupabase()
  const [doctors, hospitals, treatments, costs] = await Promise.all([
    supabase.from("medical_doctors").select("id", { count: "exact", head: true }),
    supabase.from("medical_hospitals").select("id", { count: "exact", head: true }),
    supabase.from("medical_treatments").select("id", { count: "exact", head: true }),
    supabase.from("medical_treatment_costs").select("id", { count: "exact", head: true })
  ])
  const firstError = [doctors, hospitals, treatments, costs].find(x => x.error)
  if (firstError) return NextResponse.json({ error: firstError.error.message }, { status: 500 })
  return NextResponse.json({ doctors: doctors.count || 0, hospitals: hospitals.count || 0, treatments: treatments.count || 0, costs: costs.count || 0 })
}
