"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function MedicalTourismPage(){

const [hero,setHero] = useState({})
const [procedures,setProcedures] = useState([])
const [testimonials,setTestimonials] = useState([])

useEffect(()=>{
loadData()
},[])

async function loadData(){

const {data:heroData} = await supabase.from("site_content").select("*")
let heroObj = {}
heroData?.forEach(i=> heroObj[i.key] = i.value)
setHero(heroObj)

const {data:proc} = await supabase.from("procedures").select("*")
setProcedures(proc || [])

const {data:testi} = await supabase.from("testimonials").select("*")
setTestimonials(testi || [])

}

return(

<div style={{fontFamily:"Arial, sans-serif"}}>

{/* HERO */}

<section style={{
padding:"60px 20px",
textAlign:"center",
background:"linear-gradient(to right,#f0f6ff,#ffffff)"
}}>

<h1 style={{
fontSize:"32px",
fontWeight:"700",
maxWidth:"700px",
margin:"auto"
}}>
{hero.hero_title || "Affordable World-Class Treatment in India"}
</h1>

<p style={{
marginTop:"10px",
color:"#555",
fontSize:"16px"
}}>
{hero.hero_subtitle || "Save up to 70% on Dental & Cardiac procedures"}
</p>

<div style={{marginTop:"20px"}}>

<a href="https://wa.me/91XXXXXXXXXX">
<button style={{
padding:"14px 24px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"8px",
fontSize:"16px"
}}>
Get Free Consultation
</button>
</a>

</div>

</section>


{/* TRUST */}

<section style={{
display:"flex",
justifyContent:"center",
gap:"20px",
flexWrap:"wrap",
padding:"20px"
}}>

<div>✔ Certified Hospitals</div>
<div>✔ Experienced Doctors</div>
<div>✔ International Patients</div>

</section>


{/* PROCEDURES */}

<section style={{padding:"40px 20px",textAlign:"center"}}>

<h2>Our Treatments</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px",
marginTop:"20px"
}}>

{procedures.map(p=>(
<div key={p.id} style={{
border:"1px solid #eee",
padding:"20px",
borderRadius:"12px",
background:"#fff"
}}>

<h3>{p.name}</h3>
<p style={{color:"#555"}}>{p.description}</p>

<p><b>India:</b> ${p.price_india}</p>
<p><b>USA:</b> ${p.price_us}</p>

</div>
))}

</div>

</section>


{/* TESTIMONIALS */}

<section style={{
padding:"40px 20px",
background:"#f9fafb",
textAlign:"center"
}}>

<h2>Patient Stories</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px",
marginTop:"20px"
}}>

{testimonials.map(t=>(
<div key={t.id} style={{
background:"#fff",
padding:"20px",
borderRadius:"12px",
border:"1px solid #eee"
}}>

<p>"{t.message}"</p>
<small>{t.name} ({t.country})</small>

</div>
))}

</div>

</section>


{/* CTA */}

<section style={{
padding:"40px",
textAlign:"center"
}}>

<h2>Start Your Treatment Journey</h2>

<a href="https://wa.me/91XXXXXXXXXX">
<button style={{
marginTop:"15px",
padding:"14px 24px",
background:"green",
color:"#fff",
border:"none",
borderRadius:"8px"
}}>
Chat on WhatsApp
</button>
</a>

</section>


{/* FLOAT BUTTON */}

<a
href="https://wa.me/91XXXXXXXXXX"
style={{
position:"fixed",
bottom:"20px",
right:"20px",
background:"#25d366",
color:"#fff",
padding:"14px",
borderRadius:"50px",
fontSize:"14px"
}}
>
Chat
</a>

</div>

)
}
