"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "../../../../lib/supabase-browser"

const empty = { full_name:"", slug:"", title:"Dr.", specialty:"", sub_specialty:"", qualifications:"", experience_years:"", city:"", state:"", areas_of_expertise:"", languages:"", international_patient_experience:"", profile_summary:"", consultation_available:true, featured:false, verified:false, is_published:false, profile_photo:"" }

function toSlug(value){ return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") }
function csv(value){ return String(value||"").split(",").map(x=>x.trim()).filter(Boolean) }

export default function AdminDoctorsPage(){
  const [session,setSession]=useState(null); const [doctors,setDoctors]=useState([]); const [form,setForm]=useState(empty); const [editing,setEditing]=useState(null); const [photo,setPhoto]=useState(null); const [status,setStatus]=useState(""); const [loading,setLoading]=useState(true)
  const supabase=getSupabaseBrowserClient()

  async function load(){ setLoading(true); const {data}=await supabase.from("medical_doctors").select("*").order("created_at",{ascending:false}); setDoctors(data||[]); setLoading(false) }
  useEffect(()=>{ supabase.auth.getSession().then(({data})=>setSession(data.session)); load() },[])

  async function save(e){
    e.preventDefault(); setStatus("Saving…")
    try{
      if(!session) throw new Error("Please sign in to the Medpact backend first.")
      let profile_photo=form.profile_photo||null
      if(photo){ const ext=photo.name.split(".").pop(); const path=`${toSlug(form.full_name)}-${Date.now()}.${ext}`; const up=await supabase.storage.from("medical-doctors").upload(path,photo,{upsert:true}); if(up.error) throw up.error; profile_photo=supabase.storage.from("medical-doctors").getPublicUrl(path).data.publicUrl }
      const payload={...form,slug:form.slug||toSlug(form.full_name),experience_years:form.experience_years?Number(form.experience_years):null,qualifications:csv(form.qualifications),areas_of_expertise:csv(form.areas_of_expertise),languages:csv(form.languages),profile_photo,consultation_available:Boolean(form.consultation_available),featured:Boolean(form.featured),verified:Boolean(form.verified),is_published:Boolean(form.is_published)}
      const result=editing ? await supabase.from("medical_doctors").update(payload).eq("id",editing) : await supabase.from("medical_doctors").insert(payload)
      if(result.error) throw result.error
      setStatus("Saved successfully."); setForm(empty); setEditing(null); setPhoto(null); await load()
    }catch(err){setStatus(err.message||"Unable to save doctor.")}
  }
  function edit(d){setEditing(d.id);setForm({...empty,...d,qualifications:(d.qualifications||[]).join(", "),areas_of_expertise:(d.areas_of_expertise||[]).join(", "),languages:(d.languages||[]).join(", ")});window.scrollTo({top:0,behavior:"smooth"})}
  async function remove(id){ if(!confirm("Delete this doctor profile?")) return; const {error}=await supabase.from("medical_doctors").delete().eq("id",id); if(error)setStatus(error.message); else load() }
  if(!session) return <main style={styles.page}><h1>Medpact Doctor Admin</h1><p>Sign in with the Medpact Supabase account that has access to the doctor directory.</p><button onClick={()=>supabase.auth.signInWithPassword({email:prompt("Email"),password:prompt("Password")})}>Sign in</button></main>
  return <main style={styles.page}><div style={styles.header}><div><small>MEDPACT CARE · INTERNAL</small><h1>Doctor Directory</h1><p>Add, verify and publish specialist profiles.</p></div><button onClick={()=>supabase.auth.signOut()}>Sign out</button></div>
    <form onSubmit={save} style={styles.form}><div style={styles.formHeader}><div><b>{editing?"Edit doctor":"Add doctor"}</b><span>{status}</span></div></div><div style={styles.grid}>{[
      ["full_name","Full name *"],["slug","Profile slug (optional)"],["title","Title"],["specialty","Specialty *"],["sub_specialty","Sub-specialty"],["experience_years","Experience (years)"],["city","City"],["state","State"]
    ].map(([key,label])=><label key={key}>{label}<input value={form[key]??""} onChange={e=>setForm({...form,[key]:e.target.value})} required={label.includes("*")}/></label>)}
    <label>Qualifications (comma separated)<input value={form.qualifications} onChange={e=>setForm({...form,qualifications:e.target.value})}/></label><label>Languages (comma separated)<input value={form.languages} onChange={e=>setForm({...form,languages:e.target.value})}/></label><label>Areas of expertise (comma separated)<input value={form.areas_of_expertise} onChange={e=>setForm({...form,areas_of_expertise:e.target.value})}/></label><label>Doctor image<input type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></label>
    <label className="wide">Profile summary<textarea value={form.profile_summary} onChange={e=>setForm({...form,profile_summary:e.target.value})}/></label><label className="wide">International patient experience<textarea value={form.international_patient_experience} onChange={e=>setForm({...form,international_patient_experience:e.target.value})}/></label></div><div style={styles.checks}><label><input type="checkbox" checked={form.consultation_available} onChange={e=>setForm({...form,consultation_available:e.target.checked})}/> Consultation available</label><label><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured</label><label><input type="checkbox" checked={form.verified} onChange={e=>setForm({...form,verified:e.target.checked})}/> Verified</label><label><input type="checkbox" checked={form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})}/> Publish publicly</label></div><button style={styles.save}>{editing?"Update doctor":"Save doctor"}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm(empty)}} style={styles.cancel}>Cancel</button>}</form>
    <section><h2>Existing profiles <small>{doctors.length}</small></h2>{loading?<p>Loading…</p>:<div style={styles.list}>{doctors.map(d=><div style={styles.item} key={d.id}><div><b>{d.title} {d.full_name}</b><span>{d.specialty} · {d.city||"India"} · {d.is_published?"Published":"Draft"}</span></div><div><button onClick={()=>edit(d)}>Edit</button><button onClick={()=>remove(d.id)}>Delete</button></div></div>)}</div>}</section>
  </main>
}
const styles={page:{maxWidth:1100,margin:"0 auto",padding:"45px 20px",fontFamily:"Arial,sans-serif",color:"#12201d",background:"#f6f8f5",minHeight:"100vh"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:30},form:{background:"white",border:"1px solid #dfe7e3",borderRadius:20,padding:25,marginBottom:45},formHeader:{display:"flex",justifyContent:"space-between",marginBottom:20},grid:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16},checks:{display:"flex",gap:20,flexWrap:"wrap",margin:"22px 0"},list:{display:"grid",gap:10},item:{background:"white",border:"1px solid #dfe7e3",borderRadius:14,padding:16,display:"flex",justifyContent:"space-between",gap:20},save:{background:"#12201d",color:"white",border:0,borderRadius:10,padding:"13px 18px"},cancel:{marginLeft:8,padding:"12px 18px"}}
