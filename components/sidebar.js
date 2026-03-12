"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Sidebar(){

const pathname = usePathname()
const [user,setUser] = useState(null)

useEffect(()=>{

const storedUser = localStorage.getItem("medpact_user")

if(storedUser){
setUser(JSON.parse(storedUser))
}

},[])


function logout(){

const confirmLogout = confirm("Logout from Medpact CRM?")
if(!confirmLogout) return

localStorage.removeItem("medpact_user")
window.location.href="/login"

}


const menu=[
{label:"Dashboard",href:"/",icon:"📊"},
{label:"Doctors",href:"/doctors",icon:"👨‍⚕️"},
{label:"Hospitals",href:"/hospitals",icon:"🏥"},
{label:"Requirements",href:"/requirements",icon:"📋"},
{label:"Pipeline",href:"/shortlists",icon:"🎯"},
{label:"Placements",href:"/placements",icon:"✅"}
]

const masters=[
{label:"Cities",href:"/master/cities"},
{label:"Specialties",href:"/master/specialities"}
]

return(

<div style={{
width:"240px",
background:"#0f172a",
color:"#e2e8f0",
height:"100vh",
padding:"24px",
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
flexShrink:0
}}>

<div>

<h2 style={{
marginBottom:"10px",
fontWeight:"600"
}}>
Medpact CRM
</h2>

{user && (
<p style={{
fontSize:"12px",
marginBottom:"20px",
opacity:0.7
}}>
Logged in: {user.username}
</p>
)}

{/* MAIN MENU */}

<div style={{
display:"flex",
flexDirection:"column",
gap:"6px"
}}>

{menu.map(item=>{

const active = pathname === item.href

return(

<Link
key={item.href}
href={item.href}
style={{
padding:"10px 12px",
borderRadius:"6px",
background:active ? "#1e293b" : "transparent",
color:"#e2e8f0",
textDecoration:"none",
display:"flex",
alignItems:"center",
gap:"10px"
}}
>

<span>{item.icon}</span>
<span>{item.label}</span>

</Link>

)

})}

</div>


{/* MASTER DATA */}

<div style={{marginTop:"30px"}}>

<p style={{
fontSize:"12px",
opacity:0.6,
marginBottom:"10px"
}}>
MASTER DATA
</p>

<div style={{
display:"flex",
flexDirection:"column",
gap:"6px"
}}>

{masters.map(item=>{

const active = pathname === item.href

return(

<Link
key={item.href}
href={item.href}
style={{
padding:"8px 12px",
borderRadius:"6px",
background:active ? "#1e293b" : "transparent",
color:"#e2e8f0",
textDecoration:"none"
}}
>

{item.label}

</Link>

)

})}

</div>

</div>

</div>


{/* FOOTER */}

<div>

<button
onClick={logout}
style={{
width:"100%",
padding:"8px",
background:"#ef4444",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginBottom:"10px"
}}
>
Logout
</button>

<div style={{
fontSize:"12px",
opacity:0.5,
textAlign:"center"
}}>
Medpact Internal
</div>

</div>

</div>

)

}