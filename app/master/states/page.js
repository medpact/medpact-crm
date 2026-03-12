"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"

export default function States(){

const [states,setStates] = useState([])
const [name,setName] = useState("")

useEffect(()=>{
loadStates()
},[])

async function loadStates(){

const {data} = await supabase
.from("states")
.select("*")
.order("name")

setStates(data)

}

async function addState(){

if(!name){
alert("Enter state name")
return
}

await supabase
.from("states")
.insert({name:name})

setName("")
loadStates()

}

async function deleteState(id){

await supabase
.from("states")
.delete()
.eq("id",id)

loadStates()

}

return(

<div>

<h1>States</h1>

<input
placeholder="New State"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<button onClick={addState}>
Add
</button>

<table border="1" cellPadding="10">

<thead>
<tr>
<th>ID</th>
<th>Name</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{states?.map((state)=>(
<tr key={state.id}>

<td>{state.id}</td>
<td>{state.name}</td>

<td>

<button
onClick={()=>deleteState(state.id)}
>
Delete
</button>

</td>

</tr>
))}

</tbody>

</table>

</div>

)

}