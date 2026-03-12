"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function HospitalProfile(){

const { id } = useParams()

const [hospital,setHospital] = useState(null)
const [requirements,setRequirements] = useState([])

useEffect(()=>{
loadHospital()
loadRequirements()
},[])


async function loadHospital(){

const {data,error} = await supabase
.from("hospitals")
.select("*")
.eq("id",id)
.single()

if(error){
console.log(error)
return
}

setHospital(data)

}


async function loadRequirements(){

const {data,error} = await supabase
.from("requirements")
.select(`
id,
experience_required,
salary_min,
salary_max,
city,
positions,
status,
specialties(name)
`)
.eq("hospital_id",id)
.order("created_at",{ascending:false})

if(error){
console.log(error)
return
}

setRequirements(data || [])

}


function statusColor(status){

if(status==="active") return "#16a34a"
if(status==="inactive") return "#ef4444"

return "#64748b"

}


if(!hospital){

return(
<div style={{padding:"30px"}}>
Loading hospital...
</div>
)

}


return(

<div style={{color:"#0f172a"}}>

{/* Back Button */}

<div style={{marginBottom:"20px"}}>

<Link href="/hospitals">
← Back to Hospitals
</Link>

</div>


{/* Hospital Info */}

<h2 style={{marginBottom:"20px"}}>
{hospital.hospital_name}
</h2>


<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"20px",
marginBottom:"30px",
maxWidth:"700px"
}}>

<p><b>Type:</b> {hospital.hospital_type}</p>

<p><b>City:</b> {hospital.city}</p>

<p><b>State:</b> {hospital.state}</p>

<p><b>Contact Person:</b> {hospital.contact_person}</p>

<p><b>Phone:</b> {hospital.phone}</p>

<p><b>Email:</b> {hospital.email}</p>

<p><b>Website:</b> {hospital.website}</p>

<p>

<b>Status:</b>

<span style={{
marginLeft:"10px",
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px",
color:"#fff",
background:statusColor(hospital.status)
}}>

{hospital.status}

</span>

</p>

<p><b>Notes:</b> {hospital.notes}</p>

</div>


{/* Requirements Section */}

<h3 style={{marginBottom:"15px"}}>
Hospital Requirements
</h3>


<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc"}}>

<tr>

<th align="left">Specialty</th>
<th align="left">City</th>
<th align="left">Experience</th>
<th align="left">Salary</th>
<th align="left">Positions</th>
<th align="left">Status</th>
<th align="left">Matches</th>

</tr>

</thead>

<tbody>

{requirements.map(r=>(

<tr key={r.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>{r.specialties?.name}</td>

<td>{r.city}</td>

<td>{r.experience_required} yrs</td>

<td>
₹{r.salary_min} - ₹{r.salary_max}
</td>

<td>{r.positions}</td>

<td>{r.status}</td>

<td>

<Link href={`/requirements/${r.id}/matches`}>
View Matches
</Link>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}