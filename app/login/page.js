"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { USERS } from "../../lib/users"

export default function LoginPage(){

const router = useRouter()

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [error,setError] = useState("")


function login(){

const user = USERS.find(
u => u.username === username && u.password === password
)

if(!user){
setError("Invalid username or password")
return
}

localStorage.setItem("medpact_user", JSON.stringify(user))

router.push("/")
}


return(

<div style={{
height:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#f8fafc"
}}>

<div style={{
background:"#fff",
padding:"40px",
borderRadius:"10px",
border:"1px solid #e5e7eb",
width:"350px"
}}>

<h2 style={{marginBottom:"20px"}}>
Medpact CRM Login
</h2>

<input
placeholder="Username"
value={username}
onChange={(e)=>setUsername(e.target.value)}
style={{
width:"100%",
padding:"10px",
marginBottom:"10px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={{
width:"100%",
padding:"10px",
marginBottom:"10px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

{error && (
<p style={{color:"red",fontSize:"14px"}}>
{error}
</p>
)}

<button
onClick={login}
style={{
width:"100%",
padding:"10px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
marginTop:"10px"
}}
>
Login
</button>

</div>

</div>

)

}