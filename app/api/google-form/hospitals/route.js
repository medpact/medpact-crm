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
      data: hospitals,
      error
    } =
      await supabase
        .from("hospitals")
        .select(
          "id,hospital_name"
        )
        .eq(
          "status",
          "active"
        )
        .order(
          "hospital_name",
          {
            ascending: true
          }
        )


    if (error) {

      console.log(
        "Hospital API error:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load hospitals"
        },
        {
          status: 500
        }
      )

    }


    return NextResponse.json({

      success: true,

      hospitals:
        hospitals || []

    })


  } catch (error) {

    console.log(
      "Hospital API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load hospitals"
      },
      {
        status: 500
      }
    )

  }

}
