"use client"

import { useCallback, useEffect, useState } from "react"

const OUTCOMES = [
  ["answered","Answered"],["busy","Busy"],["no_answer","No answer / did not pick up"],
  ["call_back","Call back later"],["not_connected","Not connected"],["out_of_service","Out of service"],
  ["no_current_requirement","No current requirement"],["interested","Interested"],
  ["requirement_identified","Requirement identified"],["not_interested","Not interested"],["other","Other"]
]
const STATUSES = [
  ["","All statuses"],["not_contacted","Not contacted"],["interested","Interested"],
  ["requirement_identified","Requirement identified"],["follow_up","Follow-up"],
  ["no_current_requirement","No current requirement"],["not_interested","Not interested"],["invalid_number","Invalid number"]
]
const H0={hospital_name:"",city:"",state:"",area:"",address:"",phone:"",alternate_phone:"",hospital_type:"",general_remarks:""}
const C0={outcome:"answered",contact_person:"",contact_designation:"",contact_phone:"",remarks:"",follow_up_date:"",doctor_specialty:"",doctor_qualification:"",doctors_required:"",experience_required:"",salary_offered:"",job_location:""}
const input={width:"100%",boxSizing:"border-box",padding:"10px",border:"1px solid #cbd5e1",borderRadius:8,background:"white",color:"#0f172a"}
const button={padding:"10px 14px",border:0,borderRadius:8,background:"#1d4ed8",color:"white",fontWeight:700,cursor:"pointer"}
const secondary={padding:"9px 12px",border:"1px solid #cbd5e1",borderRadius:8,background:"white",color:"#334155",fontWeight:650,cursor:"pointer"}
const panel={background:"white",border:"1px solid #e2e8f0",borderRadius:14,padding:16,marginBottom:16}
function Field({label,children}) { return <label style={{display:"block",fontSize:13,fontWeight:650,color:"#475569"}}><span style={{display:"block",marginBottom:6}}>{label}</span>{children}</label> }
function Text({value,onChange,type="text",required=false,placeholder=""}) { return <input style={input} value={value??""} onChange={onChange} type={type} required={required} placeholder={placeholder}/> }
function Drop({value,onChange,options}) { return <select style={input} value={value} onChange={onChange}>{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select> }
function outcomeLabel(v) { return OUTCOMES.find(x=>x[0]===v)?.[1]||v||"—" }
function statusLabel(v) { return STATUSES.find(x=>x[0]===v)?.[1]||v||"—" }

export default function HospitalOutreachPage() {
  const [stats,setStats]=useState({totalHospitals:0,callsToday:0,interested:0,requirementsIdentified:0,followUpsDue:0})
  const [hospitals,setHospitals]=useState([])
  const [search,setSearch]=useState("")
  const [status,setStatus]=useState("")
  const [selected,setSelected]=useState(null)
  const [calls,setCalls]=useState([])
  const [showHospital,setShowHospital]=useState(false)
  const [showCall,setShowCall]=useState(false)
  const [hf,setHf]=useState(H0)
  const [cf,setCf]=useState(C0)
  const [daily,setDaily]=useState([])
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState("")
  const [notice,setNotice]=useState("")

  const api=useCallback(async(url,options={})=>{
    const res=await fetch(url,{...options,credentials:"same-origin",headers:{"Content-Type":"application/json",...(options.headers||{})}})
    const data=await res.json().catch(()=>({}))
    if(res.status===401) throw new Error("Session not connected. Sign out and sign in again after completing LOGIN-INTEGRATION.md.")
    if(!res.ok||data.success===false) throw new Error(data.error||"Request failed")
    return data
  },[])
  const load=useCallback(async()=>{
    setError("")
    try {
      const [s,h,d]=await Promise.all([
        api("/api/outreach/stats"),
        api(`/api/outreach/hospitals?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`),
        api(`/api/outreach/calls?date=${encodeURIComponent(date)}`)
      ])
      setStats(s.stats);setHospitals(h.hospitals||[]);setDaily(d.calls||[])
    } catch(e){setError(e.message)}
  },[api,search,status,date])
  useEffect(()=>{load()},[load])

  async function addHospital(e) {
    e.preventDefault();setBusy(true);setError("");setNotice("")
    try { const r=await api("/api/outreach/hospitals",{method:"POST",body:JSON.stringify(hf)});setHf(H0);setShowHospital(false);setNotice("Hospital saved.");await load();await openHospital(r.hospital) }
    catch(e){setError(e.message)} finally{setBusy(false)}
  }
  async function openHospital(h) {
    setError("");setSelected(h);setShowCall(false)
    try {const r=await api(`/api/outreach/hospitals/${h.id}`);setSelected(r.hospital);setCalls(r.calls||[])}
    catch(e){setError(e.message);setCalls([])}
  }
  async function addCall(e) {
    e.preventDefault();if(!selected)return
    setBusy(true);setError("");setNotice("")
    try {await api("/api/outreach/calls",{method:"POST",body:JSON.stringify({...cf,hospital_id:selected.id})});setNotice("Call saved; previous call history retained.");setCf(C0);setShowCall(false);await openHospital(selected);await load()}
    catch(e){setError(e.message)}finally{setBusy(false)}
  }
  function csvExport() {
    const rows=[["Date","Hospital","City","State","Employee","Outcome","Contact","Phone","Remarks","Follow-up"],...daily.map(c=>[c.call_date,c.outreach_hospitals?.hospital_name,c.outreach_hospitals?.city,c.outreach_hospitals?.state,c.employee_username,outcomeLabel(c.outcome),c.contact_person,c.contact_phone,c.remarks,c.follow_up_date])]
    const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n")
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`medpact-calling-report-${date}.csv`;a.click();URL.revokeObjectURL(url)
  }
  const statItems=[["Hospitals entered",stats.totalHospitals,"#2563eb"],["Calls today",stats.callsToday,"#7c3aed"],["Interested",stats.interested,"#15803d"],["Requirements identified",stats.requirementsIdentified,"#b45309"],["Follow-ups due",stats.followUpsDue,"#be123c"]]
  const grid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}
  return <main style={{maxWidth:1450,margin:"0 auto",padding:"22px 16px 48px",color:"#0f172a"}}>
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:20}}>
      <div><h1 style={{margin:"0 0 5px",fontSize:28}}>Hospital Calling Tracker</h1><p style={{margin:0,color:"#64748b"}}>Record hospital contacts, call outcomes, vacancies and follow-ups.</p></div>
      <button style={button} onClick={()=>setShowHospital(v=>!v)}>{showHospital?"Close form":"+ Add Hospital"}</button>
    </header>
    {error&&<div role="alert" style={{padding:12,background:"#fef2f2",color:"#991b1b",borderRadius:8,marginBottom:12}}>{error}</div>}
    {notice&&<div style={{padding:12,background:"#f0fdf4",color:"#166534",borderRadius:8,marginBottom:12}}>{notice}</div>}
    <div style={{...grid,marginBottom:16}}>{statItems.map(([label,value,color])=><div key={label} style={panel}><div style={{fontSize:13,color:"#64748b"}}>{label}</div><div style={{fontSize:30,fontWeight:800,color,marginTop:6}}>{value}</div></div>)}</div>
    {showHospital&&<form onSubmit={addHospital} style={panel}><h2 style={{marginTop:0}}>Add hospital</h2><div style={grid}>
      <Field label="Hospital name *"><Text required value={hf.hospital_name} onChange={e=>setHf({...hf,hospital_name:e.target.value})}/></Field>
      <Field label="City *"><Text required value={hf.city} onChange={e=>setHf({...hf,city:e.target.value})}/></Field>
      <Field label="State"><Text value={hf.state} onChange={e=>setHf({...hf,state:e.target.value})}/></Field>
      <Field label="Area"><Text value={hf.area} onChange={e=>setHf({...hf,area:e.target.value})}/></Field>
      <Field label="Phone"><Text value={hf.phone} onChange={e=>setHf({...hf,phone:e.target.value})}/></Field>
      <Field label="Alternate phone"><Text value={hf.alternate_phone} onChange={e=>setHf({...hf,alternate_phone:e.target.value})}/></Field>
      <Field label="Type / focus"><Text placeholder="Multispeciality, ENT..." value={hf.hospital_type} onChange={e=>setHf({...hf,hospital_type:e.target.value})}/></Field>
      <Field label="Address"><Text value={hf.address} onChange={e=>setHf({...hf,address:e.target.value})}/></Field>
      <Field label="General remarks"><Text value={hf.general_remarks} onChange={e=>setHf({...hf,general_remarks:e.target.value})}/></Field>
    </div><div style={{display:"flex",gap:8,marginTop:14}}><button style={button} disabled={busy}>{busy?"Saving...":"Save hospital"}</button><button type="button" style={secondary} onClick={()=>setShowHospital(false)}>Cancel</button></div></form>}
    <section style={panel}><div style={{display:"flex",gap:12,alignItems:"end",flexWrap:"wrap",marginBottom:12}}>
      <div style={{flex:"1 1 250px"}}><Field label="Search hospital, city or phone"><Text value={search} onChange={e=>setSearch(e.target.value)} placeholder="Type to search..."/></Field></div>
      <div style={{flex:"0 1 240px"}}><Field label="Current status"><Drop value={status} onChange={e=>setStatus(e.target.value)} options={STATUSES}/></Field></div>
      <button style={secondary} onClick={load}>Refresh</button>
    </div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}><thead><tr>{["Hospital","City / State","Phone","Type","Status","Action"].map(t=><th key={t} style={{textAlign:"left",padding:10,borderBottom:"1px solid #e2e8f0",color:"#64748b",fontSize:12}}>{t}</th>)}</tr></thead><tbody>
      {hospitals.map(h=><tr key={h.id}><td style={{padding:10,borderBottom:"1px solid #f1f5f9",fontWeight:700}}>{h.hospital_name}<div style={{fontSize:12,color:"#64748b",fontWeight:400}}>{h.area||""}</div></td><td style={{padding:10,borderBottom:"1px solid #f1f5f9"}}>{h.city}{h.state?`, ${h.state}`:""}</td><td style={{padding:10,borderBottom:"1px solid #f1f5f9"}}>{h.phone||"—"}</td><td style={{padding:10,borderBottom:"1px solid #f1f5f9"}}>{h.hospital_type||"—"}</td><td style={{padding:10,borderBottom:"1px solid #f1f5f9"}}>{statusLabel(h.current_status)}</td><td style={{padding:10,borderBottom:"1px solid #f1f5f9"}}><button style={secondary} onClick={()=>openHospital(h)}>Open / Call</button></td></tr>)}
      {!hospitals.length&&<tr><td colSpan={6} style={{padding:24,textAlign:"center",color:"#64748b"}}>No hospitals found. Add the first hospital to begin.</td></tr>}
    </tbody></table></div></section>
    {selected&&<section style={panel}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 6px"}}>{selected.hospital_name}</h2><div style={{color:"#64748b"}}>{[selected.area,selected.city,selected.state].filter(Boolean).join(" · ")}</div><div>{selected.phone||"No phone"}{selected.alternate_phone?` · Alt: ${selected.alternate_phone}`:""}</div><p style={{margin:"6px 0",fontSize:13}}>{selected.address||""}</p></div><div style={{display:"flex",gap:8,alignItems:"start"}}><button style={button} onClick={()=>setShowCall(v=>!v)}>{showCall?"Close call form":"+ Record Call"}</button><button style={secondary} onClick={()=>{setSelected(null);setCalls([])}}>Close</button></div></div>
      {showCall&&<form onSubmit={addCall} style={{padding:14,marginTop:14,background:"#f8fafc",borderRadius:10}}><h3 style={{marginTop:0}}>Record call outcome</h3><div style={grid}>
        <Field label="Outcome *"><Drop value={cf.outcome} onChange={e=>setCf({...cf,outcome:e.target.value})} options={OUTCOMES}/></Field>
        <Field label="Contact person"><Text value={cf.contact_person} onChange={e=>setCf({...cf,contact_person:e.target.value})}/></Field>
        <Field label="Designation"><Text value={cf.contact_designation} onChange={e=>setCf({...cf,contact_designation:e.target.value})}/></Field>
        <Field label="Contact phone"><Text value={cf.contact_phone} onChange={e=>setCf({...cf,contact_phone:e.target.value})}/></Field>
        <Field label="Follow-up date"><Text type="date" value={cf.follow_up_date} onChange={e=>setCf({...cf,follow_up_date:e.target.value})}/></Field>
        <Field label="Doctor specialty"><Text placeholder="Cardiology, Radiology..." value={cf.doctor_specialty} onChange={e=>setCf({...cf,doctor_specialty:e.target.value})}/></Field>
        <Field label="Qualification"><Text placeholder="MBBS, MD, DM..." value={cf.doctor_qualification} onChange={e=>setCf({...cf,doctor_qualification:e.target.value})}/></Field>
        <Field label="Doctors required"><Text type="number" value={cf.doctors_required} onChange={e=>setCf({...cf,doctors_required:e.target.value})}/></Field>
        <Field label="Experience required"><Text value={cf.experience_required} onChange={e=>setCf({...cf,experience_required:e.target.value})}/></Field>
        <Field label="Salary offered (₹ / month)"><Text type="number" value={cf.salary_offered} onChange={e=>setCf({...cf,salary_offered:e.target.value})}/></Field>
        <Field label="Job location"><Text value={cf.job_location} onChange={e=>setCf({...cf,job_location:e.target.value})}/></Field>
      </div><div style={{marginTop:12}}><Field label="Remarks"><textarea style={{...input,minHeight:90}} value={cf.remarks} onChange={e=>setCf({...cf,remarks:e.target.value})} placeholder="What did the hospital say?"/></Field></div><button style={{...button,marginTop:12}} disabled={busy}>{busy?"Saving...":"Save call record"}</button></form>}
      <h3>Call history ({calls.length})</h3>{!calls.length?<p style={{color:"#64748b"}}>No calls recorded yet.</p>:<div style={{display:"grid",gap:10}}>{calls.map(c=><div key={c.id} style={{border:"1px solid #e2e8f0",borderRadius:10,padding:12}}><div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}><strong>{outcomeLabel(c.outcome)}</strong><span style={{color:"#64748b",fontSize:12}}>{new Date(c.call_date).toLocaleString()}</span></div><div style={{fontSize:13,color:"#475569",marginTop:5}}>By {c.employee_username}{c.contact_person?` · ${c.contact_person}`:""}{c.contact_phone?` · ${c.contact_phone}`:""}</div>{c.remarks&&<p style={{whiteSpace:"pre-wrap"}}>{c.remarks}</p>}{(c.doctor_specialty||c.doctor_qualification||c.doctors_required!=null)&&<p style={{color:"#166534",fontSize:13}}>Requirement: {[c.doctor_specialty,c.doctor_qualification,c.doctors_required!=null?`${c.doctors_required} doctor(s)`:null].filter(Boolean).join(" · ")}</p>}{c.follow_up_date&&<p style={{color:"#b45309",fontSize:13}}>Follow-up: {c.follow_up_date}</p>}</div>)}</div>}
    </section>}
    <section style={panel}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",alignItems:"end"}}><div><h2 style={{margin:"0 0 4px"}}>Daily calling report</h2><p style={{margin:0,color:"#64748b",fontSize:13}}>Review and export calls for a selected date.</p></div><div style={{width:190}}><Field label="Report date"><Text type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field></div><button style={secondary} onClick={csvExport}>Export CSV</button></div><div style={{margin:"12px 0",color:"#475569"}}>Calls: <strong>{daily.length}</strong> · Requirements identified: <strong>{daily.filter(c=>c.outcome==="requirement_identified").length}</strong></div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}><thead><tr>{["Time","Hospital","City","Outcome","Employee","Remarks"].map(t=><th key={t} style={{textAlign:"left",padding:9,borderBottom:"1px solid #e2e8f0",fontSize:12,color:"#64748b"}}>{t}</th>)}</tr></thead><tbody>{daily.map(c=><tr key={c.id}><td style={{padding:9,borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{new Date(c.call_date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</td><td style={{padding:9,borderBottom:"1px solid #f1f5f9"}}>{c.outreach_hospitals?.hospital_name||"—"}</td><td style={{padding:9,borderBottom:"1px solid #f1f5f9"}}>{c.outreach_hospitals?.city||"—"}</td><td style={{padding:9,borderBottom:"1px solid #f1f5f9"}}>{outcomeLabel(c.outcome)}</td><td style={{padding:9,borderBottom:"1px solid #f1f5f9"}}>{c.employee_username}</td><td style={{padding:9,borderBottom:"1px solid #f1f5f9"}}>{c.remarks||"—"}</td></tr>)}{!daily.length&&<tr><td colSpan={6} style={{padding:20,textAlign:"center",color:"#64748b"}}>No calls recorded for this date.</td></tr>}</tbody></table></div></section>
  </main>
}
