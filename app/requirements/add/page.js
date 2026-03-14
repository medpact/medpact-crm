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
.select("id,hospital_name,city")
.order("hospital_name")

if(error){
console.log("Hospital load error:",error)
return
}

setHospitals(data || [])

}


async function loadSpecialties(){

const {data} = await supabase
.from("specialties")
.select("id,name")
.order("name")

setSpecialties(data || [])

}



function resetForm(){

setSpecialty("")
setExperience("")
setSalaryMin("")
setSalaryMax("")
setPositions("")
setPriority("normal")
setStatus("open")
setNotes("")

}



async function saveRequirement(goBack=false){

if(!hospital){
alert("Please select hospital")
return
}

if(!specialty){
alert("Please select specialty")
return
}

const today = new Date().toISOString().split("T")[0]

const {error} = await supabase
.from("requirements")
.insert({

hospital_id: Number(hospital),
specialty_id: Number(specialty),
experience_required: experience ? Number(experience) : null,
salary_min: salaryMin ? Number(salaryMin) : null,
salary_max: salaryMax ? Number(salaryMax) : null,
city: city,
positions: positions ? Number(positions) : null,
priority,
status,
notes,
entry_date: today

})

if(error){
console.log(error)
alert("Error saving requirement")
return
}

alert("Requirement saved")

if(goBack){
router.push("/requirements")
}else{
resetForm()
}

}



return(

<div style={{color:"#0f172a"}}>

<h2 style={{marginBottom:"20px"}}>Add Requirement</h2>

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
setCity(selected.city || "")
}

}}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select Hospital</option>

{hospitals.map(h=>(
<option key={h.id} value={h.id}>{h.hospital_name}</option>
))}

</select>

</div>


{/* Specialty */}

<div style={{marginBottom:"15px"}}>

<label>Specialty</label>

<select
value={specialty}
onChange={(e)=>setSpecialty(e.target.value)}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select Specialty</option>

{specialties.map(s=>(
<option key={s.id} value={s.id}>{s.name}</option>
))}

</select>

</div>


{/* Experience */}

<div style={{marginBottom:"15px"}}>

<label>Experience Required</label>

<input
type="number"
value={experience}
onChange={(e)=>setExperience(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>

</div>


{/* Salary */}

<div style={{marginBottom:"15px"}}>

<label>Salary Min</label>

<input
type="number"
value={salaryMin}
onChange={(e)=>setSalaryMin(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>

</div>


<div style={{marginBottom:"15px"}}>

<label>Salary Max</label>

<input
type="number"
value={salaryMax}
onChange={(e)=>setSalaryMax(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>

</div>


{/* City */}

<div style={{marginBottom:"15px"}}>

<label>City</label>

<input value={city} readOnly style={{width:"100%",padding:"8px",background:"#f1f5f9"}}/>

</div>


{/* Positions */}

<div style={{marginBottom:"15px"}}>

<label>Positions</label>

<input
type="number"
value={positions}
onChange={(e)=>setPositions(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>

</div>


{/* Buttons */}

<div style={{display:"flex",gap:"10px"}}>

<button
onClick={()=>saveRequirement(false)}
style={{
padding:"10px 18px",
background:"#16a34a",
color:"#fff",
border:"none",
borderRadius:"6px"
}}
>
Save & Add Another
</button>

<button
onClick={()=>saveRequirement(true)}
style={{
padding:"10px 18px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}
>
Save & Go to Requirements
</button>

</div>

</div>

</div>

)

}
