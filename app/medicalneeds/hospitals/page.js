"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Newsreader, Public_Sans } from "next/font/google"
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser"

const displayFont = Newsreader({ subsets: ["latin"], variable: "--font-display" })
const bodyFont = Public_Sans({ subsets: ["latin"], variable: "--font-body" })

function normalise(row) {
  return { ...row, hospitalType: row.hospital_type || "", keySpecialties: row.key_specialties || [], keyProcedures: row.key_procedures || [], internationalPatientServices: row.international_patient_services || "", featured: !!row.featured, verified: !!row.verified }
}

export default function HospitalsDirectoryPage() {
  const [hospitals, setHospitals] = useState([])
  const [query, setQuery] = useState("")
  const [city, setCity] = useState("All cities")
  const [type, setType] = useState("All hospital types")
  const [sort, setSort] = useState("featured")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error: dbError } = await supabase.from("medical_hospitals").select("*").eq("is_published", true).order("featured", { ascending: false }).order("name", { ascending: true })
        if (dbError) throw dbError
        if (active) setHospitals((data || []).map(normalise))
      } catch (err) { if (active) setError(err.message || "Unable to load the hospital directory.") }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [])

  const cities = useMemo(() => ["All cities", ...Array.from(new Set(hospitals.map(h => h.city).filter(Boolean))).sort()], [hospitals])
  const types = useMemo(() => ["All hospital types", ...Array.from(new Set(hospitals.map(h => h.hospitalType).filter(Boolean))).sort()], [hospitals])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = hospitals.filter(h => {
      if (city !== "All cities" && h.city !== city) return false
      if (type !== "All hospital types" && h.hospitalType !== type) return false
      if (!q) return true
      return [h.name, h.city, h.state, h.hospitalType, h.address, ...(h.accreditations || []), ...(h.keySpecialties || []), ...(h.keyProcedures || [])].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    })
    return [...result].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : Number(b.featured) - Number(a.featured) || Number(b.verified) - Number(a.verified) || a.name.localeCompare(b.name))
  }, [hospitals, query, city, type, sort])

  return <main className={`${displayFont.variable} ${bodyFont.variable} page`}><style jsx global>{styles}</style>
    <header className="nav"><Link href="/medicalneeds" className="brand"><span className="brandMark">M</span><span>Medpact <b>Care</b></span></Link><nav><Link href="/medicalneeds">Medical Needs</Link><Link href="/medicalneeds/doctors">Doctors</Link><a href="#directory">Hospitals</a><Link href="/medicalneeds#cost-guide">Cost Guide</Link></nav><Link href="/medicalneeds#review" className="navCta">Medical Review <span>↗</span></Link></header>
    <section className="hero"><div className="eyebrow">HOSPITAL DIRECTORY</div><h1>Find a hospital that fits your <em>care journey.</em></h1><p>Explore published hospital profiles by city, specialty, procedures and international-patient services. Hospital information is added and verified by the Medpact team.</p><div className="searchBox"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search hospital, city, specialty or procedure…" /></div></section>
    <section className="directory" id="directory"><div className="toolbar"><div className="filters"><select value={city} onChange={e => setCity(e.target.value)}>{cities.map(x => <option key={x}>{x}</option>)}</select><select value={type} onChange={e => setType(e.target.value)}>{types.map(x => <option key={x}>{x}</option>)}</select></div><select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Recommended</option><option value="name">Name A–Z</option></select></div>
      {loading && <div className="state"><div className="spinner"/><h2>Loading hospital directory…</h2></div>}
      {!loading && error && <div className="state"><div className="stateIcon">!</div><h2>Directory temporarily unavailable</h2><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button></div>}
      {!loading && !error && hospitals.length === 0 && <div className="state empty"><div className="orb">✦</div><div className="eyebrow">VERIFIED DIRECTORY</div><h2>Our hospital directory is being curated.</h2><p>Hospital profiles will appear here as your Medpact team verifies and publishes them from the internal dashboard. No placeholder hospitals are shown.</p><Link href="/medicalneeds#review" className="primary">Ask Medpact for hospital options <span>↗</span></Link></div>}
      {!loading && !error && hospitals.length > 0 && filtered.length === 0 && <div className="state"><h2>No matching hospitals</h2><p>Try another city, hospital type, specialty or procedure.</p><button onClick={() => { setQuery(""); setCity("All cities"); setType("All hospital types") }}>Clear filters</button></div>}
      {!loading && !error && filtered.length > 0 && <div className="hospitalGrid">{filtered.map(h => <article className="hospitalCard" key={h.id}><div className="photo"><div className="photoPattern">+</div>{h.images?.[0] && <img src={h.images[0]} alt={h.name}/>} {h.verified && <span className="verified">✓ Verified</span>}</div><div className="body"><div className="top"><span>{h.hospitalType || "Hospital"}</span>{h.featured && <b>Featured</b>}</div><h2>{h.name}</h2><p className="location">⌖ {h.city || "India"}{h.state ? `, ${h.state}` : ""}</p>{h.description && <p className="summary">{h.description}</p>}<div className="chips">{(h.accreditations || []).slice(0,3).map(x => <span key={x}>{x}</span>)}</div><Link href={`/medicalneeds/hospitals/${h.slug}`} className="view">View hospital <span>→</span></Link></div></article>)}</div>}
    </section>
    <section className="bottomCta"><div><span className="eyebrow">NEED HELP CHOOSING?</span><h2>Let Medpact shortlist hospitals for your treatment.</h2></div><Link href="/medicalneeds#review" className="primary">Start a medical review <span>↗</span></Link></section>
    <footer><Link href="/medicalneeds" className="brand"><span className="brandMark">M</span><span>Medpact <b>Care</b></span></Link><span>Medical information for care navigation. Not a substitute for medical advice.</span></footer>
  </main>
}

const styles = `:root{--ink:#12201d;--muted:#6b7773;--line:#dfe7e3;--paper:#f6f8f5;--card:#fff;--accent:#0e7569;--soft:#e8f2ee}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-body),Arial,sans-serif}.nav{height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,72px);border-bottom:1px solid var(--line);background:rgba(246,248,245,.92);position:sticky;top:0;z-index:20;backdrop-filter:blur(16px)}.brand{display:flex;gap:10px;align-items:center;color:var(--ink);font-weight:700;text-decoration:none;letter-spacing:-.03em}.brand b{font-weight:400;color:var(--accent)}.brandMark{width:34px;height:34px;border-radius:11px;background:var(--ink);color:white;display:grid;place-items:center;font-family:var(--font-display);font-size:21px}.nav nav{display:flex;gap:30px}.nav nav a{color:#53615d;text-decoration:none;font-size:13px}.navCta,.primary{background:var(--ink);color:white;text-decoration:none;padding:13px 17px;border-radius:13px;font-size:13px;font-weight:700}.hero{padding:86px clamp(20px,7vw,100px) 55px;max-width:1250px;margin:auto}.eyebrow{font-size:11px;letter-spacing:.17em;font-weight:800;color:var(--accent);margin-bottom:18px}.hero h1{font-family:var(--font-display);font-size:clamp(46px,7vw,84px);font-weight:400;line-height:.92;letter-spacing:-.045em;max-width:850px;margin:0}.hero h1 em{color:var(--accent);font-style:italic}.hero>p{font-size:17px;line-height:1.65;color:var(--muted);max-width:720px;margin:28px 0 35px}.searchBox{height:64px;max-width:780px;border:1px solid #cfdad5;background:white;border-radius:18px;display:flex;align-items:center;padding:0 18px;box-shadow:0 15px 50px rgba(18,32,29,.06)}.searchBox>span{font-size:25px;color:var(--accent)}.searchBox input{border:0;outline:0;flex:1;font:inherit;font-size:15px;padding:0 13px;background:transparent}.directory{max-width:1250px;margin:auto;padding:15px clamp(20px,5vw,72px) 90px}.toolbar{display:flex;gap:20px;align-items:center;justify-content:space-between;margin-bottom:28px}.filters{display:flex;gap:10px;overflow:auto}.toolbar select{border:1px solid var(--line);background:#fff;border-radius:11px;padding:11px 13px;color:#3f4d49;font:inherit;font-size:12px}.hospitalGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.hospitalCard{background:#fff;border:1px solid var(--line);border-radius:22px;overflow:hidden;display:grid;grid-template-columns:180px 1fr;min-height:285px}.photo{position:relative;background:linear-gradient(145deg,#dcebe5,#f6f8f5);overflow:hidden}.photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.photoPattern{position:absolute;inset:0;display:grid;place-items:center;font-size:80px;font-weight:200;color:#91aca4}.verified{position:absolute;left:12px;bottom:12px;background:#e8f2ee;color:#0e7569;border-radius:999px;padding:7px 9px;font-size:9px;font-weight:800}.body{padding:24px}.top{display:flex;justify-content:space-between;gap:10px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#74807c}.top b{color:var(--accent)}.body h2{font-family:var(--font-display);font-weight:400;font-size:32px;line-height:1.02;margin:12px 0 8px}.location{font-size:12px;color:#65736e}.summary{font-size:12px;color:#6c7975;line-height:1.55}.chips{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}.chips span{background:var(--soft);color:#45645d;padding:7px 9px;border-radius:8px;font-size:9px}.view{display:flex;justify-content:space-between;color:var(--ink);text-decoration:none;border-top:1px solid var(--line);padding-top:15px;margin-top:15px;font-size:12px;font-weight:700}.view span{color:var(--accent);font-size:17px}.state{min-height:360px;background:#fff;border:1px solid var(--line);border-radius:24px;display:grid;place-items:center;text-align:center;padding:50px}.state h2{font-family:var(--font-display);font-weight:400;font-size:38px;margin:8px 0}.state p{max-width:560px;color:var(--muted);line-height:1.65}.state button{border:0;background:var(--ink);color:#fff;border-radius:10px;padding:12px 17px}.empty{display:block;padding-top:65px}.orb{width:62px;height:62px;border-radius:20px;background:var(--soft);color:var(--accent);display:grid;place-items:center;margin:0 auto 25px;font-size:26px}.empty .primary{display:inline-block;margin-top:18px}.spinner{width:34px;height:34px;border:3px solid #dce6e2;border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.bottomCta{max-width:1250px;margin:0 auto 80px;padding:45px clamp(20px,5vw,72px);border-radius:28px;background:#e3eee9;display:flex;align-items:center;justify-content:space-between;gap:30px}.bottomCta h2{font-family:var(--font-display);font-weight:400;font-size:38px;line-height:1.05;margin:0;max-width:650px}footer{border-top:1px solid var(--line);padding:25px clamp(20px,5vw,72px);display:flex;justify-content:space-between;gap:20px;align-items:center;color:#7b8581;font-size:10px}footer .brand{color:var(--ink);font-size:14px}@media(max-width:900px){.nav nav{display:none}.hospitalGrid{grid-template-columns:1fr}.bottomCta{margin-left:20px;margin-right:20px;flex-direction:column;align-items:flex-start}}@media(max-width:620px){.nav{height:68px}.navCta{font-size:11px;padding:10px 12px}.hero{padding-top:55px}.toolbar{align-items:stretch;flex-direction:column}.hospitalCard{grid-template-columns:1fr}.photo{height:210px}.body h2{font-size:29px}.bottomCta h2{font-size:32px}footer{flex-direction:column;align-items:flex-start}}`
