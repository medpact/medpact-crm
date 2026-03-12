"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function PlacementsPage(){

const [placements,setPlacements] = useState([])

useEffect(()=>{
loadPlacements()
},[])


async function loadPlacements(){

const {data,error} = await supabase
.from("placements")
.select(`
id,
doctor_id,
hospital_id,
joining_date,
doctors (
id,
name,
phone,
specialties(name)
),
hospitals (
hospital_name
)
`)
.order("joining_date",{ascending:false})

if(error){
console.log(error)
return
}

setPlacements(data || [])

}


return(

<div style={{color:"#0f172a"}}>

<h2 style={{marginBottom:"20px"}}>
Placements
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
<th align="left">Joining Date</th>
<th align="left">Salary</th>
<th align="left">Actions</th>

</tr>

</thead>

<tbody>

{placements.map(p=>(

<tr key={p.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>

<Link href={`/doctors/${p.doctors?.id}`}>
{p.doctors?.name}
</Link>

</td>

<td>{p.doctors?.specialties?.name}</td>

<td>{p.hospitals?.hospital_name}</td>

<td>{p.joining_date}</td>

<td>₹{p.salary}</td>

<td>

<a
href={`https://wa.me/91${p.doctors?.phone}`}
target="_blank"
>
💬
</a>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}