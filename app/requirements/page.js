"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function RequirementsPage(){

const [requirements,setRequirements] = useState([])
const [expanded,setExpanded] = useState(null)

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

/* GROUP REQUIREMENTS BY HOSPITAL */

const grouped = {}

requirements.forEach(r=>{

const hospital = r.hospitals?.hospital_name || "Unknown"

if(!grouped[hospital]) grouped[hospital]=[]

grouped[hospital].push(r)

})

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

{Object.keys(grouped).map((hospital)=>{

const reqs = grouped[hospital]

return(

<>

<tr
key={hospital}
style={{
borderTop:"1px solid #eee",
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

<td align="center" style={{fontSize:"18px",color:"#2563eb"}}>
{expanded===hospital ? "▲" : "▼"}
</td>

</tr>

{expanded===hospital && (

<tr>

<td colSpan="4" style={{padding:"0",background:"#f8fafc"}}>

<table width="100%" cellPadding="10">

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

</div>

)

}
