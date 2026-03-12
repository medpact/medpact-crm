"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function HospitalsPage(){

const [hospitals,setHospitals] = useState([])

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


return(

<div style={{color:"#0f172a"}}>

{/* Page Header */}

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"20px"
}}>

<h2>Hospitals</h2>

<Link href="/hospitals/add">

<button style={{
padding:"10px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}>
+ Add Hospital
</button>

</Link>

</div>


{/* Hospitals Table */}

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
<th align="left">Type</th>
<th align="left">City</th>
<th align="left">State</th>
<th align="left">Contact Person</th>
<th align="left">Phone</th>
<th align="left">Status</th>
<th align="left">Actions</th>

</tr>

</thead>

<tbody>

{hospitals.map(h=>(

<tr key={h.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>{h.hospital_name}</td>

<td>{h.hospital_type}</td>

<td>{h.city}</td>

<td>{h.state}</td>

<td>{h.contact_person}</td>

<td>{h.phone}</td>

<td>

<span style={{
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px",
color:"#fff",
background:statusColor(h.status)
}}>
{h.status}
</span>

</td>

<td>

<Link href={`/hospitals/${h.id}`} style={{marginRight:"10px"}}>
👁
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