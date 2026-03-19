"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function RequirementsPage(){

const [requirements,setRequirements] = useState([])
const [expanded,setExpanded] = useState(null)

const [page,setPage] = useState(1)
const pageSize = 20   // 🔥 grouped hospitals per page

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
entry_date,
positions,
priority,
specialty_id,
hospitals(hospital_name),
specialties(name)
`)
.order("entry_date",{ascending:false})

if(error){
console.log(error)
return
}

const withMatches = await addMatchCounts(data || [])

setRequirements(withMatches)

}

async function addMatchCounts(reqs){

let result=[]

for(const r of reqs){

const {count} = await supabase
.from("doctors")
.select("*",{count:"exact",head:true})
.eq("specialty_id",r.specialty_id)

result.push({
...r,
match_count:count || 0
})

}

return result

}

/* GROUP */

const grouped = {}

requirements.forEach(r=>{
const hospital = r.hospitals?.hospital_name || "Unknown"
if(!grouped[hospital]) grouped[hospital]=[]
grouped[hospital].push(r)
})

const hospitalList = Object.keys(grouped)

/* PAGINATION */

const totalPages = Math.ceil(hospitalList.length / pageSize)

const paginatedHospitals = hospitalList.slice(
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

<h2>Hospital Requirements</h2>

<Link href="/requirements/add">
<button style={{
padding:"8px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
fontWeight:"600"
}}>
+ Add Requirement
</button>
</Link>

</div>

<div style={{
border:"1px solid #e5e7eb",
borderRadius:"10px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f1f5f9"}}>
<tr>
<th>Hospital</th>
<th>City</th>
<th>Requirements</th>
<th>Expand</th>
 <th>Delete</th> 
</tr>
</thead>

<tbody>

{paginatedHospitals.map((hospital)=>{

const reqs = grouped[hospital]

return(

<>

<tr
key={hospital}
style={{
cursor:"pointer",
background: expanded===hospital ? "#f8fafc" : "#fff"
}}
onClick={()=>setExpanded(expanded===hospital ? null : hospital)}
>

<td>{hospital}</td>
<td>{reqs[0].city}</td>
<td align="center">{reqs.length}</td>
<td align="center">{expanded===hospital ? "▲" : "▼"}</td>

</tr>

{expanded===hospital && (

<tr>

<td colSpan="4">

<table width="100%">

<tbody>

{reqs.map((r)=>(

<tr key={r.id}>

<td style={{paddingLeft:"40px"}}>
{r.specialties?.name}
</td>

<td>{r.city}</td>

<td>{r.positions}</td>

<td>

<Link href={`/requirements/${r.id}/matches`}>
{r.match_count}
</Link>

</td>

<td>

<button
onClick={async (e)=>{
e.stopPropagation()

const confirmDelete = confirm("Delete this requirement?")
if(!confirmDelete) return

const {error} = await supabase
.from("requirements")
.delete()
.eq("id",r.id)

if(error){
alert("Error deleting")
return
}

alert("Deleted successfully")

loadRequirements()
}}
style={{
background:"transparent",
border:"none",
cursor:"pointer",
color:"#ef4444",
fontSize:"16px"
}}
>
🗑
</button>

</td>

</tr>
<td style={{paddingLeft:"40px"}}>
{r.specialties?.name}
</td>

<td>{r.city}</td>

<td>{r.positions}</td>

<td>

<Link href={`/requirements/${r.id}/matches`}>
{r.match_count}
</Link>

</td>

</tr>

))}

</tbody>

</table>

</td>

</tr>

)}

</>

)

})}

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
