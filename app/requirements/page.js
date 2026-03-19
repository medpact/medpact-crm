"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function RequirementsPage(){

const [requirements,setRequirements] = useState([])
const [expanded,setExpanded] = useState(null)

const [search,setSearch] = useState("")

const [page,setPage] = useState(1)
const pageSize = 20

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

/* FILTER */

const filteredHospitals = Object.keys(grouped).filter(hospital=>{

const reqs = grouped[hospital]

const hospitalMatch = hospital.toLowerCase().includes(search.toLowerCase())

const anyReqMatch = reqs.some(r=>
(r.specialties?.name || "").toLowerCase().includes(search.toLowerCase()) ||
(r.city || "").toLowerCase().includes(search.toLowerCase())
)

return hospitalMatch || anyReqMatch

})

/* PAGINATION */

const totalPages = Math.ceil(filteredHospitals.length / pageSize)

const paginatedHospitals = filteredHospitals.slice(
(page-1)*pageSize,
page*pageSize
)

return(

<div style={{color:"#0f172a"}}>

{/* HEADER */}

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

{/* SEARCH BAR */}

<div style={{marginBottom:"20px"}}>

<input
placeholder="Search hospital, city or specialty..."
value={search}
onChange={(e)=>{
setSearch(e.target.value)
setPage(1)
}}
style={{
width:"300px",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>

{/* TABLE */}

<div style={{
border:"1px solid #e5e7eb",
borderRadius:"10px",
overflow:"hidden",
boxShadow:"0 2px 6px rgba(0,0,0,0.05)"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f1f5f9"}}>

<tr>
<th align="left">Hospital</th>
<th align="left">City</th>
<th align="center">Requirements</th>
<th align="center">Expand</th>
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
background: expanded===hospital ? "#f8fafc" : "#fff",
fontWeight:"500"
}}
onClick={()=>setExpanded(expanded===hospital ? null : hospital)}
>

<td>{hospital}</td>

<td>{reqs[0].city}</td>

<td align="center">

<span style={{
background:"#e2e8f0",
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px"
}}>
{reqs.length}
</span>

</td>

<td align="center" style={{color:"#2563eb",fontSize:"18px"}}>
{expanded===hospital ? "▲" : "▼"}
</td>

</tr>

{expanded===hospital && (

<tr>

<td colSpan="4" style={{padding:"0",background:"#f8fafc"}}>

<table width="100%" cellPadding="10">

<thead>
<tr>
<th align="left" style={{paddingLeft:"40px"}}>Specialty</th>
<th>City</th>
<th>Positions</th>
<th>Matches</th>
<th>Delete</th>
</tr>
</thead>

<tbody>

{reqs.map((r,i)=>{

let matchColor="#ef4444"

if(r.match_count>=5) matchColor="#16a34a"
else if(r.match_count>=2) matchColor="#f59e0b"

return(

<tr
key={r.id}
style={{
borderTop:"1px solid #e5e7eb",
background: i%2===0 ? "#ffffff" : "#f9fafb"
}}
>

<td style={{paddingLeft:"40px",fontWeight:"500"}}>
{r.specialties?.name}
</td>

<td>{r.city}</td>

<td align="center">{r.positions}</td>

<td align="center">

<Link href={`/requirements/${r.id}/matches`}>

<span style={{
background:matchColor,
color:"#fff",
padding:"6px 12px",
borderRadius:"20px",
fontSize:"12px",
fontWeight:"600"
}}>
{r.match_count}
</span>

</Link>

</td>

<td align="center">

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
alert("Error deleting requirement")
return
}

alert("Requirement deleted")

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

)

})}

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

<div style={{
marginTop:"20px",
display:"flex",
gap:"8px"
}}>

{Array.from({length:totalPages}).map((_,i)=>{

const p=i+1

return(

<button
key={p}
onClick={()=>setPage(p)}
style={{
padding:"6px 10px",
border:"1px solid #ddd",
borderRadius:"6px",
background:page===p?"#2563eb":"#fff",
color:page===p?"#fff":"#000"
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
