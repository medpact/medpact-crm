import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"
import { Resend } from "resend"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(){

try{

/* FETCH DATA */

const {data:doctors} = await supabase.from("doctors").select("*")
const {data:hospitals} = await supabase.from("hospitals").select("*")
const {data:requirements} = await supabase.from("requirements").select("*")


/* CREATE EXCEL */

const wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(
wb,
XLSX.utils.json_to_sheet(doctors || []),
"Doctors"
)

XLSX.utils.book_append_sheet(
wb,
XLSX.utils.json_to_sheet(hospitals || []),
"Hospitals"
)

XLSX.utils.book_append_sheet(
wb,
XLSX.utils.json_to_sheet(requirements || []),
"Requirements"
)

const buffer = XLSX.write(wb, {
type: "buffer",
bookType: "xlsx"
})


/* SEND EMAIL */

await resend.emails.send({
from: "Medpact <onboarding@resend.dev>",
to: ["medpact.guntur@gmail.com"],
subject: "Medpact CRM Report",
text: "Attached is your latest CRM report",
attachments: [
{
filename: "medpact-report.xlsx",
content: buffer
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
