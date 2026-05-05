"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function MedicalTourismPage(){

const [hero,setHero] = useState({})
const [procedures,setProcedures] = useState([])
const [testimonials,setTestimonials] = useState([])
const [pricing,setPricing] = useState([])

useEffect(()=>{
loadData()
},[])

async function loadData(){

// HERO
const {data:heroData} = await supabase
.from("site_content")
.select("*")

let heroObj = {}
heroData?.forEach(i=>{
heroObj[i.key] = i.value
})
setHero(heroObj)

// PROCEDURES
const {data:proc} = await supabase
.from("procedures")
.select("*")
setProcedures(proc || [])

// TESTIMONIALS
const {data:testi} = await supabase
.from("testimonials")
.select("*")
setTestimonials(testi || [])

// PRICING
const {data:price} = await supabase
.from("pricing")
.select("*")
setPricing(price || [])

}

return(

<div style={{fontFamily:"Arial"}}>

{/* HERO */}

<div style={{padding:"60px",textAlign:"center",background:"#f0f6ff"}}>

<h1>{hero.hero_title || "Affordable Treatment in India"}</h1>
<p>{hero.hero_subtitle || "Save up to 70%"}</p>

<a href="https://wa.me/91XXXXXXXXXX">
<button style={{padding:"12px 20px",background:"#2563eb",color:"#fff",border:"none",borderRadius:"6px"}}>
Get Free Consultation
</button>
</a>

</div>


{/* PROCEDURES */}

<div style={{padding:"40px",textAlign:"center"}}>

<h2>Our Treatments</h2>

<div style={{display:"flex",gap:"20px",justifyContent:"center",flexWrap:"wrap"}}>

{procedures.map(p=>(
<div key={p.id} style={{border:"1px solid #eee",padding:"20px",width:"250px"}}>
<h3>{p.name}</h3>
<p>{p.description}</p>
<p><b>India:</b> ${p.price_india}</p>
<p><b>USA:</b> ${p.price_us}</p>
</div>
))}

</div>

</div>


{/* PRICING */}

<div style={{padding:"40px",background:"#fafafa",textAlign:"center"}}>

<h2>Cost Comparison</h2>

<table style={{margin:"auto",borderCollapse:"collapse"}} cellPadding="10">

<thead>
<tr>
<th>Treatment</th>
<th>USA</th>
<th>Europe</th>
<th>India</th>
</tr>
</thead>

<tbody>

{pricing.map(p=>(
<tr key={p.id}>
<td>{p.treatment}</td>
<td>{p.usa}</td>
<td>{p.europe}</td>
<td>{p.india}</td>
</tr>
))}

</tbody>

</table>

</div>


{/* TESTIMONIALS */}

<div style={{padding:"40px",textAlign:"center"}}>

<h2>Patient Stories</h2>

{testimonials.map(t=>(
<div key={t.id} style={{marginBottom:"15px"}}>
<p>"{t.message}"</p>
<small>{t.name} ({t.country})</small>
</div>
))}

</div>


{/* WHATSAPP */}

<a
href="https://wa.me/91XXXXXXXXXX"
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
