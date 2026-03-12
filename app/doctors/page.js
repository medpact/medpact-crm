"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function DoctorsPage(){

const [doctors,setDoctors] = useState([])
const [specialties,setSpecialties] = useState([])

const [search,setSearch] = useState("")
const [specialty,setSpecialty] = useState("")
const [city,setCity] = useState("")
const [availability,setAvailability] = useState("")

const [page,setPage] = useState(1)
const pageSize = 20

const [total,setTotal] = useState(0)

useEffect(()=>{
fetchSpecialties()
},[])

useEffect(()=>{
fetchDoctors()
},[search,specialty,city,availability,page])


async function fetchSpecialties(){

const {data} = await supabase
.from("specialties")
.select("*")
.order("name")

setSpecialties(data || [])

}


async function fetchDoctors(){

let query = supabase
.from("doctors")
.select(`
id,
name,
experience_years,
city,
phone,
availability_status,
specialty_id,
specialties(name)
`,{count:"exact"})
.order("created_at",{ascending:false})
.range((page-1)*pageSize,(page*pageSize)-1)


if(search){
query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
}

if(specialty){
query = query.eq("specialty_id",specialty)
}

if(city){
query = query.ilike("city",`%${city}%`)
}

if(availability){
query = query.eq("availability_status",availability)
}

const {data,count} = await query

setDoctors(data || [])
setTotal(count || 0)

}

const totalPages = Math.ceil(total / pageSize)


return(

<div style={{padding:"30px",color:"#0f172a"}}>

{/* Header */}

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"25px"
}}>

<h2>Doctors</h2>

<Link href="/doctors/add">
<button style={{
padding:"10px 18px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}>
+ Add Doctor
</button>
</Link>

</div>


{/* Filters */}

<div style={{
display:"flex",
gap:"10px",
marginBottom:"20px"
}}>

<input
placeholder="Search name or phone"
value={search}
onChange={(e)=>setSearch(e.target.value)}
style={{padding:"8px",border:"1px solid #ddd",borderRadius:"6px"}}
/>

<select
value={specialty}
onChange={(e)=>setSpecialty(e.target.value)}
style={{padding:"8px",border:"1px solid #ddd",borderRadius:"6px"}}
>

<option value="">All Specialties</option>

{specialties.map(s=>(
<option key={s.id} value={s.id}>{s.name}</option>
))}

</select>

<input
placeholder="City"
value={city}
onChange={(e)=>setCity(e.target.value)}
style={{padding:"8px",border:"1px solid #ddd",borderRadius:"6px"}}
/>

<select
value={availability}
onChange={(e)=>setAvailability(e.target.value)}
style={{padding:"8px",border:"1px solid #ddd",borderRadius:"6px"}}
>

<option value="">Availability</option>
<option value="available">Available</option>
<option value="not_available">Not Available</option>
<option value="in_process">In Process</option>

</select>

</div>


{/* Table */}

<div style={{border:"1px solid #eee",borderRadius:"8px"}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc"}}>

<tr>

<th>Name</th>
<th>Specialty</th>
<th>Experience</th>
<th>City</th>
<th>Availability</th>
<th>Phone</th>
<th>Actions</th>

</tr>

</thead>

<tbody>

{doctors.map(d=>(

<tr key={d.id} style={{borderTop:"1px solid #eee"}}>

<td>{d.name}</td>
<td>{d.specialties?.name}</td>
<td>{d.experience_years} yrs</td>
<td>{d.city}</td>

<td>

<span style={{
padding:"4px 10px",
borderRadius:"20px",
background:"#e0f2fe",
fontSize:"12px"
}}>
{d.availability_status}
</span>

</td>

<td>{d.phone}</td>

<td>

<a
href={`https://wa.me/91${d.phone}`}
target="_blank"
style={{marginRight:"10px"}}
>
💬
</a>

<Link href={`/doctors/${d.id}`}>👁</Link>

</td>

</tr>

))}

</tbody>

</table>

</div>


{/* Pagination */}

<div style={{
marginTop:"20px",
display:"flex",
gap:"6px"
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
