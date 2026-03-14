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


function formatDate(date){

if(!date) return ""

const d = new Date(date)

const day = String(d.getDate()).padStart(2,'0')
const month = String(d.getMonth()+1).padStart(2,'0')
const year = String(d.getFullYear()).slice(-2)

return `${day}-${month}-${year}`

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
borderRadius:"6px"
}}>
+ Add Requirement
</button>
</Link>

</div>


<div style={{
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc"}}>

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
style={{borderTop:"1px solid #eee",cursor:"pointer"}}
onClick={()=>setExpanded(expanded===hospital ? null : hospital)}
>

<td>{hospital}</td>
<td>{reqs[0].city}</td>
<td align="center">{reqs.length}</td>
<td align="center">{expanded===hospital ? "▲" : "▼"}</td>

</tr>


{expanded===hospital && reqs.map(r=>(

<tr key={r.id} style={{background:"#fafafa"}}>

<td style={{paddingLeft:"40px"}}>{r.specialties?.name}</td>

<td>{r.city}</td>

<td>{r.positions}</td>

<td align="center">

<Link href={`/requirements/${r.id}/matches`}>

<span style={{
background:"#ef4444",
color:"#fff",
padding:"6px 12px",
borderRadius:"20px",
fontSize:"12px"
}}>
{r.match_count}
</span>

</Link>

</td>

</tr>

))}

</>

)

})}

</tbody>

</table>

</div>

</div>

)

}
