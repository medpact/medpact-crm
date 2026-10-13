
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Supabase server configuration is missing")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function GET(request) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)

    const search = (searchParams.get("search") || "").trim()
    const specialty = (searchParams.get("specialty") || "").trim()
    const city = (searchParams.get("city") || "").trim()
    const state = (searchParams.get("state") || "").trim()

    const requestedLimit = Number(searchParams.get("limit") || 0)
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : null

    let query = supabase
      .from("requirements")
      .select(`
        id,
        entry_date,
        created_at,
        positions,
        experience_required,
        city,
        state,
        location,
        specialty_id,
        specialties(name)
      `)
      .ilike("status", "open")
      .order("entry_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })

    if (specialty) {
      query = query.eq("specialty_id", specialty)
    }

    if (city) {
      query = query.ilike("city", `%${city}%`)
    }

    if (state) {
      query = query.ilike("state", `%${state}%`)
    }

    if (search) {
      // Search the specialty and location fields after fetching the
      // open requirements, so hospital details are never returned.
      // The final search is applied to the safe public response fields.
    }

    const { data, error } = await query

    if (error) {
      console.error("Recruitment vacancies query failed:", error.message)
      return NextResponse.json(
        { error: "Unable to load vacancies" },
        { status: 500 }
      )
    }

    let vacancies = (data || []).map((item) => ({
      id: item.id,
      title: item.specialties?.name || "Medical Professional",
      specialty: item.specialties?.name || "Not specified",
      city: item.city || item.location || "",
      state: item.state || "",
      positions: item.positions ?? null,
      experienceRequired: item.experience_required ?? null,
      date: item.entry_date || item.created_at || null,
    }))

    if (search) {
      const term = search.toLowerCase()
      vacancies = vacancies.filter((item) =>
        [
          item.title,
          item.specialty,
          item.city,
          item.state,
        ].some((value) => String(value || "").toLowerCase().includes(term))
      )
    }

    const total = vacancies.length

    if (limit) {
      vacancies = vacancies.slice(0, limit)
    }

    return NextResponse.json(
      { vacancies, total },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    console.error("Recruitment vacancies API error:", error.message)

    return NextResponse.json(
      { error: "Unable to load vacancies" },
      { status: 500 }
    )
  }
}
