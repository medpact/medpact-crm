
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
        ? Math.min(requestedLimit, 1000)
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
        hospital_id,
        specialty_id,
        specialties(name)
      `)
      .ilike("status", "open")
      .order("entry_date", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", { ascending: false })

    if (specialty) {
      query = query.eq("specialty_id", specialty)
    }

    if (city) {
      query = query.ilike("city", `%${city}%`)
    }

    // Fetch all matching open requirements first.
    // State filtering is applied after resolving the hospital state.
    const { data, error } = await query

    if (error) {
      console.error("Recruitment vacancies query failed:", error.message)

      return NextResponse.json(
        { error: "Unable to load vacancies" },
        { status: 500 }
      )
    }

    const requirements = data || []

    // Retrieve the state linked to each hospital.
    // Hospital names are deliberately not selected or returned.
    const hospitalIds = [
      ...new Set(
        requirements
          .map((item) => item.hospital_id)
          .filter((id) => id != null)
      ),
    ]

    const hospitalStateMap = {}

    if (hospitalIds.length > 0) {
      const { data: hospitals, error: hospitalError } = await supabase
        .from("hospitals")
        .select(`
          id,
          states!fk_hospital_state(name)
        `)
        .in("id", hospitalIds)

      if (hospitalError) {
        console.error(
          "Recruitment hospital state lookup failed:",
          hospitalError.message
        )

        return NextResponse.json(
          { error: "Unable to load vacancy locations" },
          { status: 500 }
        )
      }

      ;(hospitals || []).forEach((hospital) => {
        hospitalStateMap[String(hospital.id)] =
          hospital.states?.name || ""
      })
    }

    let vacancies = requirements.map((item) => {
      const requirementState = String(item.state || "").trim()
      const hospitalState = String(
        hospitalStateMap[String(item.hospital_id)] || ""
      ).trim()

      // Prefer the explicit requirement state when available.
      // Otherwise use the hospital's linked state.
      const resolvedState = requirementState || hospitalState

      return {
        id: item.id,
        title: item.specialties?.name || "Medical Professional",
        specialty: item.specialties?.name || "Not specified",
        city: item.city || item.location || "",
        state: resolvedState,
        positions: item.positions ?? null,
        experienceRequired: item.experience_required ?? null,
        date: item.entry_date || item.created_at || null,
      }
    })

    if (state) {
      const term = state.toLowerCase()

      vacancies = vacancies.filter((item) =>
        item.state.toLowerCase().includes(term)
      )
    }

    if (search) {
      const term = search.toLowerCase()

      vacancies = vacancies.filter((item) =>
        [
          item.title,
          item.specialty,
          item.city,
          item.state,
        ].some((value) =>
          String(value || "").toLowerCase().includes(term)
        )
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
    console.error(
      "Recruitment vacancies API error:",
      error.message
    )

    return NextResponse.json(
      { error: "Unable to load vacancies" },
      { status: 500 }
    )
  }
}
