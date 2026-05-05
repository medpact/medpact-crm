"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function MedicalTourismPage(){

const [procedures,setProcedures] = useState([])
const [testimonials,setTestimonials] = useState([])
const [doctors,setDoctors] = useState([])

useEffect(()=>{
loadData()
},[])

async function loadData(){

const {data:proc} = await supabase.from("procedures").select("*")
setProcedures(proc || [])

const {data:testi} = await supabase.from("testimonials").select("*")
setTestimonials(testi || [])

const {data:docs} = await supabase
.from("doctors")
.select("id,name,experience_years,specialties(name)")
.limit(6)

setDoctors(docs || [])

}

function costBar(india, usa){
const percent = (india / usa) * 100
return(
<div style={{marginBottom:"10px"}}>
<div style={{fontSize:"14px"}}>India vs USA</div>
<div style={{background:"#eee",height:"10px",borderRadius:"10px"}}>
<div style={{
width:`${percent}%`,
background:"linear-gradient(to right,#22c55e,#16a34a)",
height:"100%",
borderRadius:"10px"
}}/>
</div>
</div>
)
}

return(

<div style={{fontFamily:"Arial"}}>

{/* HERO */}

<section style={{
padding:"60px 20px",
textAlign:"center",
background:"linear-gradient(135deg,#1e3a8a,#2563eb)",
color:"#fff"
}}>

<h1 style={{fontSize:"34px"}}>
World-Class Treatment at Affordable Prices
</h1>

<p>Save up to 70% on Dental, Cardiac & Neuro procedures</p>

</section>


{/* DEPARTMENTS */}

<section style={{padding:"40px 20px"}}>

<h2 style={{textAlign:"center"}}>Our Specialities</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px",
marginTop:"20px"
}}>

{["Dental","Cardiac","Neuro"].map(dep=>(
<div key={dep} style={{
background:"#fff",
borderRadius:"12px",
padding:"20px",
boxShadow:"0 4px 12px rgba(0,0,0,0.08)"
}}>

<h3>{dep}</h3>
<p>Advanced treatments with expert doctors</p>

<button style={{
marginTop:"10px",
background:"#2563eb",
color:"#fff",
border:"none",
padding:"10px 15px",
borderRadius:"6px"
}}>
View More →
</button>

</div>
))}

</div>

</section>


{/* COST COMPARISON */}

<section style={{
padding:"40px 20px",
background:"#f9fafb"
}}>

<h2 style={{textAlign:"center"}}>Cost Comparison</h2>

<div style={{maxWidth:"600px",margin:"auto",marginTop:"20px"}}>

{procedures.slice(0,3).map(p=>(
<div key={p.id} style={{marginBottom:"20px"}}>

<b>{p.name}</b>

{costBar(p.price_india, p.price_us)}

<p style={{fontSize:"14px"}}>
India: ${p.price_india} | USA: ${p.price_us}
</p>

</div>
))}

</div>

</section>


{/* VIDEO TESTIMONIALS */}

<section style={{padding:"40px 20px",textAlign:"center"}}>

<h2>Patient Stories</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px",
marginTop:"20px"
}}>

{testimonials
.filter(t=>t.video_url) // only videos
.slice(0,3)
.map(t=>(
<div key={t.id}>

<iframe
width="100%"
height="180"
src={t.video_url}
title="testimonial"
style={{borderRadius:"10px"}}
/>

<p>{t.name}</p>

</div>
))}

</div>

</section>


{/* DOCTORS */}

<section style={{
padding:"40px 20px",
background:"#f9fafb"
}}>

<h2 style={{textAlign:"center"}}>Our Doctors</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px",
marginTop:"20px"
}}>

{doctors.slice(0,6).map(d=>(
<div key={d.id} style={{
background:"#fff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}}>

<h3>{d.name}</h3>
<p>{d.specialties?.name}</p>
<p>{d.experience_years} yrs experience</p>

</div>
))}

</div>

</section>


{/* CTA */}

<section style={{padding:"40px",textAlign:"center"}}>

<h2>Start Your Treatment Journey</h2>

<a href="https://wa.me/91XXXXXXXXXX">
<button style={{
marginTop:"15px",
padding:"14px 24px",
background:"#22c55e",
color:"#fff",
border:"none",
borderRadius:"8px"
}}>
Chat on WhatsApp
</button>
</a>

</section>

</div>

)
}
