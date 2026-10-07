import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"


// ---------------------------------------------
// SUPABASE
// ---------------------------------------------

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )


// ---------------------------------------------
// HELPERS
// ---------------------------------------------

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


function normalizePhone(value) {

  return clean(value).replace(/\D/g, "")

}


function normalizeEmail(value) {

  return clean(value).toLowerCase()

}


// ---------------------------------------------
// POST
// ---------------------------------------------

export async function POST(request) {

  try {
// =============================================
// SECURITY
// =============================================

const body =
  await request.json()

const secret =
  clean(body.google_form_secret)

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
    // READ REQUEST BODY
    // =============================================

    const body =
      await request.json()


    const name =
      clean(body.name)

    const qualification =
      clean(body.qualification)

    const specialtyName =
      clean(body.specialty)

    const experience =
      clean(body.experience)

    const phone =
      clean(body.phone)

    const email =
      clean(body.email)

    const stateName =
      clean(body.state)

    const cityName =
      clean(body.city)

    const preferredLocation =
      clean(body.preferred_location)

    const expectedCTC =
      clean(body.expected_ctc)

    const availabilityInput =
      clean(body.availability)

    const remarks =
      clean(body.remarks)


    // =============================================
    // VALIDATION
    // =============================================

    if (!name) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Doctor name is required"
        },
        {
          status: 400
        }
      )

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


    // =============================================
    // EXPERIENCE
    // =============================================

    let experienceYears = null


    if (experience) {

      const parsedExperience =
        Number(experience)


      if (
        Number.isNaN(parsedExperience) ||
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


      experienceYears =
        parsedExperience

    }


    // =============================================
    // EXPECTED CTC
    // =============================================

    let expectedCtcValue = null


    if (expectedCTC) {

      const parsedCtc =
        Number(
          String(expectedCTC)
            .replace(/,/g, "")
            .replace(/₹/g, "")
            .trim()
        )


      if (
        Number.isNaN(parsedCtc) ||
        parsedCtc < 0
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Expected CTC must be a valid number"
          },
          {
            status: 400
          }
        )

      }


      expectedCtcValue =
        parsedCtc

    }


    // =============================================
    // AVAILABILITY
    // =============================================

    let availability =
      "available"


    const availabilityText =
      normalizeText(
        availabilityInput
      )


    if (
      availabilityText ===
      "not available"
    ) {

      availability =
        "not_available"

    }


    if (
      availabilityText ===
      "in process"
    ) {

      availability =
        "in_process"

    }


    // =============================================
    // DUPLICATE CHECK
    // PHONE
    // =============================================

    const normalizedPhone =
      normalizePhone(phone)


    const {
      data: doctors,
      error: doctorsError
    } =
      await supabase
        .from("doctors")
        .select(
          "id,name,phone,email"
        )


    if (doctorsError) {

      console.log(
        "Doctor lookup error:",
        doctorsError
      )


      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to check existing doctors"
        },
        {
          status: 500
        }
      )

    }


    const existingByPhone =
      doctors?.find(
        doctor =>
          doctor.phone &&
          normalizePhone(
            doctor.phone
          ) === normalizedPhone
      )


    if (existingByPhone) {

      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          message:
            "Doctor with this phone number already exists",
          doctor_id:
            existingByPhone.id,
          doctor_name:
            existingByPhone.name
        }
      )

    }


    // =============================================
    // DUPLICATE CHECK
    // EMAIL
    // =============================================

    if (email) {

      const normalizedEmail =
        normalizeEmail(email)


      const existingByEmail =
        doctors?.find(
          doctor =>
            doctor.email &&
            normalizeEmail(
              doctor.email
            ) === normalizedEmail
        )


      if (existingByEmail) {

        return NextResponse.json(
          {
            success: false,
            duplicate: true,
            message:
              "Doctor with this email already exists",
            doctor_id:
              existingByEmail.id,
            doctor_name:
              existingByEmail.name
          }
        )

      }

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
    // FIND STATE
    // =============================================

    let stateId = null
    let stateValue = null


    if (stateName) {

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


      stateId =
        stateRecord.id

      stateValue =
        stateRecord.name

    }


    // =============================================
    // FIND CITY
    // =============================================

    let cityId = null
    let cityValue = null


    if (cityName) {

      let cityQuery =
        supabase
          .from("cities")
          .select(
            "id,name,state_id"
          )
          .ilike(
            "name",
            cityName
          )


      if (stateId) {

        cityQuery =
          cityQuery.eq(
            "state_id",
            stateId
          )

      }


      const {
        data: cities,
        error: cityError
      } =
        await cityQuery


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


      cityId =
        cityRecord.id

      cityValue =
        cityRecord.name

    }


    // =============================================
    // CREATE DOCTOR
    // =============================================

    const {
      data: doctor,
      error: insertError
    } =
      await supabase
        .from("doctors")
        .insert({

          name:
            name,

          qualification:
            qualification || null,

          specialty_id:
            specialty.id,

          specialty:
            specialty.name,

          experience_years:
            experienceYears,

          current_location:
            null,

          preferred_location:
            preferredLocation || null,

          expected_ctc:
            expectedCtcValue,

          phone:
            phone || null,

          email:
            email || null,

          availability_status:
            availability,

          state_id:
            stateId,

          state:
            stateValue,

          district_id:
            null,

          city_id:
            cityId,

          city:
            cityValue,

          source:
            "Google Form",

          remarks:
            remarks || null

        })
        .select()
        .single()


    if (insertError) {

      console.log(
        "Doctor insert error:",
        insertError
      )


      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create doctor",
          error:
            insertError.message
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
        "Doctor created successfully",

      doctor_id:
        doctor.id,

      doctor_name:
        doctor.name

    })


  } catch (error) {

    console.log(
      "Google Doctor API error:",
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
