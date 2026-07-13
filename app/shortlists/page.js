"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function ShortlistsPage(){
const [search,setSearch] = useState("")
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
  const { data, error } = await supabase
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
  .neq("status","rejected")
.neq("status","placement_done")
.neq("status","closed")
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

/* STEP 1: INSERT INTO placements */

const { error: placementError } = await supabase
.from("placements")
.insert({
  doctor_id: row.doctor_id,
  hospital_id: row.requirements.hospital_id,
  joining_date: new Date().toISOString().split("T")[0]
})

if (placementError) {
  alert("Failed to create placement")
  return
}

/* STEP 2: UPDATE DOCTOR */

await supabase
.from("doctors")
.update({availability_status:"not_available"})
.eq("id",row.doctor_id)

/* STEP 3: DELETE REQUIREMENT (🔥 IMPORTANT) */

await supabase
.from("requirements")
.delete()
.eq("id",row.requirement_id)

}

fetchShortlists()

}


/* REJECT */

async function rejectCandidate(row){

const reason = prompt(
  "Enter rejection reason (Mandatory):"
)

if(!reason || !reason.trim()){
  alert("Rejection reason is mandatory")
  return
}

const hospitalName =
row.requirements?.hospitals?.hospital_name ||
"Unknown Hospital"

const {data:doctorData} = await supabase
.from("doctors")
.select("remarks")
.eq("id",row.doctor_id)
.single()

const d = new Date()

const formattedDate =
`${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`

const newRemark =
`${formattedDate} | ${hospitalName} | Rejected | ${reason}`

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
function getAge(createdDate){

const today = new Date()
const created = new Date(createdDate)

return Math.floor(
(today - created) / (1000 * 60 * 60 * 24)
)

}
/* STATUS COLOR */

function statusColor(status){

if(status==="shortlisted") return "#f59e0b"
if(status==="interview_assigned") return "#3b82f6"
if(status==="interview_completed") return "#fb923c"
if(status==="offer_released") return "#8b5cf6"
if(status==="placement_done") return "#16a34a"
if(status==="rejected") return "#ef4444"
if(status==="closed") return "#6b7280"
return "#64748b"

}

async function closePipeline(row){

const reason = prompt(
"Reason for closing this pipeline?"
)

if(!reason || !reason.trim()){
alert("Close reason is mandatory")
return
}

const { error } = await supabase
.from("shortlists")
.update({
status:"closed",
remarks:reason
})
.eq("id",row.id)

if(error){
alert("Unable to close pipeline")
return
}

alert("Pipeline closed successfully")

fetchShortlists()

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
{getAge(row.created_at) > 45 && (
<button
style={{
marginLeft:"6px",
background:"#6b7280",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:"4px",
cursor:"pointer"
}}
onClick={()=>closePipeline(row)}
>
Close
</button>
)}
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
{getAge(row.created_at) > 45 && (

<button
style={{
marginLeft:"6px",
background:"#6b7280",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:"4px",
cursor:"pointer"
}}
onClick={()=>closePipeline(row)}
>
Close
</button>

)}
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
{getAge(row.created_at) > 45 && (

<button
style={{
marginLeft:"6px",
background:"#6b7280",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:"4px",
cursor:"pointer"
}}
onClick={()=>closePipeline(row)}
>
Close
</button>

)}
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
  {getAge(row.created_at) > 45 && (

<button
style={{
marginLeft:"6px",
background:"#6b7280",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:"4px",
cursor:"pointer"
}}
onClick={()=>closePipeline(row)}
>
Close
</button>

)}
</>
)
}

return "-"
}

const filteredShortlists = shortlists.filter(s=>{

const term = search.toLowerCase()

return (
(s.doctors?.name || "")
.toLowerCase()
.includes(term)
||

(s.doctors?.specialties?.name || "")
.toLowerCase()
.includes(term)

||

(s.requirements?.hospitals?.hospital_name || "")
.toLowerCase()
.includes(term)

||

(s.requirements?.specialties?.name || "")
.toLowerCase()
.includes(term)

||

(s.requirements?.city || "")
.toLowerCase()
.includes(term)
)

})
/* UI */

return(

<div style={{color:"#0f172a"}}>

<h2 style={{marginBottom:"20px"}}>
Recruitment Pipeline
</h2>

<input
placeholder="Search doctor, hospital, specialty, city..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
style={{
marginBottom:"20px",
padding:"8px",
width:"350px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>
<div style={{
marginBottom:"10px",
fontSize:"14px",
color:"#64748b"
}}>
Showing {filteredShortlists.length} active candidate(s)
</div>
  
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

{filteredShortlists.map(s=>(

<tr key={s.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td
title={`${getAge(s.created_at)} Days Old`}
style={{
color:
getAge(s.created_at) > 45
? "#dc2626"
: getAge(s.created_at) > 30
? "#f59e0b"
: "#16a34a",

fontWeight:
getAge(s.created_at) > 45
? "700"
: "500"
}}
>
{getAge(s.created_at) > 45 ? "⚠ " : ""}
{formatDate(s.created_at)}
</td>

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
rel="noopener noreferrer"
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
