"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"

export default function Specialties(){

const [specialties,setSpecialties] = useState([])
const [name,setName] = useState("")
const [loading,setLoading] = useState(false)

useEffect(()=>{
loadSpecialties()
},[])


async function loadSpecialties(){

const {data,error} = await supabase
.from("specialties")
.select(`
id,
name,
doctors(count),
requirements(count)
`)
.order("name")

if(error){
console.log(error)
return
}

setSpecialties(data || [])

}


function formatName(value){

return value
.trim()
.toLowerCase()
.replace(/\b\w/g,l=>l.toUpperCase())

}


async function addSpecialty(){

const specialtyName = formatName(name)

if(!specialtyName){

alert("Specialty name cannot be empty")
return

}

setLoading(true)

/* duplicate check */

const {data:existing} = await supabase
.from("specialties")
.select("id")
.eq("name",specialtyName)

if(existing && existing.length > 0){

alert("Specialty already exists")
setLoading(false)
return

}


/* insert */

const {error} = await supabase
.from("specialties")
.insert({
name:specialtyName
})

setLoading(false)

if(error){

alert("Error adding specialty")
console.log(error)
return

}

setName("")
loadSpecialties()

}


async function deleteSpecialty(id){

const confirmDelete = confirm("Delete this specialty?")

if(!confirmDelete) return

const {error} = await supabase
.from("specialties")
.delete()
.eq("id",id)

if(error){

alert("Cannot delete specialty because it is used")
console.log(error)
return

}

loadSpecialties()

}


return(

<div style={{color:"#0f172a"}}>

<h2 style={{marginBottom:"20px"}}>
Specialties
</h2>


{/* Add Specialty Card */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"20px",
marginBottom:"20px",
maxWidth:"500px"
}}>

<div style={{display:"flex",gap:"10px"}}>

<input
placeholder="Enter specialty"
value={name}
onChange={(e)=>setName(e.target.value)}
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px",
width:"250px"
}}
/>

<button
onClick={addSpecialty}
disabled={loading}
style={{
padding:"8px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Add Specialty
</button>

</div>

</div>


{/* Specialties Table */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden",
maxWidth:"700px"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc"}}>

<tr>

<th align="left">Specialty</th>
<th align="left">Doctors</th>
<th align="left">Requirements</th>
<th align="left">Action</th>

</tr>

</thead>

<tbody>

{specialties.map(s=>{

const doctorCount = s.doctors?.[0]?.count || 0
const reqCount = s.requirements?.[0]?.count || 0
const used = doctorCount + reqCount

return(

<tr key={s.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>{s.name}</td>

<td>{doctorCount}</td>

<td>{reqCount}</td>

<td>

{used > 0 ? (

<span style={{
color:"#9ca3af"
}}>
In Use
</span>

) : (

<button
onClick={()=>deleteSpecialty(s.id)}
style={{
background:"#ef4444",
color:"#fff",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
cursor:"pointer"
}}
>
Delete
</button>

)}

</td>

</tr>

)

})}

</tbody>

</table>

</div>

</div>

)

}