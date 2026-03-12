"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

export default function AddDoctor(){

const router = useRouter()

const [name,setName] = useState("")
const [specialty,setSpecialty] = useState("")
const [experience,setExperience] = useState("")
const [phone,setPhone] = useState("")
const [email,setEmail] = useState("")
const [availability,setAvailability] = useState("available")
const [expectedCtc,setExpectedCtc] = useState("")
const [qualification,setQualification] = useState("")
const [remarks,setRemarks] = useState("")

const [state,setState] = useState("")
const [city,setCity] = useState("")

const [states,setStates] = useState([])
const [cities,setCities] = useState([])
const [specialties,setSpecialties] = useState([])

useEffect(()=>{
loadStates()
loadSpecialties()
},[])

useEffect(()=>{
if(state){
loadCities(state)
}
},[state])


async function loadStates(){

const {data} = await supabase
.from("states")
.select("*")
.order("name")

setStates(data || [])

}


async function loadCities(stateId){

const {data} = await supabase
.from("cities")
.select("*")
.eq("state_id",stateId)
.order("name")

setCities(data || [])

}


async function loadSpecialties(){

const {data} = await supabase
.from("specialties")
.select("id,name")
.order("name")

setSpecialties(data || [])

}


async function saveDoctor(){

if(!name){
alert("Doctor name required")
return
}

const {error} = await supabase
.from("doctors")
.insert({
name:name,
specialty_id:specialty,
experience_years:experience,
phone:phone,
email:email,
availability_status:availability,
expected_ctc:expectedCtc,
qualification:qualification,
remarks:remarks,
state_id:state,
city_id:city
})

if(error){
console.log(error)
alert("Error saving doctor")
return
}

alert("Doctor added successfully")

router.push("/doctors")

}


return(

<div style={{color:"#0f172a"}}>

<h2>Add Doctor</h2>

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"25px",
maxWidth:"600px"
}}>

{/* Name */}

<div style={{marginBottom:"15px"}}>
<label>Name</label>
<input
value={name}
onChange={(e)=>setName(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


{/* Specialty */}

<div style={{marginBottom:"15px"}}>
<label>Specialty</label>
<select
value={specialty}
onChange={(e)=>setSpecialty(e.target.value)}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select</option>

{specialties.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>
</div>


{/* State */}

<div style={{marginBottom:"15px"}}>
<label>State</label>
<select
value={state}
onChange={(e)=>setState(e.target.value)}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select State</option>

{states.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>
</div>


{/* City */}

<div style={{marginBottom:"15px"}}>
<label>City</label>
<select
value={city}
onChange={(e)=>setCity(e.target.value)}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select City</option>

{cities.map(c=>(
<option key={c.id} value={c.id}>
{c.name}
</option>
))}

</select>
</div>


{/* Experience */}

<div style={{marginBottom:"15px"}}>
<label>Experience</label>
<input
type="number"
value={experience}
onChange={(e)=>setExperience(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


{/* Phone */}

<div style={{marginBottom:"15px"}}>
<label>Phone</label>
<input
value={phone}
onChange={(e)=>setPhone(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


{/* Email */}

<div style={{marginBottom:"15px"}}>
<label>Email</label>
<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


{/* Save */}

<button
onClick={saveDoctor}
style={{
padding:"10px 20px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}
>
Save Doctor
</button>

</div>

</div>

)

}