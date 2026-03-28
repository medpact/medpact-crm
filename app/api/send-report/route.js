import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import XLSX from "xlsx"
import nodemailer from "nodemailer"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(){

try{

/* FETCH DATA */

const {data:doctors} = await supabase.from("doctors").select("*")
const {data:hospitals} = await supabase.from("hospitals").select("*")
const {data:requirements} = await supabase.from("requirements").select("*")

/* CREATE EXCEL */

const wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(doctors || []), "Doctors")
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hospitals || []), "Hospitals")
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(requirements || []), "Requirements")

const buffer = XLSX.write(wb, {type:"buffer", bookType:"xlsx"})

/* EMAIL */

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
}
})

await transporter.sendMail({
from: process.env.EMAIL_USER,
to: "nagireddyreddymalli@gmail.com",
subject: "Medpact CRM Report",
text: "Attached is your report",
attachments: [
{
filename: "report.xlsx",
content: buffer
}
]
})

return NextResponse.json({success:true})

}catch(err){
console.log(err)
return NextResponse.json({error:"Failed"})
}

}