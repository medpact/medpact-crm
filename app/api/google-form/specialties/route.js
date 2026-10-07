import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"


const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )


export async function GET() {

  try {

    const {
      data: specialties,
      error
    } =
      await supabase
        .from("specialties")
        .select(
          "id,name"
        )
        .order(
          "name",
          {
            ascending: true
          }
        )


    if (error) {

      console.log(
        "Specialty API error:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load specialties"
        },
        {
          status: 500
        }
      )

    }


    return NextResponse.json({

      success: true,

      specialties:
        specialties || []

    })


  } catch (error) {

    console.log(
      "Specialty API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load specialties"
      },
      {
        status: 500
      }
    )

  }

}
