"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function HospitalProfile(){

const { id } = useParams()
const router = useRouter()

const [hospital,setHospital] = useState(null)
const [states,setStates] = useState([])
const [cities,setCities] = useState([])

const [saving,setSaving] = useState(false)

useEffect(()=>{
loadHospital()
loadStates()
},[])


/* LOAD STATES */

async function loadStates(){

const {data} = await supabase
.from("states")
.select("id,name")
.order("name")

setStates(data || [])

}


/* LOAD CITIES */

async function loadCities(stateId){

const {data} = await supabase
.from("cities")
.select("id,name")
.eq("state_id",stateId)
.order("name")

setCities(data || [])

}


/* LOAD HOSPITAL */

async function loadHospital(){

const {data,error} = await supabase
.from("hospitals")
.select(`
id,
hospital_name,
hospital_type,
state_id,
city_id,
contact_person,
contact_designation,
phone,
email,
status
`)
.eq("id",id)
.single()

if(error){
console.log(error)
return
}

setHospital(data)

/* load cities for existing state */
if(data.state_id){
loadCities(data.state_id)
}

}


/* UPDATE FIELD */

function updateField(field,value){

setHospital(prev=>({
...prev,
[field]:value
}))

}


/* STATE CHANGE */

function handleStateChange(val){

updateField("state_id",val)
updateField("city_id","")   // reset city

loadCities(val)

}


/* SAVE */

async function saveHospital(){

const confirmSave = confirm("Save changes?")
if(!confirmSave) return

setSaving(true)

const {error} = await supabase
.from("hospitals")
.update({
hospital_name:hospital.hospital_name,
hospital_type:hospital.hospital_type,
state_id:hospital.state_id,
city_id:hospital.city_id,
contact_person:hospital.contact_person,
contact_designation:hospital.contact_designation,
phone:hospital.phone,
email:hospital.email,
status:hospital.status
})
.eq("id",id)

setSaving(false)

if(error){
console.log(error)
alert("Error updating hospital")
return
}

alert("Hospital updated successfully")

}


/* DELETE */

async function deleteHospital(){

const confirmDelete = confirm("Delete this hospital?")
if(!confirmDelete) return

const {error} = await supabase
.from("hospitals")
.delete()
.eq("id",id)

if(error){
alert("Error deleting hospital")
return
}

alert("Hospital deleted")

router.push("/hospitals")

}


if(!hospital){

return(
<div style={{padding:"30px"}}>
Loading hospital...
</div>
)

}


return(

<div style={{color:"#0f172a"}}>

<div style={{marginBottom:"20px"}}>
<Link href="/hospitals">← Back to Hospitals</Link>
</div>

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"25px",
maxWidth:"700px"
}}>

<h2>Edit Hospital</h2>


{/* NAME */}

<p>
<b>Hospital Name</b><br/>
<input
value={hospital.hospital_name || ""}
onChange={(e)=>updateField("hospital_name",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>


{/* TYPE */}

<p>
<b>Hospital Type</b><br/>
<select
value={hospital.hospital_type || ""}
onChange={(e)=>updateField("hospital_type",e.target.value)}
style={{width:"100%",padding:"8px"}}
>
<option value="">Select</option>
<option value="Corporate">Corporate</option>
<option value="Private">Private</option>
<option value="Government">Government</option>
<option value="Trust">Trust</option>
</select>
</p>


{/* STATE */}

<p>
<b>State</b><br/>
<select
value={hospital.state_id || ""}
onChange={(e)=>handleStateChange(e.target.value)}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select State</option>

{states.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>
</p>


{/* CITY */}

<p>
<b>City</b><br/>
<select
value={hospital.city_id || ""}
onChange={(e)=>updateField("city_id",e.target.value)}
style={{width:"100%",padding:"8px"}}
>

<option value="">Select City</option>

{cities.map(c=>(
<option key={c.id} value={c.id}>
{c.name}
</option>
))}

</select>
</p>


{/* CONTACT */}

<p>
<b>Contact Person</b><br/>
<input
value={hospital.contact_person || ""}
onChange={(e)=>updateField("contact_person",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>


<p>
<b>Designation</b><br/>
<input
value={hospital.contact_designation || ""}
onChange={(e)=>updateField("contact_designation",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>


<p>
<b>Phone</b><br/>
<input
value={hospital.phone || ""}
onChange={(e)=>updateField("phone",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>


<p>
<b>Email</b><br/>
<input
value={hospital.email || ""}
onChange={(e)=>updateField("email",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>


{/* STATUS */}

<p>
<b>Status</b><br/>
<select
value={hospital.status || ""}
onChange={(e)=>updateField("status",e.target.value)}
style={{width:"100%",padding:"8px"}}
>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
</select>
</p>


{/* BUTTONS */}

<div style={{marginTop:"20px"}}>

<button
onClick={saveHospital}
disabled={saving}
style={{
padding:"10px 18px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
marginRight:"10px"
}}
>
Save Changes
</button>

<button
onClick={deleteHospital}
style={{
padding:"10px 18px",
background:"#ef4444",
color:"#fff",
border:"none",
borderRadius:"6px"
}}
>
Delete Hospital
</button>

</div>

</div>

</div>

)

}
