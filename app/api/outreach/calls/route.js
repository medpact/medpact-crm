
import {
  getAdminSupabase,
  getRequestSession,
  jsonError,
  CALL_OUTCOMES,
  OUTREACH_STATUSES,
} from "../../../../lib/outreach-server"

export const runtime = "nodejs"

function textValue(value) {
  return String(value ?? "").trim()
}

function numberValue(value) {
  if (value === "" || value === null || value === undefined) {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : NaN
}

function experienceYears(value) {
  if (value === null || value === undefined || value === "") {
    return null
  }

  // The existing requirements table stores experience as an integer.
  // Accept a plain number such as 3 or "3".
  const valueText = String(value).trim()

  if (/^\d+$/.test(valueText)) {
    return Number(valueText)
  }

  // Accept clear single-year wording such as "3 years".
  const match = valueText.match(/^(\d+)\s*years?$/i)

  if (match) {
    return Number(match[1])
  }

  // Do not guess when the input is a range such as "3-5 years".
  return null
}

function errorDetails(error) {
  return {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  }
}

export async function GET(request) {
  if (!getRequestSession(request)) {
    return jsonError("Please log in again", 401)
  }

  const url = new URL(request.url)
  const date =
    url.searchParams.get("date") ||
    new Date().toISOString().slice(0, 10)

  try {
    const db = getAdminSupabase()

    const { data, error } = await db
      .from("outreach_calls")
      .select("*, outreach_hospitals(hospital_name,city,state)")
      .gte("call_date", `${date}T00:00:00.000Z`)
      .lte("call_date", `${date}T23:59:59.999Z`)
      .order("call_date", { ascending: false })
      .limit(1000)

    if (error) {
      console.error("Daily calling report error:", errorDetails(error))
      return jsonError("Could not load daily report", 500)
    }

    return Response.json({
      success: true,
      calls: data || [],
    })
  } catch (error) {
    console.error("Daily calling report API error:", error)
    return jsonError("Could not load daily report", 500)
  }
}

export async function POST(request) {
  const session = getRequestSession(request)

  if (!session) {
    return jsonError("Please log in again", 401)
  }

  let db
  let savedCallId = null
  let createdHospitalId = null

  try {
    const body = await request.json()

    if (!body.hospital_id) {
      return jsonError("Hospital is required", 400)
    }

    if (!CALL_OUTCOMES.includes(body.outcome)) {
      return jsonError("Choose a valid call outcome", 400)
    }

    const doctorsRequired = numberValue(body.doctors_required)
    const salary = numberValue(body.salary_offered)

    if (
      Number.isNaN(doctorsRequired) ||
      (doctorsRequired !== null &&
        (!Number.isInteger(doctorsRequired) || doctorsRequired < 0))
    ) {
      return jsonError(
        "Doctors required must be a non-negative whole number",
        400
      )
    }

    if (
      Number.isNaN(salary) ||
      (salary !== null && salary < 0)
    ) {
      return jsonError(
        "Salary must be a valid non-negative amount",
        400
      )
    }

    const isRequirement =
      body.outcome === "requirement_identified"

    const experienceText = textValue(body.experience_required)
    const experience = experienceYears(experienceText)

    if (
      isRequirement &&
      !textValue(body.doctor_specialty)
    ) {
      return jsonError(
        "Enter the doctor specialty before recording a requirement",
        400
      )
    }

    if (
      isRequirement &&
      (!doctorsRequired || doctorsRequired < 1)
    ) {
      return jsonError(
        "Enter the number of doctors required before posting the requirement",
        400
      )
    }

    if (
      isRequirement &&
      salary === null
    ) {
      return jsonError(
        "Enter the salary offered before posting the requirement",
        400
      )
    }

    db = getAdminSupabase()

    // Confirm that the selected outreach hospital exists.
    const { data: outreachHospital, error: outreachHospitalError } =
      await db
        .from("outreach_hospitals")
        .select("*")
        .eq("id", body.hospital_id)
        .maybeSingle()

    if (outreachHospitalError) {
      console.error(
        "Outreach hospital lookup error:",
        errorDetails(outreachHospitalError)
      )
      return jsonError("Could not verify the selected hospital", 500)
    }

    if (!outreachHospital) {
      return jsonError("The selected hospital was not found", 404)
    }

    let existingHospital = null

    // Match the existing CRM hospital by exact name and city.
    // Never use the outreach UUID as the CRM integer ID.
    let hospitalQuery = db
      .from("hospitals")
      .select("id,hospital_name,city,state")
      .eq("hospital_name", outreachHospital.hospital_name)
      .limit(2)

    if (outreachHospital.city) {
      hospitalQuery = hospitalQuery.eq("city", outreachHospital.city)
    }

    if (outreachHospital.state) {
      hospitalQuery = hospitalQuery.eq("state", outreachHospital.state)
    }

    const { data: matchingHospitals, error: hospitalLookupError } =
      await hospitalQuery

    if (hospitalLookupError) {
      console.error(
        "CRM hospital lookup error:",
        errorDetails(hospitalLookupError)
      )
      return jsonError("Could not match the hospital to the CRM", 500)
    }

    if (matchingHospitals?.length > 1) {
      return jsonError(
        "Multiple CRM hospitals match this name and location. Please resolve the duplicate hospital records first.",
        409
      )
    }

    existingHospital = matchingHospitals?.[0] || null

    // Create the CRM hospital only if an exact match does not exist.
    if (!existingHospital && isRequirement) {
      const hospitalPayload = {
        hospital_name: outreachHospital.hospital_name,
        city: outreachHospital.city || null,
        state: outreachHospital.state || null,
        phone: outreachHospital.phone || null,
        hospital_type: outreachHospital.hospital_type || null,
        contact_person: textValue(body.contact_person) || null,
        contact_designation:
          textValue(body.contact_designation) || null,
        status: "active",
        source: "hospital_outreach",
        notes: outreachHospital.general_remarks || null,
      }

      const { data: newHospital, error: createHospitalError } =
        await db
          .from("hospitals")
          .insert(hospitalPayload)
          .select("id,hospital_name,city,state")
          .single()

      if (createHospitalError) {
        console.error(
          "CRM hospital creation error:",
          errorDetails(createHospitalError)
        )
        return jsonError(
          "Could not create the hospital in the recruitment CRM",
          500
        )
      }

      existingHospital = newHospital
      createdHospitalId = newHospital.id
    }

    let specialty = null

    if (isRequirement) {
      const specialtyName = textValue(body.doctor_specialty)

      const { data: specialties, error: specialtyError } =
        await db
          .from("specialties")
          .select("id,name")
          .ilike("name", specialtyName)
          .limit(2)

      if (specialtyError) {
        console.error(
          "Specialty lookup error:",
          errorDetails(specialtyError)
        )
        return jsonError("Could not verify the doctor specialty", 500)
      }

      if (!specialties?.length) {
        return jsonError(
          `Specialty "${specialtyName}" was not found in the CRM specialty master. Add or select the correct specialty first.`,
          400
        )
      }

      if (specialties.length > 1) {
        return jsonError(
          "More than one specialty matches this name. Please resolve the duplicate specialty records first.",
          409
        )
      }

      specialty = specialties[0]
    }

    // Save the call so it remains in the daily calling report.
    const callPayload = {
      hospital_id: body.hospital_id,
      employee_username: session.username,
      outcome: body.outcome,
      contact_person: textValue(body.contact_person) || null,
      contact_designation:
        textValue(body.contact_designation) || null,
      contact_phone: textValue(body.contact_phone) || null,
      remarks: textValue(body.remarks) || null,
      follow_up_date: body.follow_up_date || null,
      doctor_specialty: textValue(body.doctor_specialty) || null,
      doctor_qualification:
        textValue(body.doctor_qualification) || null,
      doctors_required: doctorsRequired,
      experience_required: experienceText || null,
      salary_offered: salary,
      job_location: textValue(body.job_location) || null,
    }

    const { data: savedCall, error: callError } = await db
      .from("outreach_calls")
      .insert(callPayload)
      .select("*")
      .single()

    if (callError) {
      console.error("Call save error:", errorDetails(callError))
      return jsonError("Could not save call record", 500)
    }

    savedCallId = savedCall.id

    let requirement = null

    // Only create a recruitment requirement for this outcome.
    if (isRequirement) {
      const today = new Date().toISOString().slice(0, 10)

      const requirementPayload = {
        hospital_id: existingHospital.id,
        specialty_id: specialty.id,
        experience_required: experience,
        salary_min: salary,
        salary_max: salary,
        positions: doctorsRequired,
        location: textValue(body.job_location) || outreachHospital.city || null,
        city: outreachHospital.city || null,
        state: outreachHospital.state || null,
        status: "active",
        priority: "normal",
        entry_date: today,
        source: "hospital_outreach",
        notes: [
          `Created from hospital outreach call ${savedCall.id}.`,
          `Doctor qualification: ${textValue(body.doctor_qualification) || "Not specified"}.`,
          `Experience entered: ${experienceText || "Not specified"}.`,
          `Contact person: ${textValue(body.contact_person) || "Not specified"}.`,
          `Contact designation: ${textValue(body.contact_designation) || "Not specified"}.`,
          `Contact phone: ${textValue(body.contact_phone) || "Not specified"}.`,
          `Call remarks: ${textValue(body.remarks) || "None"}.`,
          experience === null && experienceText
            ? "Experience wording needs manual review because it is not a single integer year value."
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
        outreach_call_id: savedCall.id,
      }

      const { data: insertedRequirement, error: requirementError } =
        await db
          .from("requirements")
          .insert(requirementPayload)
          .select("*")
          .single()

      if (requirementError) {
        console.error(
          "Recruitment requirement insert failed:",
          errorDetails(requirementError)
        )

        // Best-effort rollback of the call so the employee can correct
        // the issue and submit again. The original database error is logged.
        const { error: rollbackError } = await db
          .from("outreach_calls")
          .delete()
          .eq("id", savedCall.id)

        if (rollbackError) {
          console.error(
            "Call rollback failed; manual review required:",
            errorDetails(rollbackError)
          )

          return jsonError(
            "The call was saved, but the recruitment requirement could not be posted. The call needs manual review. Check the server logs.",
            500
          )
        }

        if (createdHospitalId !== null) {
          const { count, error: countError } = await db
            .from("requirements")
            .select("id", { count: "exact", head: true })
            .eq("hospital_id", createdHospitalId)

          if (!countError && count === 0) {
            const { error: hospitalRollbackError } = await db
              .from("hospitals")
              .delete()
              .eq("id", createdHospitalId)

            if (hospitalRollbackError) {
              console.error(
                "New CRM hospital cleanup failed:",
                errorDetails(hospitalRollbackError)
              )
            }
          }
        }

        return jsonError(
          `Requirement could not be posted: ${requirementError.message}`,
          500
        )
      }

      requirement = insertedRequirement
    }

    // Update the outreach status after saving the call and requirement.
    const statusMap = {
      interested: "interested",
      requirement_identified: "requirement_identified",
      call_back: "follow_up",
      busy: "follow_up",
      no_answer: "follow_up",
      answered: "follow_up",
      no_current_requirement: "no_current_requirement",
      not_interested: "not_interested",
      out_of_service: "invalid_number",
      not_connected: "follow_up",
    }

    const newStatus = statusMap[body.outcome]

    if (newStatus && OUTREACH_STATUSES.includes(newStatus)) {
      const { error: statusError } = await db
        .from("outreach_hospitals")
        .update({ current_status: newStatus })
        .eq("id", body.hospital_id)

      if (statusError) {
        console.error(
          "Call saved but outreach status update failed:",
          errorDetails(statusError)
        )
      }
    }

    return Response.json(
      {
        success: true,
        call: savedCall,
        requirement,
        requirement_created: Boolean(requirement),
        message: requirement
          ? "Call saved and recruitment requirement posted successfully."
          : "Call record saved successfully.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Call save API error:", errorDetails(error) || error)

    // If an unexpected error occurs after saving the call, try to clean
    // up the call record so it cannot be mistaken for a completed posting.
    if (db && savedCallId) {
      const { error: rollbackError } = await db
        .from("outreach_calls")
        .delete()
        .eq("id", savedCallId)

      if (rollbackError) {
        console.error(
          "Unexpected-error rollback failed:",
          errorDetails(rollbackError)
        )
      }
    }

    return jsonError("Could not save call record. Check the server logs.", 500)
  }
}
