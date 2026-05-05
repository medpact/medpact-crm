"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function MedicalTourismPage(){

const [form,setForm] = useState({
  name:"",
  country:"",
  phone:"",
  treatment:""
})

const [loading,setLoading] = useState(false)
const [message,setMessage] = useState("")


async function handleSubmit(e){
  e.preventDefault()

  setLoading(true)
  setMessage("")

  const {error} = await supabase
  .from("leads")
  .insert([form])

  if(error){
    setMessage("Something went wrong")
  }else{
    setMessage("Submitted successfully")
    setForm({
      name:"",
      country:"",
      phone:"",
      treatment:""
    })
  }

  setLoading(false)
}


return(

<div style={{padding:"30px",maxWidth:"900px",margin:"auto"}}>

<h1 style={{fontSize:"32px",marginBottom:"10px"}}>
Affordable Medical Treatment in India
</h1>

<p style={{marginBottom:"25px",color:"#555"}}>
Save up to 70% on Dental & Cardiac procedures
</p>


{/* LEAD FORM */}

<div style={{
border:"1px solid #eee",
padding:"20px",
borderRadius:"10px",
marginBottom:"30px"
}}>

<h3>Get Free Consultation</h3>

<form onSubmit={handleSubmit} style={{marginTop:"15px"}}>

<input
placeholder="Your Name"
value={form.name}
onChange={(e)=>setForm({...form,name:e.target.value})}
style={{display:"block",marginBottom:"10px",padding:"8px",width:"100%"}}
/>

<input
placeholder="Country"
value={form.country}
onChange={(e)=>setForm({...form,country:e.target.value})}
style={{display:"block",marginBottom:"10px",padding:"8px",width:"100%"}}
/>

<input
placeholder="Phone (with country code)"
value={form.phone}
onChange={(e)=>setForm({...form,phone:e.target.value})}
style={{display:"block",marginBottom:"10px",padding:"8px",width:"100%"}}
/>

<select
value={form.treatment}
onChange={(e)=>setForm({...form,treatment:e.target.value})}
style={{display:"block",marginBottom:"10px",padding:"8px",width:"100%"}}
>
<option value="">Select Treatment</option>
<option value="Dental">Dental</option>
<option value="Cardiac">Cardiac</option>
</select>

<button
type="submit"
disabled={loading}
style={{
padding:"10px 18px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}
>
{loading ? "Submitting..." : "Submit"}
</button>

</form>

{message && <p style={{marginTop:"10px"}}>{message}</p>}

</div>


{/* COST COMPARISON */}

<div style={{
border:"1px solid #eee",
padding:"20px",
borderRadius:"10px"
}}>

<h3>Cost Comparison</h3>

<table width="100%" cellPadding="10" style={{marginTop:"10px"}}>

<thead style={{background:"#f8fafc"}}>
<tr>
<th>Treatment</th>
<th>USA</th>
<th>Europe</th>
<th>India</th>
</tr>
</thead>

<tbody>
<tr>
<td>Root Canal</td>
<td>$1200</td>
<td>€800</td>
<td>$100</td>
</tr>

<tr>
<td>TAVR</td>
<td>$60,000</td>
<td>€50,000</td>
<td>$35,000</td>
</tr>
</tbody>

</table>

</div>


{/* WHATSAPP */}

<a
href="https://wa.me/91XXXXXXXXXX"
target="_blank"
style={{
position:"fixed",
bottom:"20px",
right:"20px",
background:"green",
color:"#fff",
padding:"12px 16px",
borderRadius:"50px",
textDecoration:"none"
}}
>
Chat
</a>

</div>

)
}
