import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"


// =============================================
// SUPABASE
// =============================================

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )


// =============================================
// HELPERS
// =============================================

function clean(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return ""
  }

  return String(value).trim()

}


function normalizeText(value) {

  return clean(value).toLowerCase()

}


// =============================================
// POST
// =============================================

export async function POST(request) {

  try {

    // =============================================
    // READ BODY
    // =============================================

    const body =
      await request.json()


    // =============================================
    // SECURITY
    // =============================================

    const secret =
      clean(
        body.google_form_secret
      )

    const configuredSecret =
      process.env.GOOGLE_FORM_SECRET


    if (
      !secret ||
      !configuredSecret ||
      secret !== configuredSecret
    ) {

      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized"
        },
        {
          status: 401
        }
      )

    }


    // =============================================
    // READ FORM DATA
    // =============================================

    const hospitalIdInput =
      clean(
        body.hospital_id
      )

    const hospitalName =
      clean(
        body.hospital_name
      )

    const contactPerson =
      clean(
        body.contact_person
      )

    const phone =
      clean(
        body.phone
      )

    const contactDesignation =
      clean(
        body.contact_designation
      )

    const stateName =
      clean(
        body.state
      )

    const cityName =
      clean(
        body.city
      )

    const specialtyName =
      clean(
        body.specialty
      )

    const experienceRequired =
      clean(
        body.experience_required
      )

    const salaryMin =
      clean(
        body.salary_min
      )

    const salaryMax =
      clean(
        body.salary_max
      )

    const positionsInput =
      clean(
        body.positions
      )

    const notes =
      clean(
        body.notes
      )


    // =============================================
    // DETERMINE HOSPITAL MODE
    // =============================================

    const existingHospital =
      !!hospitalIdInput


    // =============================================
    // VALIDATION
    // =============================================

    if (
      !existingHospital
    ) {

      if (!hospitalName) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Hospital name is required"
          },
          {
            status: 400
          }
        )

      }


      if (!contactPerson) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Contact person is required"
          },
          {
            status: 400
          }
        )

      }


      if (!phone) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Phone is required"
          },
          {
            status: 400
          }
        )

      }


      if (!stateName) {

        return NextResponse.json(
          {
            success: false,
            message:
              "State is required"
          },
          {
            status: 400
          }
        )

      }


      if (!cityName) {

        return NextResponse.json(
          {
            success: false,
            message:
              "City is required"
          },
          {
            status: 400
          }
        )

      }

    }


    if (!specialtyName) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Specialty is required"
        },
        {
          status: 400
        }
      )

    }


    if (!positionsInput) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Number of positions is required"
        },
        {
          status: 400
        }
      )

    }


    // =============================================
    // EXPERIENCE
    // =============================================

    let experienceValue = null


    if (
      experienceRequired
    ) {

      const parsedExperience =
        Number(
          experienceRequired
        )


      if (
        Number.isNaN(
          parsedExperience
        ) ||
        parsedExperience < 0
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Experience must be a valid number"
          },
          {
            status: 400
          }
        )

      }


      experienceValue =
        parsedExperience

    }


    // =============================================
    // SALARY MIN
    // =============================================

    let salaryMinValue = null


    if (salaryMin) {

      const parsedSalaryMin =
        Number(
          salaryMin
            .replace(/,/g, "")
            .replace(/₹/g, "")
            .trim()
        )


      if (
        Number.isNaN(
          parsedSalaryMin
        ) ||
        parsedSalaryMin < 0
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Minimum salary must be a valid number"
          },
          {
            status: 400
          }
        )

      }


      salaryMinValue =
        parsedSalaryMin

    }


    // =============================================
    // SALARY MAX
    // =============================================

    let salaryMaxValue = null


    if (salaryMax) {

      const parsedSalaryMax =
        Number(
          salaryMax
            .replace(/,/g, "")
            .replace(/₹/g, "")
            .trim()
        )


      if (
        Number.isNaN(
          parsedSalaryMax
        ) ||
        parsedSalaryMax < 0
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Maximum salary must be a valid number"
          },
          {
            status: 400
          }
        )

      }


      salaryMaxValue =
        parsedSalaryMax

    }


    // =============================================
    // POSITIONS
    // =============================================

    const positions =
      Number(
        positionsInput
      )


    if (
      Number.isNaN(
        positions
      ) ||
      positions <= 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Number of positions must be a valid number greater than zero"
        },
        {
          status: 400
        }
      )

    }


    // =============================================
    // FIND SPECIALTY
    // =============================================

    const {
      data: specialties,
      error: specialtyError
    } =
      await supabase
        .from("specialties")
        .select(
          "id,name"
        )


    if (specialtyError) {

      console.log(
        "Specialty lookup error:",
        specialtyError
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


    const specialty =
      specialties?.find(
        item =>
          normalizeText(
            item.name
          ) ===
          normalizeText(
            specialtyName
          )
      )


    if (!specialty) {

      return NextResponse.json(
        {
          success: false,
          message:
            `Specialty not found: ${specialtyName}`
        },
        {
          status: 400
        }
      )

    }


    // =============================================
    // EXISTING HOSPITAL
    // =============================================

    let hospital = null


    if (
      existingHospital
    ) {

      const hospitalId =
        Number(
          hospitalIdInput
        )


      if (
        Number.isNaN(
          hospitalId
        )
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid hospital ID"
          },
          {
            status: 400
          }
        )

      }


      const {
        data,
        error
      } =
        await supabase
          .from("hospitals")
          .select(
            "id,hospital_name,city,state,state_id,city_id,status"
          )
          .eq(
            "id",
            hospitalId
          )
          .single()


      if (error) {

        console.log(
          "Hospital lookup error:",
          error
        )


        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to find selected hospital"
          },
          {
            status: 400
          }
        )

      }


      if (
        data.status &&
        data.status !== "active"
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Selected hospital is not active"
          },
          {
            status: 400
          }
        )

      }


      hospital =
        data

    }


    // =============================================
    // NEW HOSPITAL
    // =============================================

    if (
      !existingHospital
    ) {

      // -------------------------------------------
      // FIND STATE
      // -------------------------------------------

      const {
        data: states,
        error: stateError
      } =
        await supabase
          .from("states")
          .select(
            "id,name"
          )


      if (stateError) {

        console.log(
          "State lookup error:",
          stateError
        )


        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to load states"
          },
          {
            status: 500
          }
        )

      }


      const stateRecord =
        states?.find(
          item =>
            normalizeText(
              item.name
            ) ===
            normalizeText(
              stateName
            )
        )


      if (!stateRecord) {

        return NextResponse.json(
          {
            success: false,
            message:
              `State not found: ${stateName}`
          },
          {
            status: 400
          }
        )

      }


      // -------------------------------------------
      // FIND CITY
      // -------------------------------------------

      const {
        data: cities,
        error: cityError
      } =
        await supabase
          .from("cities")
          .select(
            "id,name,state_id"
          )
          .eq(
            "state_id",
            stateRecord.id
          )


      if (cityError) {

        console.log(
          "City lookup error:",
          cityError
        )


        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to load cities"
          },
          {
            status: 500
          }
        )

      }


      const cityRecord =
        cities?.find(
          item =>
            normalizeText(
              item.name
            ) ===
            normalizeText(
              cityName
            )
        )


      if (!cityRecord) {

        return NextResponse.json(
          {
            success: false,
            message:
              `City not found: ${cityName}`
          },
          {
            status: 400
          }
        )

      }


      // -------------------------------------------
      // CHECK DUPLICATE HOSPITAL
      // -------------------------------------------

      const {
        data: existingHospitals,
        error: existingHospitalError
      } =
        await supabase
          .from("hospitals")
          .select(
            "id,hospital_name,city,state,status"
          )


      if (existingHospitalError) {

        console.log(
          "Existing hospital check error:",
          existingHospitalError
        )


        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to check existing hospitals"
          },
          {
            status: 500
          }
        )

      }


      const duplicateHospital =
        existingHospitals?.find(
          item =>
            normalizeText(
              item.hospital_name
            ) ===
            normalizeText(
              hospitalName
            ) &&
            normalizeText(
              item.city
            ) ===
            normalizeText(
              cityRecord.name
            )
        )


      if (
        duplicateHospital
      ) {

        return NextResponse.json(
          {
            success: false,
            duplicate: true,
            message:
              "Hospital with this name already exists in this city",
            hospital_id:
              duplicateHospital.id,
            hospital_name:
              duplicateHospital.hospital_name
          }
        )

      }


      // -------------------------------------------
      // CREATE HOSPITAL
      // -------------------------------------------

      const {
        data: newHospital,
        error: hospitalInsertError
      } =
        await supabase
          .from("hospitals")
          .insert({

            hospital_name:
              hospitalName,

            contact_person:
              contactPerson,

            phone:
              phone,

            contact_designation:
              contactDesignation || null,

            city:
              cityRecord.name,

            state:
              stateRecord.name,

            state_id:
              stateRecord.id,

            city_id:
              cityRecord.id,

            status:
              "active",
            source: "google_form"

          })
          .select()
          .single()


      if (hospitalInsertError) {

        console.log(
          "Hospital insert error:",
          hospitalInsertError
        )


        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to create hospital",
            error:
              hospitalInsertError.message
          },
          {
            status: 500
          }
        )

      }


      hospital =
        newHospital

    }


    // =============================================
    // CREATE REQUIREMENT
    // =============================================

    const today =
      new Date()
        .toISOString()
        .split("T")[0]


    const {
      data: requirement,
      error: requirementError
    } =
      await supabase
        .from("requirements")
        .insert({

          hospital_id:
            hospital.id,

          specialty_id:
            specialty.id,

          experience_required:
            experienceValue,

          salary_min:
            salaryMinValue,

          salary_max:
            salaryMaxValue,

          positions:
            positions,

          status:
            "open",

          notes:
            notes || null,

          city:
            hospital.city || null,

          state:
            hospital.state || null,

     entry_date: today,
      source: "google_form"

        })
        .select()
        .single()


    if (requirementError) {

      console.log(
        "Requirement insert error:",
        requirementError
      )


      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create requirement",
          error:
            requirementError.message,
          hospital_id:
            hospital.id
        },
        {
          status: 500
        }
      )

    }


    // =============================================
    // SUCCESS
    // =============================================

    return NextResponse.json({

      success:
        true,

      message:
        "Hospital requirement created successfully",

      hospital_id:
        hospital.id,

      hospital_name:
        hospital.hospital_name,

      requirement_id:
        requirement.id

    })


  } catch (error) {

    console.log(
      "Google Requirement API error:",
      error
    )


    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid request",
        error:
          error?.message || null
      },
      {
        status: 500
      }
    )

  }

}
