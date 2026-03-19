"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function HospitalsPage(){

const [hospitals,setHospitals] = useState([])
const [page,setPage] = useState(1)

const pageSize = 25

useEffect(()=>{
fetchHospitals()
},[])

async function fetchHospitals(){

const {data,error} = await supabase
.from("hospitals")
.select(`
id,
hospital_name,
hospital_type,
city,
state,
contact_person,
contact_designation,
phone,
email,
status
`)
.order("hospital_name",{ascending:true})

if(error){
console.log(error)
return
}

setHospitals(data || [])

}

function statusColor(status){

if(status==="active") return "#16a34a"
if(status==="inactive") return "#ef4444"

return "#64748b"

}

/* PAGINATION */

const totalPages = Math.ceil(hospitals.length / pageSize)

const paginated = hospitals.slice(
(page-1)*pageSize,
page*pageSize
)

return(

<div style={{color:"#0f172a"}}>

<div style={{
display:"flex",
justifyContent:"space-between",
marginBottom:"20px"
}}>

<h2>Hospitals</h2>

<Link href="/hospitals/add">
<button style={{
padding:"10px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}>
+ Add Hospital
</button>
</Link>

</div>

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc"}}>

<tr>
<th>Hospital</th>
<th>Type</th>
<th>City</th>
<th>State</th>
<th>Contact Person</th>
<th>Designation</th>
<th>Phone</th>
<th>Status</th>
<th>Actions</th>
</tr>

</thead>

<tbody>

{paginated.map(h=>(

<tr key={h.id}>

<td>{h.hospital_name}</td>
<td>{h.hospital_type}</td>
<td>{h.city}</td>
<td>{h.state}</td>
<td>{h.contact_person}</td>
<td>{h.contact_designation}</td>
<td>{h.phone}</td>

<td>
<span style={{
background:statusColor(h.status),
color:"#fff",
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px"
}}>
{h.status}
</span>
</td>

<td>
<Link href={`/hospitals/${h.id}`}>👁</Link>
</td>

</tr>

))}

</tbody>

</table>

</div>

{/* PAGINATION */}

<div style={{marginTop:"20px",display:"flex",gap:"8px"}}>

{Array.from({length:totalPages}).map((_,i)=>{

const p=i+1

return(
<button
key={p}
onClick={()=>setPage(p)}
style={{
padding:"6px 10px",
border:"1px solid #ddd",
background:page===p?"#2563eb":"#fff",
color:page===p?"#fff":"#000",
borderRadius:"6px"
}}
>
{p}
</button>
)

})}

</div>

</div>

)

}
