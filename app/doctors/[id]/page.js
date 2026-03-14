"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function DoctorProfile(){

const { id } = useParams()

const [doctor,setDoctor] = useState(null)
const [specialties,setSpecialties] = useState([])
const [saving,setSaving] = useState(false)

useEffect(()=>{
loadDoctor()
loadSpecialties()
},[])

async function loadDoctor(){

const {data,error} = await supabase
.from("doctors")
.select(`
id,
name,
qualification,
specialty_id,
experience_years,
phone,
email,
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

}

async function loadSpecialties(){

const {data} = await supabase
.from("specialties")
.select("id,name")
.order("name")

setSpecialties(data || [])

}

function updateField(field,value){

setDoctor(prev=>({
...prev,
[field]:value
}))

}

async function saveDoctor(){

const confirmChange = confirm("Save changes to doctor profile?")
if(!confirmChange) return

setSaving(true)

const {error} = await supabase
.from("doctors")
.update({
name:doctor.name,
qualification:doctor.qualification,
specialty_id:doctor.specialty_id,
experience_years:doctor.experience_years,
phone:doctor.phone,
email:doctor.email,
city:doctor.city,
preferred_location:doctor.preferred_location,
expected_ctc:doctor.expected_ctc,
availability_status:doctor.availability_status,
source:doctor.source,
remarks:doctor.remarks
})
.eq("id",id)

setSaving(false)

if(error){
console.log(error)
alert("Error updating doctor")
return
}

alert("Doctor updated successfully")

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
}}

>

<h2>Edit Doctor</h2>

{/* Name */}

<p>
<b>Name</b><br/>
<input
value={doctor.name || ""}
onChange={(e)=>updateField("name",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Qualification */}

<p>
<b>Qualification</b><br/>
<input
value={doctor.qualification || ""}
onChange={(e)=>updateField("qualification",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Specialty */}

<p>
<b>Specialty</b><br/>
<select
value={doctor.specialty_id || ""}
onChange={(e)=>updateField("specialty_id",Number(e.target.value))}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select Specialty</option>

{specialties.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>

</p>

{/* Experience */}

<p>
<b>Experience (Years)</b><br/>
<input
type="number"
value={doctor.experience_years || ""}
onChange={(e)=>updateField("experience_years",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Phone */}

<p>
<b>Phone</b><br/>
<input
value={doctor.phone || ""}
onChange={(e)=>updateField("phone",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Email */}

<p>
<b>Email</b><br/>
<input
value={doctor.email || ""}
onChange={(e)=>updateField("email",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* City */}

<p>
<b>City</b><br/>
<input
value={doctor.city || ""}
onChange={(e)=>updateField("city",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Preferred Location */}

<p>
<b>Preferred Relocation City</b><br/>
<input
value={doctor.preferred_location || ""}
onChange={(e)=>updateField("preferred_location",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Expected CTC */}

<p>
<b>Expected CTC</b><br/>
<input
type="number"
value={doctor.expected_ctc || ""}
onChange={(e)=>updateField("expected_ctc",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Availability */}

<p>
<b>Availability</b><br/>
<select
value={doctor.availability_status || ""}
onChange={(e)=>updateField("availability_status",e.target.value)}
style={{width:"100%",padding:"8px"}}
>

<option value="available">Available</option>
<option value="not_available">Not Available</option>
<option value="in_process">In Process</option>

</select>
</p>

{/* Source */}

<p>
<b>Source</b><br/>
<input
value={doctor.source || ""}
onChange={(e)=>updateField("source",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Remarks */}

<p>
<b>Remarks</b><br/>
<textarea
value={doctor.remarks || ""}
onChange={(e)=>updateField("remarks",e.target.value)}
rows="4"
style={{width:"100%",padding:"10px"}}
/>
</p>

{/* Save */}

<button
onClick={saveDoctor}
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

</div>

)

}
