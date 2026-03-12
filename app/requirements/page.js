"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function RequirementsPage(){

const [requirements,setRequirements] = useState([])
const [doctors,setDoctors] = useState([])

useEffect(()=>{
loadRequirements()
loadDoctors()
},[])


async function loadRequirements(){

const {data,error} = await supabase
.from("requirements")
.select(`
id,
specialty_id,
experience_required,
salary_min,
salary_max,
city,
positions,
priority,
status,
hospitals(hospital_name),
specialties(name)
`)
.order("created_at",{ascending:false})

if(error){
console.log(error)
return
}

setRequirements(data || [])

}


async function loadDoctors(){

const {data,error} = await supabase
.from("doctors")
.select(`
id,
specialty_id,
experience_years,
city
`)

if(error){
console.log(error)
return
}

setDoctors(data || [])

}


function countMatches(requirement){

const matches = doctors.filter(d =>
d.specialty_id === requirement.specialty_id &&
d.experience_years >= requirement.experience_required &&
d.city?.toLowerCase() === requirement.city?.toLowerCase()
)

return matches.length

}


function priorityColor(priority){

if(priority==="urgent") return "#ef4444"
if(priority==="normal") return "#f59e0b"
if(priority==="low") return "#16a34a"

return "#64748b"

}


function matchColor(count){

if(count === 0) return "#ef4444"
if(count <= 2) return "#f59e0b"

return "#16a34a"

}


return(

<div style={{color:"#0f172a"}}>

{/* Header */}

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"20px"
}}>

<h2>Hospital Requirements</h2>

<Link href="/requirements/add">

<button style={{
padding:"10px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}>
+ Add Requirement
</button>

</Link>

</div>


{/* Requirements Table */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc"}}>

<tr>

<th align="left">Hospital</th>
<th align="left">Specialty</th>
<th align="left">City</th>
<th align="left">Experience</th>
<th align="left">Salary</th>
<th align="left">Positions</th>
<th align="left">Priority</th>
<th align="left">Matches</th>

</tr>

</thead>

<tbody>

{requirements.map(r=>{

const matches = countMatches(r)

return(

<tr key={r.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>{r.hospitals?.hospital_name}</td>

<td>{r.specialties?.name}</td>

<td>{r.city}</td>

<td>{r.experience_required} yrs</td>

<td>
₹{r.salary_min} - ₹{r.salary_max}
</td>

<td>{r.positions}</td>

<td>

<span style={{
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px",
color:"#fff",
background:priorityColor(r.priority)
}}>
{r.priority}
</span>

</td>

<td>

<Link href={`/requirements/${r.id}/matches`}>

<span style={{
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px",
color:"#fff",
background:matchColor(matches),
cursor:"pointer"
}}>

{matches} Matches

</span>

</Link>

</td>

</tr>

)

})}

</tbody>

</table>

</div>

</div>

)

}