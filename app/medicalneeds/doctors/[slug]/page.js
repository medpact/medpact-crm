"use client"

import React from "react"
import Link from "next/link"
import { Newsreader, Public_Sans } from "next/font/google"
import { procedures } from "../../../../data/procedures"

const displayFont = Newsreader({ subsets: ["latin"], variable: "--font-display" })
const bodyFont = Public_Sans({ subsets: ["latin"], variable: "--font-body" })

export default function DoctorProfilePage({ params }) {
  return <DoctorProfile slug={params.slug} />
}

function DoctorProfile({ slug }) {
  const [state, setState] = React.useState({ loading: true, doctor: null, error: "" })

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { getSupabaseBrowserClient } = await import("../../../../lib/supabase-browser")
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("medical_doctors").select("*").eq("slug", slug).eq("is_published", true).maybeSingle()
        if (error) throw error
        if (active) setState({ loading: false, doctor: data, error: "" })
      } catch (err) {
        if (active) setState({ loading: false, doctor: null, error: err.message || "Unable to load this profile." })
      }
    })()
    return () => { active = false }
  }, [slug])

  if (state.loading) return <main className="loading"><style jsx global>{profileStyles}</style><div className="spinner"/></main>
  if (!state.doctor) return <main className={`${displayFont.variable} ${bodyFont.variable} page`}><style jsx global>{profileStyles}</style><header className="nav"><Link href="/medicalneeds" className="brand"><span className="brandMark">M</span><span>Medpact <b>Care</b></span></Link></header><section className="notFound"><div>404</div><h1>Profile not found.</h1><p>This specialist profile may not yet be published or the link may be incorrect.</p><Link href="/medicalneeds/doctors" className="primary">Back to doctors</Link></section></main>

  const d = state.doctor
  const expertise = d.areas_of_expertise || []
  const languages = d.languages || []
  const linkedProcedures = procedures.filter((p) => (d.procedure_ids || []).includes(p.id))

  return <main className={`${displayFont.variable} ${bodyFont.variable} page`}><style jsx global>{profileStyles}</style>
    <header className="nav"><Link href="/medicalneeds" className="brand"><span className="brandMark">M</span><span>Medpact <b>Care</b></span></Link><nav><Link href="/medicalneeds">Medical Needs</Link><Link href="/medicalneeds/doctors">Doctors</Link><Link href="/medicalneeds#cost-guide">Cost Guide</Link></nav><Link href="/medicalneeds#review" className="navCta">Medical Review ↗</Link></header>
    <div className="crumb"><Link href="/medicalneeds/doctors">← Doctors directory</Link></div>
    <section className="profileHero"><div className="portrait">{d.profile_photo ? <img src={d.profile_photo} alt={d.full_name}/> : <span>{(d.full_name || "Doctor").split(" ").slice(0,2).map((x)=>x[0]).join("")}</span>}</div><div className="heroInfo"><div className="eyebrow">{d.specialty || "SPECIALIST"}{d.verified ? " · VERIFIED PROFILE" : ""}</div><h1>{d.title ? `${d.title} ` : ""}{d.full_name}</h1>{d.sub_specialty && <h2>{d.sub_specialty}</h2>}<div className="facts"><span>⌁ {d.experience_years || "—"} years experience</span><span>⌖ {d.city || "India"}{d.state ? `, ${d.state}` : ""}</span></div>{d.verified && <div className="verified">✓ Profile verified by Medpact</div>}</div><div className="action"><Link href="/medicalneeds#review" className="primary">Request a medical review ↗</Link><small>Availability is subject to confirmation.</small></div></section>
    <section className="content"><div className="main"><Block title="About the specialist"><p>{d.profile_summary || "A detailed professional profile will be published here after the Medpact team completes verification."}</p></Block><Block title="Areas of expertise">{expertise.length ? <div className="chips">{expertise.map((x)=><span key={x}>{x}</span>)}</div> : <p>Expertise details will be added by the Medpact team.</p>}</Block>{linkedProcedures.length > 0 && <Block title="Related treatments"><div className="treatments">{linkedProcedures.map((p)=><Link href={`/medicalneeds#treatment-${p.slug}`} key={p.id}><b>{p.name}</b><span>{p.specialty}</span><i>→</i></Link>)}</div></Block>}{d.international_patient_experience && <Block title="International patient experience"><p>{d.international_patient_experience}</p></Block>}</div><aside><div className="sideCard"><div className="eyebrow">PROFESSIONAL DETAILS</div><Row label="Qualifications" value={(d.qualifications || []).join(", ") || "—"}/><Row label="Location" value={[d.city,d.state].filter(Boolean).join(", ") || "India"}/><Row label="Languages" value={languages.join(", ") || "—"}/><Row label="Consultation" value={d.consultation_available ? "Available on request" : "Subject to confirmation"}/></div><div className="sideCard note"><b>Medical review</b><p>Medpact helps patients understand care options and coordinate with appropriate specialists. A profile listing does not constitute a diagnosis or treatment recommendation.</p></div></aside></section>
  </main>
}

function Block({ title, children }) { return <section className="block"><h2>{title}</h2>{children}</section> }
function Row({ label, value }) { return <div className="row"><span>{label}</span><b>{value}</b></div> }

const profileStyles = `:root{--ink:#12201d;--muted:#687571;--line:#dfe7e3;--paper:#f6f8f5;--accent:#0e7569;--soft:#e8f2ee}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-body),Arial,sans-serif}.nav{height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,72px);border-bottom:1px solid var(--line);background:#f6f8f5f2;position:sticky;top:0;z-index:5;backdrop-filter:blur(16px)}.brand{display:flex;gap:10px;align-items:center;color:var(--ink);font-weight:700;text-decoration:none;letter-spacing:-.03em}.brand b{font-weight:400;color:var(--accent)}.brandMark{width:34px;height:34px;border-radius:11px;background:var(--ink);color:#fff;display:grid;place-items:center;font-family:var(--font-display);font-size:21px}.nav nav{display:flex;gap:28px}.nav nav a{font-size:13px;color:#586560;text-decoration:none}.navCta,.primary{background:var(--ink);color:#fff;text-decoration:none;padding:13px 17px;border-radius:12px;font-size:13px;font-weight:700}.crumb{max-width:1200px;margin:0 auto;padding:30px 25px 10px}.crumb a{color:#64716d;text-decoration:none;font-size:13px}.profileHero{max-width:1200px;margin:0 auto;padding:25px 25px 60px;display:grid;grid-template-columns:260px 1fr auto;gap:40px;align-items:center}.portrait{height:300px;border-radius:30px;background:linear-gradient(145deg,#e3ede8,#f9faf8);overflow:hidden;display:grid;place-items:center}.portrait img{width:100%;height:100%;object-fit:cover}.portrait span{font-family:var(--font-display);font-size:80px;color:#8ba59e}.eyebrow{font-size:10px;letter-spacing:.16em;color:var(--accent);font-weight:800}.heroInfo h1{font-family:var(--font-display);font-weight:400;font-size:clamp(48px,6vw,76px);line-height:.94;letter-spacing:-.045em;margin:14px 0 10px}.heroInfo h2{font-size:18px;font-weight:500;color:#64716d;margin:0}.facts{display:flex;gap:18px;flex-wrap:wrap;color:#66736f;font-size:12px;margin:22px 0}.verified{display:inline-block;color:var(--accent);background:var(--soft);padding:8px 11px;border-radius:999px;font-size:10px;font-weight:800}.action{display:flex;flex-direction:column;align-items:flex-end;gap:10px}.action small{color:#7b8581;font-size:10px}.content{max-width:1200px;margin:0 auto;padding:0 25px 90px;display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:45px}.block{padding:32px 0;border-top:1px solid var(--line)}.block:first-child{padding-top:0;border-top:0}.block h2{font-family:var(--font-display);font-size:32px;font-weight:400;margin:0 0 17px}.block p{color:#5f6d68;line-height:1.75;font-size:15px;max-width:750px}.chips{display:flex;gap:8px;flex-wrap:wrap}.chips span{background:var(--soft);color:#3e625a;padding:9px 11px;border-radius:9px;font-size:11px}.treatments{display:grid;gap:8px}.treatments a{display:grid;grid-template-columns:1fr auto;gap:3px 20px;padding:17px;border:1px solid var(--line);border-radius:13px;background:white;color:var(--ink);text-decoration:none}.treatments span{font-size:11px;color:#74807c}.treatments i{grid-row:1/3;grid-column:2;align-self:center;color:var(--accent);font-style:normal}.sideCard{background:#fff;border:1px solid var(--line);border-radius:20px;padding:23px;margin-bottom:15px}.row{display:grid;gap:5px;padding:14px 0;border-bottom:1px solid #edf1ef}.row:last-child{border-bottom:0}.row span{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#84908c}.row b{font-size:12px;line-height:1.5}.note{background:#e5eee9;border:0}.note p{font-size:12px;line-height:1.6;color:#5e6e68}.loading{min-height:100vh;display:grid;place-items:center;background:var(--paper)}.spinner{width:34px;height:34px;border:3px solid #dce6e2;border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.notFound{max-width:700px;margin:100px auto;padding:30px;text-align:center}.notFound>div{font-size:11px;letter-spacing:.2em;color:var(--accent)}.notFound h1{font-family:var(--font-display);font-weight:400;font-size:60px}.notFound p{color:var(--muted);margin-bottom:28px}@media(max-width:900px){.nav nav{display:none}.profileHero{grid-template-columns:180px 1fr}.portrait{height:220px}.action{grid-column:1/-1;align-items:flex-start}.content{grid-template-columns:1fr}}@media(max-width:620px){.nav{height:68px}.navCta{font-size:11px;padding:10px 12px}.crumb{padding-top:20px}.profileHero{grid-template-columns:1fr;padding-top:15px}.portrait{height:330px}.heroInfo h1{font-size:52px}.content{padding:0 20px 60px}.profileHero{padding-left:20px;padding-right:20px}}
`
