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
const [city,setCity] = useState("")
const [expectedCTC,setExpectedCTC] = useState("")
const [availability,setAvailability] = useState("available")
const [qualification,setQualification] = useState("")
const [remarks,setRemarks] = useState("")

const [specialties,setSpecialties] = useState([])

useEffect(()=>{
loadSpecialties()
},[])

async function loadSpecialties(){

const {data,error} = await supabase
.from("specialties")
.select("id,name")
.order("name")

if(!error){
setSpecialties(data || [])
}

}


async function saveDoctor(){

if(!name){
alert("Doctor name required")
return
}

if(!specialty){
alert("Please select specialty")
return
}

const doctorData = {
name: name || null,
specialty_id: specialty ? Number(specialty) : null,
experience_years: experience ? Number(experience) : null,
phone: phone || null,
email: email || null,
city: city || null,
expected_ctc: expectedCTC ? Number(expectedCTC) : null,
availability_status: availability || "available",
qualification: qualification || null,
remarks: remarks || null
}

const { error } = await supabase
.from("doctors")
.insert([doctorData])

if(error){
console.log(error)
alert("Error saving doctor")
return
}

alert("Doctor added successfully")

router.push("/doctors")

}


return(

<div style={{maxWidth:"600px"}}>

<h2 style={{marginBottom:"20px"}}>Add Doctor</h2>


<div style={{marginBottom:"15px"}}>
<label>Name</label>
<input
value={name}
onChange={(e)=>setName(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


<div style={{marginBottom:"15px"}}>
<label>Specialty</label>
<select
value={specialty}
onChange={(e)=>setSpecialty(e.target.value)}
style={{width:"100%",padding:"8px"}}
>
<option value="">Select Specialty</option>

{specialties.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>
</div>


<div style={{marginBottom:"15px"}}>
<label>Experience (Years)</label>
<input
type="number"
value={experience}
onChange={(e)=>setExperience(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


<div style={{marginBottom:"15px"}}>
<label>Phone</label>
<input
value={phone}
onChange={(e)=>setPhone(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


<div style={{marginBottom:"15px"}}>
<label>Email</label>
<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


<div style={{marginBottom:"15px"}}>
<label>City</label>
<input
value={city}
onChange={(e)=>setCity(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


<div style={{marginBottom:"15px"}}>
<label>Expected CTC</label>
<input
type="number"
value={expectedCTC}
onChange={(e)=>setExpectedCTC(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


<div style={{marginBottom:"15px"}}>
<label>Availability</label>
<select
value={availability}
onChange={(e)=>setAvailability(e.target.value)}
style={{width:"100%",padding:"8px"}}
>
<option value="available">Available</option>
<option value="not_available">Not Available</option>
<option value="in_process">In Process</option>
</select>
</div>


<div style={{marginBottom:"15px"}}>
<label>Qualification</label>
<input
value={qualification}
onChange={(e)=>setQualification(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


<div style={{marginBottom:"15px"}}>
<label>Remarks</label>
<textarea
value={remarks}
onChange={(e)=>setRemarks(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


<button
onClick={saveDoctor}
style={{
background:"#2563eb",
color:"#fff",
padding:"10px 20px",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Save Doctor
</button>


</div>

)

}