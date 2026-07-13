"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabase"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function MatchesPage(){

const { id } = useParams()

const [requirement,setRequirement] = useState(null)
const [doctors,setDoctors] = useState([])

useEffect(()=>{
loadRequirement()
},[])


/* LOAD REQUIREMENT */

async function loadRequirement(){

const {data,error} = await supabase
.from("requirements")
.select(`
id,
specialty_id,
city,
salary_min,
salary_max,
hospitals(
hospital_name,
contact_person,
phone
),
specialties(name)
`)
.eq("id",id)
.single()

if(error){
console.log(error)
return
}

setRequirement(data)

loadDoctors(data)

}


/* LOAD DOCTORS */

async function loadDoctors(req){

const {data,error} = await supabase
.from("doctors")
.select(`
id,
name,
experience_years,
preferred_location,
phone,
availability_status,
specialty_id,
specialties(name)
`)
.eq("specialty_id",req.specialty_id)

if(error){
console.log(error)
return
}

setDoctors(data || [])

}


/* SHORTLIST */

async function shortlistDoctor(doctorId){

/* STEP 1 - Get Requirement Details */

const { data:reqData, error:reqError } = await supabase
.from("requirements")
.select("hospital_id,specialty_id")
.eq("id",id)
.single()

if(reqError){
alert("Unable to load requirement")
return
}

/* STEP 2 - Check Existing Active Shortlist */

const { data:existing } = await supabase
.from("shortlists")
.select(`
id,
status,
created_at,
requirements(
hospital_id,
specialty_id,
hospitals(hospital_name)
)
`)
.eq("doctor_id",doctorId)

if(existing){

const duplicate = existing.find(s=>
s.requirements?.hospital_id === reqData.hospital_id &&
s.requirements?.specialty_id === reqData.specialty_id &&
!["rejected","closed","placement_done"].includes(s.status)
)

if(duplicate){

const date = new Date(duplicate.created_at)

const formatted =
`${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`

alert(
`This doctor is already shortlisted.

Hospital:
${duplicate.requirements?.hospitals?.hospital_name}

Status:
${duplicate.status.replaceAll("_"," ")}

Shortlisted On:
${formatted}`
)

return

}

}

/* STEP 3 - Insert */

const { error } = await supabase
.from("shortlists")
.insert({
doctor_id:doctorId,
requirement_id:id,
status:"shortlisted"
})

if(error){
console.log(error)
alert("Error shortlisting doctor")
return
}

alert("Doctor shortlisted successfully")

}


/* LOADING */

if(!requirement){

return(
<div style={{padding:"30px"}}>
Loading...
</div>
)

}


/* UI */

return(

<div style={{color:"#0f172a"}}>

<div style={{marginBottom:"20px"}}>

<Link href="/requirements">
← Back to Requirements
</Link>

</div>


<h2 style={{marginBottom:"20px"}}>

Matches for {requirement.specialties?.name}

</h2>


{/* REQUIREMENT SUMMARY */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"20px",
marginBottom:"20px",
display:"flex",
justifyContent:"space-between"
}}>

{/* LEFT */}

<div>

<p>
<b>Hospital:</b> {requirement.hospitals?.hospital_name}
</p>

<p>
<b>City:</b> {requirement.city}
</p>

<p>
<b>Salary:</b> ₹{requirement.salary_min} - ₹{requirement.salary_max}
</p>

</div>


{/* RIGHT (NEW SECTION) */}

<div>

<p>
<b>Contact Person:</b> {requirement.hospitals?.contact_person || "-"}
</p>

<p>
<b>Phone:</b> {requirement.hospitals?.phone || "-"}
</p>

</div>

</div>



<h3>

Matching Doctors ({doctors.length})

</h3>


{/* TABLE */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc", textAlign:"left"}}>

<tr>

<th>Doctor</th>
<th>Specialty</th>
<th>Experience</th>
<th>Relocation City</th>
<th>Phone</th>
<th>Availability</th>  
<th>Actions</th>

</tr>

</thead>


<tbody>

{doctors.map(d=>(

<tr key={d.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>{d.name}</td>

<td>{d.specialties?.name}</td>

<td>{d.experience_years} yrs</td>

<td>{d.preferred_location}</td>

<td>{d.phone}</td>

<td>{d.availability_status}</td>

<td>

<a
href={`https://wa.me/91${d.phone}`}
target="_blank"
style={{marginRight:"12px"}}
>
💬
</a>

<Link href={`/doctors/${d.id}`} style={{marginRight:"12px"}}>
👁
</Link>

<button
onClick={()=>shortlistDoctor(d.id)}
style={{
border:"none",
background:"transparent",
cursor:"pointer",
fontSize:"16px"
}}
>
⭐
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)
}
