"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

export default function AddRequirement(){

const router = useRouter()

const [hospitals,setHospitals] = useState([])
const [specialties,setSpecialties] = useState([])

const [hospital,setHospital] = useState("")
const [city,setCity] = useState("")

const [requirements,setRequirements] = useState([
{
specialty:"",
experience:"",
salaryMin:"",
salaryMax:"",
positions:""
}
])


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
cities(name)
`)
.order("hospital_name")

if(error){
console.log(error)
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



function addRow(){

setRequirements([
...requirements,
{
specialty:"",
experience:"",
salaryMin:"",
salaryMax:"",
positions:""
}
])

}



function updateRow(index,field,value){

const updated=[...requirements]

updated[index][field]=value

setRequirements(updated)

}



function removeRow(index){

const updated=[...requirements]

updated.splice(index,1)

setRequirements(updated)

}



async function saveRequirements(goBack=false){

if(!hospital){
alert("Please select hospital")
return
}

const today = new Date().toISOString().split("T")[0]

const payload = requirements
.filter(r=>r.specialty)
.map(r=>({

hospital_id:Number(hospital),

specialty_id:Number(r.specialty),

experience_required:r.experience ? Number(r.experience) : null,

salary_min:r.salaryMin ? Number(r.salaryMin) : null,

salary_max:r.salaryMax ? Number(r.salaryMax) : null,

city:city,

positions:r.positions ? Number(r.positions) : null,

priority:"normal",

status:"open",

entry_date:today

}))


if(payload.length===0){
alert("Add at least one specialty")
return
}


const {error} = await supabase
.from("requirements")
.insert(payload)

if(error){
console.log(error)
alert("Error saving requirements")
return
}

alert("Requirements saved")

if(goBack){
router.push("/requirements")
}else{

setRequirements([
{
specialty:"",
experience:"",
salaryMin:"",
salaryMax:"",
positions:""
}
])

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
maxWidth:"750px"
}}>


{/* Hospital */}

<div style={{marginBottom:"20px"}}>

<label>Hospital</label>

<select
value={hospital}
onChange={(e)=>{

setHospital(e.target.value)

const selected = hospitals.find(h=>h.id==e.target.value)

if(selected){
setCity(selected.cities?.name || "")
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


{/* City */}

<div style={{marginBottom:"20px"}}>

<label>City</label>

<input
value={city}
readOnly
style={{width:"100%",padding:"8px",background:"#f1f5f9"}}
/>

</div>



{/* Requirement Rows */}

{requirements.map((row,index)=>(

<div
key={index}
style={{
border:"1px solid #e5e7eb",
padding:"15px",
marginBottom:"15px",
borderRadius:"6px"
}}
>

<div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>

<select
value={row.specialty}
onChange={(e)=>updateRow(index,"specialty",e.target.value)}
style={{padding:"8px"}}
>

<option value="">Specialty</option>

{specialties.map(s=>(
<option key={s.id} value={s.id}>{s.name}</option>
))}

</select>


<input
type="number"
placeholder="Experience"
value={row.experience}
onChange={(e)=>updateRow(index,"experience",e.target.value)}
style={{padding:"8px",width:"100px"}}
/>


<input
type="number"
placeholder="Salary Min"
value={row.salaryMin}
onChange={(e)=>updateRow(index,"salaryMin",e.target.value)}
style={{padding:"8px",width:"120px"}}
/>


<input
type="number"
placeholder="Salary Max"
value={row.salaryMax}
onChange={(e)=>updateRow(index,"salaryMax",e.target.value)}
style={{padding:"8px",width:"120px"}}
/>


<input
type="number"
placeholder="Positions"
value={row.positions}
onChange={(e)=>updateRow(index,"positions",e.target.value)}
style={{padding:"8px",width:"90px"}}
/>


<button
onClick={()=>removeRow(index)}
style={{
background:"#ef4444",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:"4px"
}}
>
Remove
</button>

</div>

</div>

))}



<button
onClick={addRow}
style={{
marginBottom:"20px",
padding:"6px 12px",
background:"#64748b",
color:"#fff",
border:"none",
borderRadius:"4px"
}}
>
+ Add Another Specialty
</button>



<div style={{display:"flex",gap:"10px"}}>

<button
onClick={()=>saveRequirements(true)}
style={{
padding:"10px 18px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}
>
Save Requirements
</button>

</div>

</div>

</div>

)

}
