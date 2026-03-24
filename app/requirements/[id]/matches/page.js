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


async function loadRequirement(){

const {data,error} = await supabase
.from("requirements")
.select(`
id,
specialty_id,
preferred_location,
salary_min,
salary_max,
hospitals(hospital_name),
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



async function loadDoctors(req){

const {data,error} = await supabase
.from("doctors")
.select(`
id,
name,
experience_years,
city,
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



async function shortlistDoctor(doctorId){

const {error} = await supabase
.from("shortlists")
.insert({
doctor_id:doctorId,
requirement_id:id,
status:"shortlisted"
})

if(error){
console.log("Shortlist error:",error)
alert("Error shortlisting doctor")
return
}

alert("Doctor shortlisted successfully")

}



if(!requirement){

return(
<div style={{padding:"30px"}}>
Loading...
</div>
)

}


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


{/* Requirement Summary */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"20px",
marginBottom:"20px"
}}>

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



<h3>

Matching Doctors ({doctors.length})

</h3>


{/* Doctors Table */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc"}}>

<tr>

<th align="left">Doctor</th>
<th align="left">Specialty</th>
<th align="left">Experience</th>
<th align="left">Relocation City</th>
<th align="left">Phone</th>
<th align="left">Availability</th>  
<th align="left">Actions</th>

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
