import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

/* CONVERT TO CSV */

function toCSV(data){

if(!data || data.length === 0) return ""

const headers = Object.keys(data[0])

const rows = data.map(row =>
headers.map(h => `"${row[h] ?? ""}"`).join(",")
)

return [headers.join(","), ...rows].join("\n")
}


export async function POST(){

try{

/* FETCH DATA */

const {data:doctors} = await supabase.from("doctors").select("*")
const {data:hospitals} = await supabase.from("hospitals").select("*")
const {data:requirements} = await supabase.from("requirements").select("*")


/* CREATE CSV */

const doctorCSV = toCSV(doctors)
const hospitalCSV = toCSV(hospitals)
const reqCSV = toCSV(requirements)

/* SEND EMAIL */

await resend.emails.send({
from: "Medpact <onboarding@resend.dev>",
to: ["medpact.guntur@gmail.com"],
subject: "Medpact CRM Report",
text: "Attached reports",
attachments: [
{
filename: "doctors.csv",
content: doctorCSV
},
{
filename: "hospitals.csv",
content: hospitalCSV
},
{
filename: "requirements.csv",
content: reqCSV
}
]
})

return NextResponse.json({ success: true })

}catch(err){

console.log("ERROR:", err)

return NextResponse.json({
success: false,
error: err.message
})

}

}
