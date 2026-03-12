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

useEffect(()=>{
fetchSpecialties()
fetchDoctors()
},[])

useEffect(()=>{
fetchDoctors()
},[search,specialty,city,availability])


async function fetchSpecialties(){

const {data,error} = await supabase
.from("specialties")
.select("id,name")
.order("name")

if(!error){
setSpecialties(data)
}

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
`)
.order("created_at",{ascending:false})


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

const {data,error} = await query


if(!error){
setDoctors(data)
}

}


function getStatusColor(status){

if(status==="available") return "#16a34a"
if(status==="not_available") return "#ef4444"
if(status==="in_process") return "#f59e0b"

return "#64748b"

}


async function shortlistDoctor(doctorId){

const requirementId = prompt("Enter Requirement ID")

if(!requirementId) return

const {error} = await supabase
.from("shortlists")
.insert({
doctor_id:doctorId,
requirement_id:requirementId,
status:"shortlisted"
})

if(error){
alert("Error shortlisting doctor")
}else{
alert("Doctor shortlisted")
}

}


return(

<div style={{color:"#0f172a"}}>

{/* HEADER */}

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"25px"
}}>

<h2>Doctors</h2>

<Link href="/doctors/add">

<button style={{
padding:"10px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}>

+ Add Doctor

</button>

</Link>

</div>


{/* FILTER BAR */}

<div style={{
display:"flex",
gap:"10px",
marginBottom:"20px",
flexWrap:"wrap"
}}>

<input
placeholder="Search name or phone"
value={search}
onChange={(e)=>setSearch(e.target.value)}
style={{
padding:"8px 12px",
border:"1px solid #ddd",
borderRadius:"6px",
background:"#fff"
}}
/>


<select
value={specialty}
onChange={(e)=>setSpecialty(e.target.value)}
style={{
padding:"8px 12px",
border:"1px solid #ddd",
borderRadius:"6px",
background:"#fff"
}}
>

<option value="">All Specialties</option>

{specialties.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>


<input
placeholder="City"
value={city}
onChange={(e)=>setCity(e.target.value)}
style={{
padding:"8px 12px",
border:"1px solid #ddd",
borderRadius:"6px",
background:"#fff"
}}
/>


<select
value={availability}
onChange={(e)=>setAvailability(e.target.value)}
style={{
padding:"8px 12px",
border:"1px solid #ddd",
borderRadius:"6px",
background:"#fff"
}}
>

<option value="">Availability</option>
<option value="available">Available</option>
<option value="not_available">Not Available</option>
<option value="in_process">In Process</option>

</select>

</div>


{/* DOCTORS TABLE */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12" style={{borderCollapse:"collapse"}}>

<thead style={{
background:"#f8fafc",
fontWeight:"600"
}}>

<tr>

<th align="left">Name</th>
<th align="left">Specialty</th>
<th align="left">Experience</th>
<th align="left">City</th>
<th align="left">Availability</th>
<th align="left">Phone</th>
<th align="left">Actions</th>

</tr>

</thead>


<tbody>

{doctors.map(d=>(

<tr
key={d.id}
style={{
borderTop:"1px solid #e5e7eb"
}}
>

<td>{d.name}</td>

<td>{d.specialties?.name}</td>

<td>{d.experience_years} yrs</td>

<td>{d.city}</td>

<td>

<span style={{
padding:"4px 10px",
borderRadius:"20px",
fontSize:"12px",
color:"#fff",
background:getStatusColor(d.availability_status)
}}>
{d.availability_status}
</span>

</td>

<td>{d.phone}</td>

<td>

<a
href={`https://wa.me/91${d.phone}`}
target="_blank"
style={{marginRight:"10px",textDecoration:"none"}}
>
💬
</a>

<Link
href={`/doctors/${d.id}`}
style={{marginRight:"10px"}}
>
👁
</Link>

<button
onClick={()=>shortlistDoctor(d.id)}
style={{
border:"none",
background:"transparent",
cursor:"pointer"
}}
>
⭐
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}