"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function RequirementsPage(){

const [isAdmin,setIsAdmin] = useState(false)

useEffect(()=>{
const user = localStorage.getItem("medpact_user")
if(user?.trim().toLowerCase() === "admin"){
setIsAdmin(true)
}
},[])

const [requirements,setRequirements] = useState([])
const [expanded,setExpanded] = useState(null)

const [search,setSearch] = useState("")
const [page,setPage] = useState(1)
const pageSize = 20

useEffect(()=>{
loadRequirements()
},[])


/* FORMAT DATE */

function formatDate(date){
if(!date) return ""

const d = new Date(date)
const day = String(d.getDate()).padStart(2,"0")
const month = String(d.getMonth()+1).padStart(2,"0")
const year = d.getFullYear()

return `${day}/${month}/${year}`
}


/* LOAD DATA (OPTIMIZED) */

async function loadRequirements(){

const {data,error} = await supabase
.from("requirements")
.select(`
id,
city,
entry_date,
positions,
specialty_id,
hospitals(hospital_name),
specialties(name)
`)
.order("entry_date",{ascending:false})

if(error){
console.log(error)
return
}

/* 🔥 GET ALL SPECIALTY IDS */
const specialtyIds = [...new Set(data.map(d=>d.specialty_id))]

/* 🔥 GET MATCH COUNTS IN ONE QUERY */
const {data:doctorCounts} = await supabase
.from("doctors")
.select("specialty_id", {count:"exact"})

/* CREATE MAP */
const countMap = {}

doctorCounts?.forEach(d=>{
countMap[d.specialty_id] = (countMap[d.specialty_id] || 0) + 1
})

/* MERGE MATCH COUNT */
const finalData = data.map(r=>({
...r,
match_count: countMap[r.specialty_id] || 0
}))

setRequirements(finalData)

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
borderRadius:"6px"
}}>
+ Add Requirement
</button>
</Link>

</div>

{/* SEARCH */}

<input
placeholder="Search hospital, city or specialty..."
value={search}
onChange={(e)=>{
setSearch(e.target.value)
setPage(1)
}}
style={{
marginBottom:"20px",
padding:"8px",
width:"300px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

{/* TABLE */}

<div style={{
border:"1px solid #e5e7eb",
borderRadius:"10px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f1f5f9", textAlign:"left"}}>

<tr>
<th>Date</th>
<th>Hospital</th>
<th>City</th>
<th>Requirements</th>
<th>Expand</th>
</tr>

</thead>

<tbody>

{paginatedHospitals.map((hospital)=>{

const reqs = grouped[hospital]

/* 🔥 GET LATEST DATE */
const latestDate = reqs[0]?.entry_date

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

<td>{formatDate(latestDate)}</td>

<td>{hospital}</td>

<td>{reqs[0].city}</td>

<td>{reqs.length}</td>

<td>{expanded===hospital ? "▲" : "▼"}</td>

</tr>


{expanded===hospital && (

<tr>

<td colSpan="5">

<table width="100%" cellPadding="10">

<thead style={{textAlign:"left"}}>
<tr>
<th style={{paddingLeft:"40px"}}>Specialty</th>
<th>City</th>
<th>Positions</th>
<th>Matches</th>
<th>Delete</th>
</tr>
</thead>

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
{isAdmin && (
<button
onClick={async (e)=>{
e.stopPropagation()

if(!confirm("Delete this requirement?")) return

await supabase
.from("requirements")
.delete()
.eq("id",r.id)

loadRequirements()
}}
style={{color:"red",border:"none",background:"none"}}
>
🗑
</button>
)}
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

<div style={{marginTop:"20px",display:"flex",gap:"6px"}}>

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
