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

  const {error} = await supabase
  .from("leads")
  .insert([form])

  if(error){
    setMessage("Something went wrong")
  }else{
    setMessage("Submitted successfully")
    setForm({name:"",country:"",phone:"",treatment:""})
  }

  setLoading(false)
}

return(

<div style={{fontFamily:"Arial, sans-serif"}}>

{/* HERO */}

<div style={{
background:"#f0f6ff",
padding:"60px 20px",
textAlign:"center"
}}>
<h1 style={{fontSize:"36px"}}>
Affordable World-Class Treatment in India
</h1>

<p style={{marginTop:"10px",color:"#555"}}>
Save up to 70% on Dental & Cardiac procedures
</p>

<div style={{marginTop:"20px"}}>
<button style={{
padding:"12px 20px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
marginRight:"10px"
}}>
Get Free Consultation
</button>

<a href="https://wa.me/91XXXXXXXXXX" target="_blank">
<button style={{
padding:"12px 20px",
background:"green",
color:"#fff",
border:"none",
borderRadius:"6px"
}}>
WhatsApp
</button>
</a>
</div>
</div>


{/* TRUST */}

<div style={{
display:"flex",
justifyContent:"center",
gap:"40px",
padding:"20px",
borderBottom:"1px solid #eee"
}}>
<div>✔ 500+ Patients</div>
<div>✔ Certified Hospitals</div>
<div>✔ Experienced Doctors</div>
</div>


{/* TREATMENTS */}

<div style={{padding:"40px",textAlign:"center"}}>

<h2>Our Specialities</h2>

<div style={{
display:"flex",
justifyContent:"center",
gap:"30px",
marginTop:"20px"
}}>

<div style={{border:"1px solid #eee",padding:"20px",borderRadius:"10px",width:"250px"}}>
<h3>Dental Care</h3>
<p>Implants, Root Canal, Smile Makeover</p>
</div>

<div style={{border:"1px solid #eee",padding:"20px",borderRadius:"10px",width:"250px"}}>
<h3>Cardiac Care</h3>
<p>TAVR, Bypass Surgery, Angioplasty</p>
</div>

</div>
</div>


{/* COST COMPARISON */}

<div style={{
padding:"40px",
background:"#fafafa",
textAlign:"center"
}}>

<h2>Cost Comparison</h2>

<table style={{margin:"20px auto",borderCollapse:"collapse"}} cellPadding="10">

<thead style={{background:"#f1f5f9"}}>
<tr>
<th>Procedure</th>
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


{/* HOW IT WORKS */}

<div style={{padding:"40px",textAlign:"center"}}>

<h2>How It Works</h2>

<div style={{
display:"flex",
justifyContent:"center",
gap:"20px",
marginTop:"20px"
}}>

<div>1. Share Reports</div>
<div>2. Get Consultation</div>
<div>3. Travel to India</div>
<div>4. Treatment & Recovery</div>

</div>

</div>


{/* LEAD FORM */}

<div style={{
maxWidth:"600px",
margin:"auto",
padding:"20px",
border:"1px solid #eee",
borderRadius:"10px"
}}>

<h3>Get Free Consultation</h3>

<form onSubmit={handleSubmit}>

<input
placeholder="Name"
value={form.name}
onChange={(e)=>setForm({...form,name:e.target.value})}
style={{width:"100%",padding:"8px",marginBottom:"10px"}}
/>

<input
placeholder="Country"
value={form.country}
onChange={(e)=>setForm({...form,country:e.target.value})}
style={{width:"100%",padding:"8px",marginBottom:"10px"}}
/>

<input
placeholder="Phone"
value={form.phone}
onChange={(e)=>setForm({...form,phone:e.target.value})}
style={{width:"100%",padding:"8px",marginBottom:"10px"}}
/>

<select
value={form.treatment}
onChange={(e)=>setForm({...form,treatment:e.target.value})}
style={{width:"100%",padding:"8px",marginBottom:"10px"}}
>
<option value="">Select Treatment</option>
<option value="Dental">Dental</option>
<option value="Cardiac">Cardiac</option>
</select>

<button style={{
padding:"10px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px"
}}>
Submit
</button>

</form>

{message && <p>{message}</p>}

</div>


{/* TESTIMONIALS */}

<div style={{
padding:"40px",
textAlign:"center"
}}>

<h2>Patient Stories</h2>

<p>"I saved $40,000 on heart surgery in India!"</p>
<p>"Excellent dental care and smooth experience"</p>

</div>


{/* WHATSAPP FLOAT */}

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
borderRadius:"50px"
}}
>
Chat
</a>

</div>

)
}
