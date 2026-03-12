"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function RequirementsPage(){

const [requirements,setRequirements] = useState([])
const [search,setSearch] = useState("")

const [page,setPage] = useState(1)
const pageSize = 10

useEffect(()=>{
loadRequirements()
},[])

async function loadRequirements(){

const {data,error} = await supabase
.from("requirements")
.select(`
id,
city,
experience_required,
salary_min,
salary_max,
positions,
priority,
status,
hospitals(hospital_name),
specialties(name)
`)
.order("created_at",{ascending:false})

if(!error){
setRequirements(data || [])
}

}


const filtered = requirements.filter(r => {

const hospital = r.hospitals?.hospital_name?.toLowerCase() || ""
const specialty = r.specialties?.name?.toLowerCase() || ""
const city = r.city?.toLowerCase() || ""

return (
hospital.includes(search.toLowerCase()) ||
specialty.includes(search.toLowerCase()) ||
city.includes(search.toLowerCase())
)

})


const totalPages = Math.ceil(filtered.length / pageSize)

const start = (page - 1) * pageSize
const paginated = filtered.slice(start,start + pageSize)


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
padding:"8px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}>
+ Add Requirement
</button>
</Link>

</div>


{/* Search */}

<div style={{marginBottom:"20px"}}>

<input
placeholder="Search hospital, specialty or city..."
value={search}
onChange={(e)=>{

setSearch(e.target.value)
setPage(1)

}}
style={{
width:"350px",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>


{/* Table */}

<div style={{
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

{paginated.map(r=>(

<tr key={r.id} style={{borderTop:"1px solid #eee"}}>

<td>{r.hospitals?.hospital_name}</td>

<td>{r.specialties?.name}</td>

<td>{r.city}</td>

<td>{r.experience_required} yrs</td>

<td>
₹{r.salary_min?.toLocaleString()} - ₹{r.salary_max?.toLocaleString()}
</td>

<td>{r.positions}</td>

<td>

<span style={{
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px",
background: r.priority==="urgent" ? "#ef4444" : "#f59e0b",
color:"#fff"
}}>

{r.priority}

</span>

</td>

<td>

<Link href={`/requirements/${r.id}/matches`}>

<span style={{
background:"#ef4444",
color:"#fff",
padding:"6px 12px",
borderRadius:"20px",
fontSize:"12px",
cursor:"pointer"
}}>

Matches

</span>

</Link>

</td>

</tr>

))}

</tbody>

</table>

</div>


{/* Pagination */}

<div style={{
display:"flex",
gap:"8px",
marginTop:"20px"
}}>

{Array.from({length: totalPages}).map((_,i)=>{

const p = i + 1

return(

<button
key={p}
onClick={()=>setPage(p)}
style={{
padding:"6px 10px",
borderRadius:"6px",
border:"1px solid #ddd",
background: page===p ? "#2563eb" : "#fff",
color: page===p ? "#fff" : "#000"
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
