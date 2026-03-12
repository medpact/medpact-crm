"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

export default function AddHospital(){

const router = useRouter()

const [hospitalName,setHospitalName] = useState("")
const [hospitalType,setHospitalType] = useState("")
const [state,setState] = useState("")
const [city,setCity] = useState("")
const [contactPerson,setContactPerson] = useState("")
const [designation,setDesignation] = useState("")
const [phone,setPhone] = useState("")
const [email,setEmail] = useState("")
const [website,setWebsite] = useState("")
const [notes,setNotes] = useState("")
const [status,setStatus] = useState("active")

const [states,setStates] = useState([])
const [cities,setCities] = useState([])

useEffect(()=>{
loadStates()
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


async function saveHospital(){

if(!hospitalName){
alert("Hospital name required")
return
}

if(!contactPerson){
alert("Contact person required")
return
}

const {error} = await supabase
.from("hospitals")
.insert({
hospital_name:hospitalName,
hospital_type:hospitalType,
state_id:state,
city_id:city,
contact_person:contactPerson,
contact_designation:designation,
phone:phone,
email:email,
website:website,
notes:notes,
status:status
})

if(error){
console.log(error)
alert("Error saving hospital")
return
}

alert("Hospital added successfully")

router.push("/hospitals")

}


return(

<div style={{color:"#0f172a"}}>

<h2>Add Hospital</h2>

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"25px",
maxWidth:"600px"
}}>


{/* Hospital Name */}

<div style={{marginBottom:"15px"}}>
<label>Hospital Name</label>
<input
value={hospitalName}
onChange={(e)=>setHospitalName(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


{/* Hospital Type */}

<div style={{marginBottom:"15px"}}>
<label>Hospital Type</label>
<select
value={hospitalType}
onChange={(e)=>setHospitalType(e.target.value)}
style={{width:"100%",padding:"8px"}}
>
<option value="">Select</option>
<option value="Corporate">Corporate</option>
<option value="Private">Private</option>
<option value="Government">Government</option>
<option value="Trust">Trust</option>
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


{/* Contact Person */}

<div style={{marginBottom:"15px"}}>
<label>Contact Person</label>
<input
value={contactPerson}
onChange={(e)=>setContactPerson(e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</div>


{/* Contact Designation */}

<div style={{marginBottom:"15px"}}>
<label>Contact Person Designation</label>

<select
value={designation}
onChange={(e)=>setDesignation(e.target.value)}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select</option>
<option value="Medical Director">Medical Director</option>
<option value="Chief Doctor">Chief Doctor</option>
<option value="HR Manager">HR Manager</option>
<option value="HR Executive">HR Executive</option>
<option value="Recruitment Manager">Recruitment Manager</option>
<option value="Hospital Administrator">Hospital Administrator</option>

</select>

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
onClick={saveHospital}
style={{
padding:"10px 20px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}
>
Save Hospital
</button>

</div>

</div>

)

}