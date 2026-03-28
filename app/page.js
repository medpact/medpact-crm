"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

import {
Chart as ChartJS,
ArcElement,
Tooltip,
Legend,
CategoryScale,
LinearScale,
BarElement
} from "chart.js"

import dynamic from "next/dynamic"

const Pie = dynamic(() => import("react-chartjs-2").then(m => m.Pie), { ssr:false })
const Bar = dynamic(() => import("react-chartjs-2").then(m => m.Bar), { ssr:false })

ChartJS.register(
ArcElement,
Tooltip,
Legend,
CategoryScale,
LinearScale,
BarElement
)

export default function Dashboard(){

const [mounted,setMounted] = useState(false)
const [stats,setStats] = useState({})
const [pipeline,setPipeline] = useState({})
const [sending,setSending] = useState(false)

const [currentUser,setCurrentUser] = useState("")

const [specialtyChart,setSpecialtyChart] = useState({
labels:[],
datasets:[]
})

const [hospitalChart,setHospitalChart] = useState({
labels:[],
datasets:[]
})

useEffect(()=>{

setMounted(true)
loadDashboard()

/* GET USER */
const userStr = localStorage.getItem("medpact_user")
if(userStr){
try{
const userObj = JSON.parse(userStr)
setCurrentUser(userObj.username?.trim().toLowerCase())
}catch{}
}

},[])


/* SEND REPORT */

async function sendReport(){

setSending(true)

try{

const res = await fetch("/api/send-report",{
method:"POST",
headers:{
"Content-Type":"application/json"
}
})
  console.log("Button clicked")

if(!res.ok){
alert("API not reachable")
setSending(false)
return
}

const data = await res.json()

if(data.success){
alert("Report sent successfully")
}else{
alert("Failed: " + data.error)
}

}catch(err){
alert("Error: " + err.message)
}

setSending(false)

}

/* DASHBOARD DATA */

async function loadDashboard(){

const [
doctors,
hospitals,
requirements,
shortlists,
placements
] = await Promise.all([

supabase.from("doctors").select("*",{count:"exact",head:true}),
supabase.from("hospitals").select("*",{count:"exact",head:true}),
supabase.from("requirements").select("*",{count:"exact",head:true}),
supabase.from("shortlists").select("status"),
supabase.from("placements").select("*",{count:"exact",head:true})

])


setStats({
doctors:doctors.count || 0,
hospitals:hospitals.count || 0,
requirements:requirements.count || 0,
shortlists:shortlists.data?.length || 0,
placements:placements.count || 0
})


let counts={
shortlisted:0,
interview:0,
offer:0,
placed:0
}

shortlists.data?.forEach(s=>{
if(s.status==="shortlisted") counts.shortlisted++
if(s.status==="interview_assigned") counts.interview++
if(s.status==="offer_released") counts.offer++
if(s.status==="placement_done") counts.placed++
})

setPipeline(counts)


/* SPECIALTY */

const {data:specs} = await supabase.from("specialties").select("id,name")
const {data:doctorCounts} = await supabase.from("doctors").select("specialty_id")
const {data:reqCounts} = await supabase.from("requirements").select("specialty_id")

let doctorMap={}, reqMap={}

doctorCounts?.forEach(d=>{
doctorMap[d.specialty_id]=(doctorMap[d.specialty_id]||0)+1
})

reqCounts?.forEach(r=>{
reqMap[r.specialty_id]=(reqMap[r.specialty_id]||0)+1
})

let labels=[], doctorData=[], reqData=[]

specs?.forEach(s=>{
labels.push(s.name)
doctorData.push(doctorMap[s.id]||0)
reqData.push(reqMap[s.id]||0)
})

setSpecialtyChart({
labels,
datasets:[
{label:"Doctors",data:doctorData,backgroundColor:"#2563eb"},
{label:"Requirements",data:reqData,backgroundColor:"#ef4444"}
]
})


/* HOSPITAL */

const {data:hosps} = await supabase.from("hospitals").select("id,hospital_name")
const {data:reqHosp} = await supabase.from("requirements").select("hospital_id")

let hospMap={}, hLabels=[], hData=[]

reqHosp?.forEach(r=>{
hospMap[r.hospital_id]=(hospMap[r.hospital_id]||0)+1
})

hosps?.forEach(h=>{
if(hospMap[h.id]){
hLabels.push(h.hospital_name)
hData.push(hospMap[h.id])
}
})

setHospitalChart({
labels:hLabels,
datasets:[{
label:"Open Requirements",
data:hData,
backgroundColor:"#8b5cf6"
}]
})

}


/* UI */

function card(title,value,color){

return(
<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"10px",
padding:"20px",
width:"220px"
}}>
<h4 style={{margin:0,color:"#64748b"}}>{title}</h4>
<h2 style={{marginTop:"10px",color}}>{value}</h2>
</div>
)

}


const pieData={
labels:["Shortlisted","Interview","Offer","Placed"],
datasets:[{
data:[
pipeline.shortlisted||0,
pipeline.interview||0,
pipeline.offer||0,
pipeline.placed||0
],
backgroundColor:["#f59e0b","#3b82f6","#8b5cf6","#22c55e"]
}]
}

const barData={
labels:["Doctors","Hospitals","Requirements","Placements"],
datasets:[{
label:"System Overview",
data:[
stats.doctors||0,
stats.hospitals||0,
stats.requirements||0,
stats.placements||0
],
backgroundColor:["#2563eb","#16a34a","#f59e0b","#22c55e"]
}]
}


return(

<div style={{color:"#0f172a"}}>

{/* HEADER */}

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"25px"
}}>

<h2>Dashboard</h2>

{currentUser === "nagireddy" && (
<button
onClick={sendReport}
style={{
padding:"8px 16px",
background:"#16a34a",
color:"#fff",
border:"none",
borderRadius:"6px"
}}
>
{sending ? "Sending..." : "Send Report"}
</button>
)}

</div>


{/* CARDS */}

<div style={{
display:"flex",
gap:"20px",
flexWrap:"wrap",
marginBottom:"40px"
}}>

{card("Doctors",stats.doctors,"#2563eb")}
{card("Hospitals",stats.hospitals,"#16a34a")}
{card("Requirements",stats.requirements,"#f59e0b")}
{card("Shortlisted",stats.shortlists,"#8b5cf6")}
{card("Placements",stats.placements,"#22c55e")}

</div>


{mounted && (

<>

<div style={{display:"flex",gap:"40px",flexWrap:"wrap",marginBottom:"40px"}}>

<div style={{background:"#fff",padding:"20px",borderRadius:"10px",border:"1px solid #e5e7eb",width:"420px"}}>
<h4>Recruitment Pipeline</h4>
<Pie data={pieData}/>
</div>

<div style={{background:"#fff",padding:"20px",borderRadius:"10px",border:"1px solid #e5e7eb",width:"520px"}}>
<h4>System Overview</h4>
<Bar data={barData}/>
</div>

</div>

<div style={{display:"flex",gap:"40px",flexWrap:"wrap"}}>

<div style={{background:"#fff",padding:"20px",borderRadius:"10px",border:"1px solid #e5e7eb",width:"520px"}}>
<h4>Demand vs Supply by Specialty</h4>
{specialtyChart.datasets?.length > 0 && <Bar data={specialtyChart}/>}
</div>

<div style={{background:"#fff",padding:"20px",borderRadius:"10px",border:"1px solid #e5e7eb",width:"520px"}}>
<h4>Top Hiring Hospitals</h4>
{hospitalChart.datasets?.length > 0 && <Bar data={hospitalChart}/>}
</div>

</div>

</>

)}

</div>

)

}
