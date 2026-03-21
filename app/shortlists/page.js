"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function ShortlistsPage(){

const [shortlists,setShortlists] = useState([])

useEffect(()=>{
fetchShortlists()
},[])


/* DATE FORMAT */

function formatDate(date){
if(!date) return ""

const d = new Date(date)
const day = String(d.getDate()).padStart(2,"0")
const month = String(d.getMonth()+1).padStart(2,"0")
const year = d.getFullYear()

return `${day}/${month}/${year}`
}


/* FETCH */

async function fetchShortlists(){

const {data,error} = await supabase
.from("shortlists")
.select(`
id,
doctor_id,
requirement_id,
status,
remarks,
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


/* STATUS CHANGE */

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


/* Placement */

if(newStatus === "placement_done"){

await supabase
.from("placements")
.insert({
doctor_id:row.doctor_id,
hospital_id:row.requirements.hospital_id,
joining_date:new Date().toISOString().split("T")[0]
})

await supabase
.from("doctors")
.update({availability_status:"not_available"})
.eq("id",row.doctor_id)

}

fetchShortlists()

}


/* REJECT */

async function rejectCandidate(row){

const reason = prompt("Enter rejection reason (Doctor / Hospital):")
if(!reason) return

const {data:doctorData} = await supabase
.from("doctors")
.select("remarks")
.eq("id",row.doctor_id)
.single()

const hospitalName = row.requirements?.hospitals?.hospital_name || "Unknown Hospital"

const today = new Date().toISOString().split("T")[0]

const newRemark =
`${today} | ${hospitalName} | ${reason}`

const updatedRemarks = doctorData?.remarks
? doctorData.remarks + "\n" + newRemark
: newRemark


await supabase
.from("shortlists")
.update({
status:"rejected",
remarks:reason
})
.eq("id",row.id)


await supabase
.from("doctors")
.update({
remarks:updatedRemarks
})
.eq("id",row.doctor_id)

fetchShortlists()

}


/* STATUS COLOR */

function statusColor(status){

if(status==="shortlisted") return "#f59e0b"
if(status==="interview_assigned") return "#3b82f6"
if(status==="interview_completed") return "#fb923c"
if(status==="offer_released") return "#8b5cf6"
if(status==="placement_done") return "#16a34a"
if(status==="rejected") return "#ef4444"

return "#64748b"

}


/* ACTION BUTTONS */

function actionButton(row){

if(row.status === "shortlisted"){
return(
<>
<button onClick={()=>changeStatus(row,"interview_assigned","Assign candidate for interview?")}>
Assign Interview
</button>

<button style={{marginLeft:"6px"}} onClick={()=>rejectCandidate(row)}>
Reject
</button>
</>
)
}

if(row.status === "interview_assigned"){
return(
<>
<button onClick={()=>changeStatus(row,"interview_completed","Mark interview completed?")}>
Interview Done
</button>

<button style={{marginLeft:"6px"}} onClick={()=>rejectCandidate(row)}>
Reject
</button>
</>
)
}

if(row.status === "interview_completed"){
return(
<>
<button onClick={()=>changeStatus(row,"offer_released","Release offer?")}>
Release Offer
</button>

<button style={{marginLeft:"6px"}} onClick={()=>rejectCandidate(row)}>
Reject
</button>
</>
)
}

if(row.status === "offer_released"){
return(
<>
<button onClick={()=>changeStatus(row,"placement_done","Confirm placement?")}>
Placement Done
</button>

<button style={{marginLeft:"6px"}} onClick={()=>rejectCandidate(row)}>
Reject
</button>
</>
)
}

return "-"
}


/* UI */

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

<thead style={{background:"#f8fafc", textAlign:"left"}}>

<tr>
<th>Date</th>
<th>Doctor</th>
<th>Specialty</th>
<th>Hospital</th>
<th>Requirement</th>
<th>City</th>
<th>Status</th>
<th>Remarks</th>
<th>Actions</th>
</tr>

</thead>

<tbody>

{shortlists.map(s=>(

<tr key={s.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>{formatDate(s.created_at)}</td>

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

<td style={{fontSize:"12px"}}>
{s.remarks || "-"}
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
