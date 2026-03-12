"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function ShortlistsPage(){

const [shortlists,setShortlists] = useState([])

useEffect(()=>{
fetchShortlists()
},[])


async function fetchShortlists(){

const {data,error} = await supabase
.from("shortlists")
.select(`
id,
doctor_id,
requirement_id,
status,
created_at,
doctors(
id,
name,
phone,
city,
specialties(name)
),
requirements(
id,
hospital_id,
city,
hospitals(hospital_name),
specialties(name)
)
`)
.order("created_at",{ascending:false})

if(error){
console.log(error)
return
}

setShortlists(data || [])

}


async function changeStatus(row,newStatus,message){

const confirmAction = confirm(message)

if(!confirmAction) return

const {error} = await supabase
.from("shortlists")
.update({status:newStatus})
.eq("id",row.id)

if(error){
alert("Error updating status")
return
}


/* create placement record when placement done */

if(newStatus === "placement_done"){

await supabase
.from("placements")
.insert({
doctor_id:row.doctor_id,
hospital_id:row.requirements.hospital_id,
joining_date:new Date().toISOString().split("T")[0]
})

/* mark doctor not available */

await supabase
.from("doctors")
.update({availability_status:"not_available"})
.eq("id",row.doctor_id)

}

fetchShortlists()

}


function statusColor(status){

if(status==="shortlisted") return "#f59e0b"
if(status==="interview_assigned") return "#3b82f6"
if(status==="interview_completed") return "#fb923c"
if(status==="offer_released") return "#8b5cf6"
if(status==="placement_done") return "#16a34a"

return "#64748b"

}


function actionButton(row){

if(row.status === "shortlisted"){

return(
<button
onClick={()=>changeStatus(
row,
"interview_assigned",
"Assign candidate for interview?"
)}
>
Assign for Interview
</button>
)

}


if(row.status === "interview_assigned"){

return(
<button
onClick={()=>changeStatus(
row,
"interview_completed",
"Mark interview as completed?"
)}
>
Interview Completed
</button>
)

}


if(row.status === "interview_completed"){

return(
<button
onClick={()=>changeStatus(
row,
"offer_released",
"Release offer to candidate?"
)}
>
Release Offer
</button>
)

}


if(row.status === "offer_released"){

return(
<button
onClick={()=>changeStatus(
row,
"placement_done",
"Confirm placement?"
)}
>
Placement Done
</button>
)

}

return "-"

}


return(

<div style={{color:"#0f172a"}}>

<h2 style={{marginBottom:"20px"}}>
Recruitment Pipeline
</h2>


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
<th align="left">Hospital</th>
<th align="left">Requirement</th>
<th align="left">City</th>
<th align="left">Status</th>
<th align="left">Actions</th>

</tr>

</thead>

<tbody>

{shortlists.map(s=>(

<tr key={s.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>

<Link href={`/doctors/${s.doctors?.id}`}>
{s.doctors?.name}
</Link>

</td>

<td>{s.doctors?.specialties?.name}</td>

<td>{s.requirements?.hospitals?.hospital_name}</td>

<td>{s.requirements?.specialties?.name}</td>

<td>{s.requirements?.city}</td>

<td>

<span style={{
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px",
color:"#fff",
background:statusColor(s.status)
}}>
{s.status}
</span>

</td>

<td>

<a
href={`https://wa.me/91${s.doctors?.phone}`}
target="_blank"
style={{marginRight:"10px"}}
>
💬
</a>

{actionButton(s)}

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}