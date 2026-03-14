"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function DoctorProfile(){

const { id } = useParams()

const [doctor,setDoctor] = useState(null)
const [status,setStatus] = useState("")
const [remarks,setRemarks] = useState("")
const [saving,setSaving] = useState(false)

useEffect(()=>{
fetchDoctor()
},[])

async function fetchDoctor(){

const {data,error} = await supabase
.from("doctors")
.select(`
id,
name,
qualification,
specialty_id,
specialties(name),
experience_years,
phone,
email,
state_id,
city_id,
city,
preferred_location,
expected_ctc,
availability_status,
source,
remarks
`)
.eq("id",id)
.single()

if(error){
console.log(error)
return
}

setDoctor(data)
setStatus(data.availability_status)
setRemarks(data.remarks || "")

}

async function updateDoctor(){

const confirmChange = confirm("Save changes to doctor profile?")
if(!confirmChange) return

setSaving(true)

const {error} = await supabase
.from("doctors")
.update({
availability_status:status,
remarks:remarks
})
.eq("id",id)

setSaving(false)

if(error){
alert("Error updating doctor")
console.log(error)
return
}

alert("Doctor updated successfully")
fetchDoctor()

}

function statusColor(status){

if(status==="available") return "#16a34a"
if(status==="not_available") return "#ef4444"
if(status==="in_process") return "#f59e0b"

return "#64748b"

}

if(!doctor){
return(
<div style={{padding:"30px"}}>
Loading doctor...
</div>
)
}

return(

<div style={{color:"#0f172a"}}>

<div style={{marginBottom:"20px"}}>
<Link href="/doctors">← Back to Doctors</Link>
</div>

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"25px",
maxWidth:"700px"
}}>

<h2 style={{marginTop:0}}>
{doctor.name}
</h2>

<p><b>Qualification:</b> {doctor.qualification}</p>
<p><b>Specialty:</b> {doctor.specialties?.name}</p>
<p><b>Experience:</b> {doctor.experience_years} years</p>

<p><b>Phone:</b> {doctor.phone}</p>
<p><b>Email:</b> {doctor.email}</p>

<p><b>City:</b> {doctor.city}</p>
<p><b>Preferred Relocation City:</b> {doctor.preferred_location}</p>

<p><b>Expected CTC:</b> ₹{doctor.expected_ctc}</p>

<p><b>Source:</b> {doctor.source}</p>

<p>

<b>Availability:</b>

<span
style={{
marginLeft:"10px",
padding:"4px 10px",
borderRadius:"20px",
color:"#fff",
background:statusColor(doctor.availability_status),
fontSize:"12px"
}}
>
{doctor.availability_status}
</span>

</p>

<div style={{marginTop:"20px"}}>

<label>Change Availability</label>

<select
value={status}
onChange={(e)=>setStatus(e.target.value)}
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px",
marginLeft:"10px"
}}
>

<option value="available">Available</option>
<option value="not_available">Not Available</option>
<option value="in_process">In Process</option>

</select>

</div>

<div style={{marginTop:"20px"}}>

<label>Remarks</label>

<textarea
value={remarks}
onChange={(e)=>setRemarks(e.target.value)}
rows="4"
style={{
width:"100%",
padding:"10px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>

<div style={{marginTop:"20px"}}>

<button
onClick={updateDoctor}
disabled={saving}
style={{
padding:"10px 18px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Save Changes
</button>

</div>

<div style={{marginTop:"25px"}}>

<a
href={`https://wa.me/91${doctor.phone}`}
target="_blank"
style={{
textDecoration:"none",
fontSize:"16px"
}}
>
💬 WhatsApp
</a>

</div>

</div>

</div>

)

}
