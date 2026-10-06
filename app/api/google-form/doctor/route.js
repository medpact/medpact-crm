import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function clean(value) {
  if (value === undefined || value === null) return ""
  return String(value).trim()
}

function normalizePhone(value) {
  return clean(value).replace(/\D/g, "")
}

function normalizeEmail(value) {
  return clean(value).toLowerCase()
}

function normalizeText(value) {
  return clean(value).toLowerCase()
}

export async function POST(request) {

  try {

    const body = await request.json()

    const name = clean(body.name)
    const qualification = clean(body.qualification)
    const specialtyName = clean(body.specialty)
    const experience = clean(body.experience)
    const phone = clean(body.phone)
    const email = clean(body.email)
    const stateName = clean(body.state)
    const cityName = clean(body.city)
    const preferredLocation = clean(body.preferred_location)
    const expectedCTC = clean(body.expected_ctc)
    const availability = clean(body.availability) || "available"
    const remarks = clean(body.remarks)

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor name is required"
        },
        { status: 400 }
      )
    }

    if (!specialtyName) {
      return NextResponse.json(
        {
          success: false,
          message: "Specialty is required"
        },
        { status: 400 }
      )
    }

    // ------------------------------------------------
    // 1. CHECK DUPLICATE DOCTOR
    // ------------------------------------------------

    let existingDoctor = null

    if (phone) {

      const normalizedPhone = normalizePhone(phone)

      const { data: doctorsByPhone } = await supabase
        .from("doctors")
        .select("id,name,phone,email")
        .not("phone", "is", null)

      existingDoctor = doctorsByPhone?.find(
        doctor =>
          normalizePhone(doctor.phone) === normalizedPhone
      )
    }

    if (!existingDoctor && email) {

      const normalizedEmail = normalizeEmail(email)

      const { data: doctorsByEmail } = await supabase
        .from("doctors")
        .select("id,name,phone,email")
        .not("email", "is", null)

      existingDoctor = doctorsByEmail?.find(
        doctor =>
          normalizeEmail(doctor.email) === normalizedEmail
      )
    }

    if (existingDoctor) {

      return NextResponse.json({
        success: false,
        duplicate: true,
        message: "Doctor already exists",
        doctor_id: existingDoctor.id,
        doctor_name: existingDoctor.name
      })
    }

    // ------------------------------------------------
    // 2. FIND SPECIALTY
    // ------------------------------------------------

    const { data: specialties, error: specialtyError } =
      await supabase
        .from("specialties")
        .select("id,name")

    if (specialtyError) {
      console.log(specialtyError)

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load specialties"
        },
        { status: 500 }
      )
    }

    const specialty = specialties?.find(
      s =>
        normalizeText(s.name) ===
        normalizeText(specialtyName)
    )

    if (!specialty) {

      return NextResponse.json(
        {
          success: false,
          message: `Specialty not found: ${specialtyName}`
        },
        { status: 400 }
      )
    }

    // ------------------------------------------------
    // 3. FIND STATE
    // ------------------------------------------------

    let stateId = null

    if (stateName) {

      const { data: states, error: stateError } =
        await supabase
          .from("states")
          .select("id,name")

      if (stateError) {
        console.log(stateError)

        return NextResponse.json(
          {
            success: false,
            message: "Unable to load states"
          },
          { status: 500 }
        )
      }

      const stateRecord = states?.find(
        s =>
          normalizeText(s.name) ===
          normalizeText(stateName)
      )

      if (!stateRecord) {

        return NextResponse.json(
          {
            success: false,
            message: `State not found: ${stateName}`
          },
          { status: 400 }
        )
      }

      stateId = stateRecord.id
    }

    // ------------------------------------------------
    // 4. FIND CITY
    // ------------------------------------------------

    let cityId = null

    if (cityName) {

      let cityQuery = supabase
        .from("cities")
        .select("id,name,state_id")
        .ilike("name", cityName)

      if (stateId) {
        cityQuery = cityQuery.eq("state_id", stateId)
      }

      const { data: cities, error: cityError } =
        await cityQuery

      if (cityError) {
        console.log(cityError)

        return NextResponse.json(
          {
            success: false,
            message: "Unable to load cities"
          },
          { status: 500 }
        )
      }

      const cityRecord = cities?.find(
        c =>
          normalizeText(c.name) ===
          normalizeText(cityName)
      )

      if (!cityRecord) {

        return NextResponse.json(
          {
            success: false,
            message: `City not found: ${cityName}`
          },
          { status: 400 }
        )
      }

      cityId = cityRecord.id
    }

    // ------------------------------------------------
    // 5. INSERT DOCTOR
    // ------------------------------------------------

    const { data: doctor, error: insertError } =
      await supabase
        .from("doctors")
        .insert({
          name,
          qualification: qualification || null,
          specialty_id: specialty.id,
          experience_years: experience
            ? Number(experience)
            : null,
          phone: phone || null,
          email: email || null,
          state_id: stateId,
          city_id: cityId,
          preferred_location:
            preferredLocation || null,
          expected_ctc:
            expectedCTC
              ? Number(expectedCTC)
              : null,
          availability_status:
            availability || "available",
          remarks: remarks || null,
          source: "Google Form"
        })
        .select()
        .single()

    if (insertError) {

      console.log(insertError)

      return NextResponse.json(
        {
          success: false,
          message: "Unable to create doctor",
          error: insertError.message
        },
        { status: 500 }
      )
    }

    // ------------------------------------------------
    // 6. SUCCESS
    // ------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Doctor created successfully",
      doctor_id: doctor.id,
      doctor_name: doctor.name
    })

  } catch (error) {

    console.log(error)

    return NextResponse.json(
      {
        success: false,
        message: "Invalid request"
      },
      { status: 500 }
    )
  }
}
