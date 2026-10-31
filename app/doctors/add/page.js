
"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

const SOURCE_OPTIONS = [
  "Direct",
  "Naukri",
  "Indeed",
  "LinkedIn",
  "SMS",
  "WhatsApp",
  "Email",
  "Ref"
]

export default function AddDoctor() {

  const router = useRouter()

  const [name, setName] = useState("")
  const [qualification, setQualification] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [experience, setExperience] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [preferredLocation, setPreferredLocation] = useState("")
  const [expectedCTC, setExpectedCTC] = useState("")
  const [availability, setAvailability] = useState("available")
  const [remarks, setRemarks] = useState("")
  const [source, setSource] = useState("")

  const [specialties, setSpecialties] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSpecialties()
    loadStates()
  }, [])

  async function loadSpecialties() {

    const { data, error } = await supabase
      .from("specialties")
      .select("id,name")
      .order("name")

    if (!error) {
      setSpecialties(data || [])
    } else {
      console.error("Error loading specialties:", error)
    }

  }

  async function loadStates() {

    const { data, error } = await supabase
      .from("states")
      .select("id,name")
      .order("name")

    if (!error) {
      setStates(data || [])
    } else {
      console.error("Error loading states:", error)
    }

  }

  async function loadCities(stateId) {

    const { data, error } = await supabase
      .from("cities")
      .select("id,name")
      .eq("state_id", stateId)
      .order("name")

    if (!error) {
      setCities(data || [])
    } else {
      console.error("Error loading cities:", error)
    }

  }

  async function handleStateChange(val) {

    setState(val)
    setCity("")
    setCities([])

    if (val) {
      await loadCities(val)
    }

  }

  async function saveDoctor() {

    if (!name.trim()) {
      alert("Doctor name required")
      return
    }

    if (!specialty) {
      alert("Please select specialty")
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from("doctors")
      .insert({

        name: name.trim(),

        qualification: qualification || null,

        specialty_id: specialty ? Number(specialty) : null,

        experience_years: experience ? Number(experience) : null,

        phone: phone || null,

        email: email || null,

        state_id: state ? Number(state) : null,

        city_id: city ? Number(city) : null,

        preferred_location: preferredLocation || null,

        expected_ctc: expectedCTC ? Number(expectedCTC) : null,

        availability_status: availability || "available",

        remarks: remarks || null,

        source: source || null

      })

    setSaving(false)

    if (error) {
      console.error("Error saving doctor:", error)
      alert("Error saving doctor: " + error.message)
      return
    }

    alert("Doctor added successfully")

    router.push("/doctors")

  }

  const inputStyle = {
    width: "100%",
    padding: "9px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box"
  }

  const fieldStyle = {
    marginBottom: "15px"
  }

  return (

    <div style={{
      maxWidth: "600px",
      paddingBottom: "30px"
    }}>

      <h2 style={{ marginBottom: "20px" }}>
        Add Doctor
      </h2>

      <div style={fieldStyle}>
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label>Qualification</label>
        <input
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label>Specialty</label>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Specialty</option>

          {specialties.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}

        </select>
      </div>

      <div style={fieldStyle}>
        <label>Experience (Years)</label>
        <input
          type="number"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label>Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label>State</label>
        <select
          value={state}
          onChange={(e) => handleStateChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select State</option>

          {states.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}

        </select>
      </div>

      <div style={fieldStyle}>
        <label>City</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={inputStyle}
          disabled={!state}
        >
          <option value="">Select City</option>

          {cities.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

        </select>
      </div>

      <div style={fieldStyle}>
        <label>Relocation City (Preferred Location)</label>
        <input
          value={preferredLocation}
          onChange={(e) => setPreferredLocation(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label>Expected CTC</label>
        <input
          type="number"
          value={expectedCTC}
          onChange={(e) => setExpectedCTC(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label>Availability</label>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          style={inputStyle}
        >
          <option value="available">Available</option>
          <option value="not_available">Not Available</option>
          <option value="in_process">In Process</option>
        </select>
      </div>

      {/* SOURCE DROPDOWN */}

      <div style={fieldStyle}>
        <label>Source</label>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Source</option>

          {SOURCE_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}

        </select>

        <small style={{
          display: "block",
          marginTop: "5px",
          color: "#64748b"
        }}>
          Select how this doctor was sourced.
        </small>
      </div>

      <div style={fieldStyle}>
        <label>Remarks</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
          style={inputStyle}
        />
      </div>

      <button
        onClick={saveDoctor}
        disabled={saving}
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? "Saving..." : "Save Doctor"}
      </button>

    </div>

  )

}
