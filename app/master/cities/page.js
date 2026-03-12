"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"

export default function Cities(){

const [cities,setCities] = useState([])
const [states,setStates] = useState([])
const [name,setName] = useState("")
const [state,setState] = useState("")
const [loading,setLoading] = useState(false)

useEffect(()=>{
loadCities()
loadStates()
},[])


/* Load Cities with State Name */

async function loadCities(){

const {data,error} = await supabase
.from("cities")
.select(`
id,
name,
states(name)
`)
.order("name",{ascending:true})

if(error){
console.log(error)
return
}

setCities(data || [])

}


/* Load States */

async function loadStates(){

const {data,error} = await supabase
.from("states")
.select("*")
.order("name")

if(error){
console.log(error)
return
}

setStates(data || [])

}


/* Format City Name */

function formatCity(value){

return value
.trim()
.toLowerCase()
.replace(/\b\w/g,l=>l.toUpperCase())

}


/* Add City */

async function addCity(){

const cityName = formatCity(name)

if(!cityName){

alert("City name cannot be empty")
return

}

if(!state){

alert("Please select state")
return

}

setLoading(true)

/* Check duplicate */

const {data:existing} = await supabase
.from("cities")
.select("id")
.eq("name",cityName)
.eq("state_id",state)

if(existing && existing.length > 0){

alert("This city already exists in the selected state")
setLoading(false)
return

}


/* Insert */

const {error} = await supabase
.from("cities")
.insert({
name:cityName,
state_id:state
})

setLoading(false)

if(error){

alert("Error adding city")
console.log(error)
return

}

setName("")
loadCities()

}


/* Delete City */

async function deleteCity(id){

const confirmDelete = confirm("Are you sure you want to delete this city?")

if(!confirmDelete) return

const {error} = await supabase
.from("cities")
.delete()
.eq("id",id)

if(error){

alert("Cannot delete city")
console.log(error)
return

}

loadCities()

}


return(

<div style={{color:"#0f172a"}}>

<h2 style={{marginBottom:"20px"}}>Cities</h2>


{/* Add City Card */}

<div style={{
background:"#ffffff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"20px",
marginBottom:"20px",
maxWidth:"650px"
}}>

<div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>

<select
value={state}
onChange={(e)=>setState(e.target.value)}
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px",
minWidth:"180px"
}}
>

<option value="">Select State</option>

{states.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>


<input
placeholder="Enter city name"
value={name}
onChange={(e)=>setName(e.target.value)}
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px",
minWidth:"200px"
}}
/>


<button
onClick={addCity}
disabled={loading}
style={{
padding:"8px 16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>

Add City

</button>

</div>

</div>


{/* Cities Table */}

<div style={{
background:"#fff",
border:"1px solid #e5e7eb",
borderRadius:"8px",
overflow:"hidden"
}}>

<table width="100%" cellPadding="12">

<thead style={{background:"#f8fafc"}}>

<tr>

<th align="left">City</th>
<th align="left">State</th>
<th align="left">Action</th>

</tr>

</thead>

<tbody>

{cities.map(city=>(

<tr key={city.id} style={{borderTop:"1px solid #e5e7eb"}}>

<td>{city.name}</td>

<td>{city.states?.name}</td>

<td>

<button
onClick={()=>deleteCity(city.id)}
style={{
background:"#ef4444",
color:"#fff",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
cursor:"pointer"
}}
>

Delete

</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}