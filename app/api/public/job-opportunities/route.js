import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("requirements")
      .select(`
        id,
        specialty_id,
        experience_required,
        salary_min,
        salary_max,
        positions,
        notes,
        city,
        state,
        created_at,
        entry_date,
        status,
        hospitals (
          id,
          hospital_name,
          city,
          state
        ),
        specialties (
          id,
          name
        )
      `)
      .eq("status", "open")
      .order("created_at", {
        ascending: false
      })

    if (error) {
      console.log(
        "Public job opportunities API error:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load job opportunities"
        },
        {
          status: 500
        }
      )
    }

    const jobs = (data || []).map((job) => {

      const hospital =
        Array.isArray(job.hospitals)
          ? job.hospitals[0]
          : job.hospitals

      const specialty =
        Array.isArray(job.specialties)
          ? job.specialties[0]
          : job.specialties

      return {
        id: job.id,

        hospital_name:
          hospital?.hospital_name || "",

        specialty:
          specialty?.name || "",

        experience_required:
          job.experience_required,

        salary_min:
          job.salary_min,

        salary_max:
          job.salary_max,

        positions:
          job.positions,

        city:
          job.city ||
          hospital?.city ||
          "",

        state:
          job.state ||
          hospital?.state ||
          "",

        notes:
          job.notes || "",

        created_at:
          job.created_at,

        entry_date:
          job.entry_date
      }
    })

    return NextResponse.json({
      success: true,
      jobs: jobs
    })

  } catch (error) {

    console.log(
      "Public job opportunities API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load job opportunities"
      },
      {
        status: 500
      }
    )
  }
}
