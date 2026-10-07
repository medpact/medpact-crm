"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Newsreader, Public_Sans } from "next/font/google"
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser"

const displayFont = Newsreader({ subsets: ["latin"], variable: "--font-display" })
const bodyFont = Public_Sans({ subsets: ["latin"], variable: "--font-body" })

function money(value, currency = "INR") {
  if (value === null || value === undefined || value === "") return "—"
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value))
}

export default function TreatmentsDirectoryPage() {
  const supabase = getSupabaseBrowserClient()
  const [treatments, setTreatments] = useState([])
  const [query, setQuery] = useState("")
  const [specialty, setSpecialty] = useState("All specialties")
  const [category, setCategory] = useState("All categories")
  const [sort, setSort] = useState("featured")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data, error: dbError } = await supabase.from("medical_treatments").select("*").eq("is_published", true).order("featured", { ascending: false }).order("name", { ascending: true })
        if (dbError) throw dbError
        if (active) setTreatments(data || [])
      } catch (err) {
        if (active) setError(err.message || "Unable to load the treatment directory.")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const specialties = useMemo(() => ["All specialties", ...Array.from(new Set(treatments.map(t => t.specialty).filter(Boolean))).sort()], [treatments])
  const categories = useMemo(() => ["All categories", ...Array.from(new Set(treatments.map(t => t.category).filter(Boolean))).sort()], [treatments])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return treatments.filter(t => {
      if (specialty !== "All specialties" && t.specialty !== specialty) return false
      if (category !== "All categories" && t.category !== category) return false
      if (!q) return true
      return [t.name, t.specialty, t.category, t.description, t.procedure_overview, ...(t.included_items || []), ...(t.exclusions || [])].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    }).sort((a,b) => sort === "name" ? a.name.localeCompare(b.name) : Number(b.featured)-Number(a.featured) || Number(b.verified)-Number(a.verified) || a.name.localeCompare(b.name))
  }, [treatments, query, specialty, category, sort])

  return <main className={`${displayFont.variable} ${bodyFont.variable} page`}><style jsx global>{styles}</style>
    <header className="nav"><Link href="/medicalneeds" className="brand"><span className="brandMark">M</span><span>Medpact <b>Care</b></span></Link><nav><Link href="/medicalneeds">Medical Needs</Link><Link href="/medicalneeds/doctors">Doctors</Link><Link href="/medicalneeds/hospitals">Hospitals</Link><a href="#directory">Treatments</a></nav><Link href="/medicalneeds#review" className="navCta">Medical Review <span>↗</span></Link></header>
    <section className="hero"><div className="eyebrow">TREATMENT & COST GUIDE</div><h1>Understand the treatment before you <em>choose care.</em></h1><p>Explore procedures, typical hospital stays, indicative India costs and verified hospital-wise cost information where available.</p><div className="searchBox"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search treatment, specialty or procedure…" /></div></section>
    <section className="directory" id="directory"><div className="toolbar"><div className="filters"><select value={specialty} onChange={e => setSpecialty(e.target.value)}>{specialties.map(x => <option key={x}>{x}</option>)}</select><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(x => <option key={x}>{x}</option>)}</select></div><select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Recommended</option><option value="name">Name A–Z</option></select></div>
      {loading && <div className="state"><div className="spinner"/><h2>Loading treatment directory…</h2></div>}
      {!loading && error && <div className="state"><div className="stateIcon">!</div><h2>Directory temporarily unavailable</h2><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button></div>}
      {!loading && !error && treatments.length === 0 && <div className="state empty"><div className="orb">✦</div><div className="eyebrow">VERIFIED DIRECTORY</div><h2>Our treatment directory is being curated.</h2><p>Treatment profiles will appear here as your Medpact team verifies and publishes them. No placeholder treatment records are shown.</p><Link href="/medicalneeds#review" className="primary">Ask Medpact about a treatment <span>↗</span></Link></div>}
      {!loading && !error && treatments.length > 0 && filtered.length === 0 && <div className="state"><h2>No matching treatments</h2><p>Try another specialty, category or search term.</p><button onClick={() => {setQuery("");setSpecialty("All specialties");setCategory("All categories")}}>Clear filters</button></div>}
      {!loading && !error && filtered.length > 0 && <div className="grid">{filtered.map(t => <article className="card" key={t.id}><div className="cardTop"><span>{t.category || "Treatment"}</span>{t.verified && <b>✓ Verified</b>}</div><h2>{t.name}</h2><p className="specialty">{t.specialty || "Specialty information pending"}</p><p className="summary">{t.description || "Treatment information is being curated by the Medpact team."}</p><div className="metrics"><div><small>Indicative India cost</small><strong>{t.india_cost_min != null && t.india_cost_max != null ? `${money(t.india_cost_min)} – ${money(t.india_cost_max)}` : "On request"}</strong></div><div><small>Typical stay</small><strong>{t.typical_stay || "Varies"}</strong></div></div><Link href={`/medicalneeds/treatments/${t.slug}`} className="view">View treatment <span>→</span></Link></article>)}</div>}
    </section>
    <section className="bottomCta"><div><span className="eyebrow">NEED A PERSONAL ESTIMATE?</span><h2>Let Medpact compare treatment options for your case.</h2></div><Link href="/medicalneeds#review" className="primary">Start a medical review <span>↗</span></Link></section>
    <footer><Link href="/medicalneeds" className="brand"><span className="brandMark">M</span><span>Medpact <b>Care</b></span></Link><span>Costs are indicative unless specifically verified with a hospital. Medical information is not medical advice.</span></footer>
  </main>
}

const styles = `:root{--ink:#12201d;--muted:#687571;--line:#dfe7e3;--paper:#f6f8f5;--accent:#0e7569;--soft:#e8f2ee}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-body),Arial,sans-serif}.nav{height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,72px);border-bottom:1px solid var(--line);background:rgba(246,248,245,.92);position:sticky;top:0;z-index:20;backdrop-filter:blur(16px)}.brand{display:flex;gap:10px;align-items:center;color:var(--ink);font-weight:700;text-decoration:none;letter-spacing:-.03em}.brand b{font-weight:400;color:var(--accent)}.brandMark{width:34px;height:34px;border-radius:11px;background:var(--ink);color:white;display:grid;place-items:center;font-family:var(--font-display);font-size:21px}.nav nav{display:flex;gap:30px}.nav nav a{color:#53615d;text-decoration:none;font-size:13px}.navCta,.primary{background:var(--ink);color:white;text-decoration:none;padding:13px 17px;border-radius:13px;font-size:13px;font-weight:700}.hero{padding:86px clamp(20px,7vw,100px) 55px;max-width:1250px;margin:auto}.eyebrow{font-size:11px;letter-spacing:.17em;font-weight:800;color:var(--accent);margin-bottom:18px}.hero h1{font-family:var(--font-display);font-size:clamp(46px,7vw,84px);font-weight:400;line-height:.92;letter-spacing:-.045em;max-width:850px;margin:0}.hero h1 em{color:var(--accent);font-style:italic}.hero>p{font-size:17px;line-height:1.65;color:var(--muted);max-width:720px;margin:28px 0 35px}.searchBox{height:64px;max-width:780px;border:1px solid #cfdad5;background:white;border-radius:18px;display:flex;align-items:center;padding:0 18px;box-shadow:0 15px 50px rgba(18,32,29,.06)}.searchBox>span{font-size:25px;color:var(--accent)}.searchBox input{border:0;outline:0;flex:1;font:inherit;font-size:15px;padding:0 13px;background:transparent}.directory{max-width:1250px;margin:auto;padding:15px clamp(20px,5vw,72px) 90px}.toolbar{display:flex;gap:20px;align-items:center;justify-content:space-between;margin-bottom:28px}.filters{display:flex;gap:10px;overflow:auto}.toolbar select{border:1px solid var(--line);background:#fff;border-radius:11px;padding:11px 13px;color:#3f4d49;font:inherit;font-size:12px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:25px;min-height:315px}.cardTop{display:flex;justify-content:space-between;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#74807c}.cardTop b{color:var(--accent)}.card h2{font-family:var(--font-display);font-weight:400;font-size:34px;line-height:1.02;margin:16px 0 6px}.specialty{font-size:12px;color:var(--accent);font-weight:700}.summary{font-size:13px;color:#687571;line-height:1.6;min-height:62px}.metrics{display:grid;grid-template-columns:1.4fr .8fr;gap:10px;margin:20px 0}.metrics>div{background:var(--soft);border-radius:12px;padding:12px}.metrics small,.metrics strong{display:block}.metrics small{font-size:9px;color:#73817c;text-transform:uppercase;letter-spacing:.06em}.metrics strong{font-size:12px;margin-top:5px}.view{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:15px;color:var(--ink);text-decoration:none;font-size:12px;font-weight:700}.view span{color:var(--accent);font-size:17px}.state{min-height:360px;background:#fff;border:1px solid var(--line);border-radius:24px;display:grid;place-items:center;text-align:center;padding:50px}.state h2{font-family:var(--font-display);font-weight:400;font-size:38px;margin:8px 0}.state p{max-width:560px;color:var(--muted);line-height:1.65}.state button{border:0;background:var(--ink);color:#fff;border-radius:10px;padding:12px 17px}.empty{display:block;padding-top:65px}.orb{width:62px;height:62px;border-radius:20px;background:var(--soft);color:var(--accent);display:grid;place-items:center;margin:0 auto 25px;font-size:26px}.empty .primary{display:inline-block;margin-top:18px}.spinner{width:34px;height:34px;border:3px solid #dce6e2;border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.bottomCta{max-width:1250px;margin:0 auto 80px;padding:45px clamp(20px,5vw,72px);border-radius:28px;background:#e3eee9;display:flex;align-items:center;justify-content:space-between;gap:30px}.bottomCta h2{font-family:var(--font-display);font-weight:400;font-size:38px;line-height:1.05;margin:0;max-width:650px}footer{border-top:1px solid var(--line);padding:25px clamp(20px,5vw,72px);display:flex;justify-content:space-between;gap:20px;align-items:center;color:#7b8581;font-size:10px}footer .brand{color:var(--ink);font-size:14px}@media(max-width:900px){.nav nav{display:none}.grid{grid-template-columns:1fr}.bottomCta{margin-left:20px;margin-right:20px;flex-direction:column;align-items:flex-start}}@media(max-width:620px){.nav{height:68px}.navCta{font-size:11px;padding:10px 12px}.hero{padding-top:55px}.toolbar{align-items:stretch;flex-direction:column}.card h2{font-size:29px}.metrics{grid-template-columns:1fr}.bottomCta h2{font-size:32px}footer{flex-direction:column;align-items:flex-start}}`
