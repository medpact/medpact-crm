"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function HospitalProfile(){
const [isAdmin,setIsAdmin] = useState(false)

useEffect(()=>{
const user = localStorage.getItem("medpact_user")

if(user && user.trim().toLowerCase() === "admin"){
setIsAdmin(true)
}
},[])
const { id } = useParams()
const router = useRouter()

const [hospital,setHospital] = useState(null)
const [saving,setSaving] = useState(false)

useEffect(()=>{
loadHospital()
},[])

async function loadHospital(){

const {data,error} = await supabase
.from("hospitals")
.select(`
id,
hospital_name,
hospital_type,
city,
state,
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

}

function updateField(field,value){

setHospital(prev=>({
...prev,
[field]:value
}))

}

async function saveHospital(){

const confirmSave = confirm("Save changes?")
if(!confirmSave) return

setSaving(true)

const {error} = await supabase
.from("hospitals")
.update({
hospital_name:hospital.hospital_name,
hospital_type:hospital.hospital_type,
city:hospital.city,
state:hospital.state,
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

async function deleteHospital(){

const confirmDelete = confirm("Are you sure you want to delete this hospital?")
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

{/* Back */}

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

{/* Name */}

<p>
<b>Hospital Name</b><br/>
<input
value={hospital.hospital_name || ""}
onChange={(e)=>updateField("hospital_name",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Type */}

<p>
<b>Hospital Type</b><br/>
<input
value={hospital.hospital_type || ""}
onChange={(e)=>updateField("hospital_type",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* City */}

<p>
<b>City</b><br/>
<input
value={hospital.city || ""}
onChange={(e)=>updateField("city",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* State */}

<p>
<b>State</b><br/>
<input
value={hospital.state || ""}
onChange={(e)=>updateField("state",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Contact Person */}

<p>
<b>Contact Person</b><br/>
<input
value={hospital.contact_person || ""}
onChange={(e)=>updateField("contact_person",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Designation */}

<p>
<b>Designation</b><br/>
<input
value={hospital.contact_designation || ""}
onChange={(e)=>updateField("contact_designation",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Phone */}

<p>
<b>Phone</b><br/>
<input
value={hospital.phone || ""}
onChange={(e)=>updateField("phone",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Email */}

<p>
<b>Email</b><br/>
<input
value={hospital.email || ""}
onChange={(e)=>updateField("email",e.target.value)}
style={{width:"100%",padding:"8px"}}
/>
</p>

{/* Status */}

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

{/* Save Button */}

<button
onClick={saveHospital}
disabled={saving}
style={{
padding:"10px 18px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginRight:"10px"
}}
>
Save Changes
</button>

{/* Delete Button */}
{isAdmin && (
<button
onClick={deleteHospital}
style={{
padding:"10px 18px",
background:"#ef4444",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Delete Hospital
</button>
)}
</div>

</div>

)

}
