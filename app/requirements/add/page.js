"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

export default function AddRequirement(){

const router = useRouter()

const [hospitals,setHospitals] = useState([])
const [specialties,setSpecialties] = useState([])

const [hospital,setHospital] = useState("")
const [specialty,setSpecialty] = useState("")
const [experience,setExperience] = useState("")
const [salaryMin,setSalaryMin] = useState("")
const [salaryMax,setSalaryMax] = useState("")
const [city,setCity] = useState("")
const [positions,setPositions] = useState("")
const [priority,setPriority] = useState("normal")
const [status,setStatus] = useState("open")
const [notes,setNotes] = useState("")

useEffect(()=>{
loadHospitals()
loadSpecialties()
},[])



async function loadHospitals(){

const {data,error} = await supabase
.from("hospitals")
.select(`
id,
hospital_name,
city_id,
cities(name)
`)
.order("hospital_name")

if(!error){
setHospitals(data || [])
}

}



async function loadSpecialties(){

const {data,error} = await supabase
.from("specialties")
.select("id,name")
.order("name")

if(!error){
setSpecialties(data || [])
}

}



async function saveRequirement(){

if(!hospital){
alert("Please select hospital")
return
}

if(!specialty){
alert("Please select specialty")
return
}

const {error} = await supabase
.from("requirements")
.insert({

hospital_id: hospital ? Number(hospital) : null,

specialty_id: specialty ? Number(specialty) : null,

experience_required: experience ? Number(experience) : null,

salary_min: salaryMin ? Number(salaryMin) : null,

salary_max: salaryMax ? Number(salaryMax) : null,

city: city || null,

positions: positions ? Number(positions) : null,

priority: priority,

status: status,

notes: notes || null

})

if(error){
console.log(error)
alert("Error saving requirement")
return
}

alert("Requirement added successfully")

router.push("/requirements")

}



return(

<div style={{color:"#0f172a"}}>

<h2 style={{marginBottom:"20px"}}>
Add Requirement
</h2>


<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"25px",
maxWidth:"600px"
}}>



{/* Hospital */}

<div style={{marginBottom:"15px"}}>

<label>Hospital</label>

<select
value={hospital}
onChange={(e)=>{

setHospital(e.target.value)

const selected = hospitals.find(h => h.id == e.target.value)

if(selected){
setCity(selected.cities?.name || "")
}

}}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
>

<option value="">Select Hospital</option>

{hospitals.map(h=>(
<option key={h.id} value={h.id}>
{h.hospital_name}
</option>
))}

</select>

</div>



{/* Specialty */}

<div style={{marginBottom:"15px"}}>

<label>Specialty</label>

<select
value={specialty}
onChange={(e)=>setSpecialty(e.target.value)}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
>

<option value="">Select Specialty</option>

{specialties.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>

</div>



{/* Experience */}

<div style={{marginBottom:"15px"}}>

<label>Experience Required (Years)</label>

<input
type="number"
value={experience}
onChange={(e)=>setExperience(e.target.value)}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>



{/* Salary Min */}

<div style={{marginBottom:"15px"}}>

<label>Salary Min</label>

<input
type="number"
value={salaryMin}
onChange={(e)=>setSalaryMin(e.target.value)}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>



{/* Salary Max */}

<div style={{marginBottom:"15px"}}>

<label>Salary Max</label>

<input
type="number"
value={salaryMax}
onChange={(e)=>setSalaryMax(e.target.value)}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>



{/* City */}

<div style={{marginBottom:"15px"}}>

<label>City</label>

<input
value={city}
readOnly
style={{
width:"100%",
padding:"8px",
background:"#f1f5f9",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>



{/* Positions */}

<div style={{marginBottom:"15px"}}>

<label>Positions</label>

<input
type="number"
value={positions}
onChange={(e)=>setPositions(e.target.value)}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>



{/* Priority */}

<div style={{marginBottom:"15px"}}>

<label>Priority</label>

<select
value={priority}
onChange={(e)=>setPriority(e.target.value)}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
>

<option value="urgent">Urgent</option>
<option value="normal">Normal</option>
<option value="low">Low</option>

</select>

</div>



{/* Status */}

<div style={{marginBottom:"15px"}}>

<label>Status</label>

<select
value={status}
onChange={(e)=>setStatus(e.target.value)}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
>

<option value="open">Open</option>
<option value="closed">Closed</option>

</select>

</div>



{/* Notes */}

<div style={{marginBottom:"20px"}}>

<label>Notes</label>

<textarea
value={notes}
onChange={(e)=>setNotes(e.target.value)}
style={{
width:"100%",
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

</div>



<button
onClick={saveRequirement}
style={{
padding:"10px 18px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Save Requirement
</button>

</div>

</div>

)

}
