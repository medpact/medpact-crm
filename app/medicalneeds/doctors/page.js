"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Newsreader, Public_Sans } from "next/font/google"
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser"

const displayFont = Newsreader({ subsets: ["latin"], variable: "--font-display" })
const bodyFont = Public_Sans({ subsets: ["latin"], variable: "--font-body" })

const specialties = ["All specialties", "Cardiology", "Cardiothoracic Surgery", "Orthopaedics", "Neurosurgery", "Oncology", "Dentistry", "Ophthalmology", "Gastroenterology", "Urology", "Nephrology"]

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

function normaliseDoctor(row) {
  return {
    ...row,
    fullName: row.full_name || row.fullName || "",
    subSpecialty: row.sub_specialty || row.subSpecialty || "",
    experienceYears: row.experience_years ?? row.experienceYears ?? 0,
    hospitalName: row.hospital_name || row.hospitalName || "",
    profilePhoto: row.profile_photo || row.profilePhoto || "",
    profileSummary: row.profile_summary || row.profileSummary || "",
    areasOfExpertise: row.areas_of_expertise || row.areasOfExpertise || [],
    languages: row.languages || [],
    featured: row.featured || false,
    verified: row.verified || false,
  }
}

export default function DoctorsDirectoryPage() {
  const [doctors, setDoctors] = useState([])
  const [query, setQuery] = useState("")
  const [specialty, setSpecialty] = useState("All specialties")
  const [sort, setSort] = useState("featured")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function loadDoctors() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error: dbError } = await supabase
          .from("medical_doctors")
          .select("*")
          .eq("is_published", true)
          .order("featured", { ascending: false })
          .order("full_name", { ascending: true })

        if (dbError) throw dbError
        if (active) setDoctors((data || []).map(normaliseDoctor))
      } catch (err) {
        if (active) setError(err.message || "Unable to load the doctor directory.")
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDoctors()
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = doctors.filter((doctor) => {
      const matchesSpecialty = specialty === "All specialties" || doctor.specialty === specialty
      if (!matchesSpecialty) return false
      if (!q) return true
      return [doctor.fullName, doctor.specialty, doctor.subSpecialty, doctor.city, doctor.state, doctor.hospitalName, ...(doctor.areasOfExpertise || [])]
        .filter(Boolean).some((value) => String(value).toLowerCase().includes(q))
    })
    return [...result].sort((a, b) => {
      if (sort === "experience") return Number(b.experienceYears || 0) - Number(a.experienceYears || 0)
      if (sort === "name") return a.fullName.localeCompare(b.fullName)
      return Number(b.featured) - Number(a.featured) || Number(b.verified) - Number(a.verified) || Number(b.experienceYears || 0) - Number(a.experienceYears || 0)
    })
  }, [doctors, query, specialty, sort])

  return <main className={`${displayFont.variable} ${bodyFont.variable} page`}>
    <style jsx global>{styles}</style>
    <header className="nav">
      <Link href="/medicalneeds" className="brand"><span className="brandMark">M</span><span>Medpact <b>Care</b></span></Link>
      <nav><Link href="/medicalneeds">Medical Needs</Link><a href="#directory">Doctors</a><Link href="/medicalneeds#cost-guide">Cost Guide</Link></nav>
      <Link href="/medicalneeds#review" className="navCta">Medical Review <span>↗</span></Link>
    </header>

    <section className="hero">
      <div className="eyebrow">SPECIALIST DIRECTORY</div>
      <h1>Find the right <em>specialist</em> for your care journey.</h1>
      <p>Explore verified doctor profiles by specialty, expertise and location. Doctor profiles are published only after they are reviewed by the Medpact team.</p>
      <div className="searchBox"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search doctor, specialty, procedure or city…" /><kbd>⌘ K</kbd></div>
    </section>

    <section className="directory" id="directory">
      <div className="toolbar">
        <div className="filters">{specialties.map((item) => <button key={item} className={specialty === item ? "active" : ""} onClick={() => setSpecialty(item)}>{item}</button>)}</div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Recommended</option><option value="experience">Most experienced</option><option value="name">Name A–Z</option></select>
      </div>

      {loading && <div className="state"><div className="spinner"/><h2>Loading specialist directory…</h2></div>}
      {!loading && error && <div className="state"><div className="stateIcon">!</div><h2>Directory temporarily unavailable</h2><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button></div>}
      {!loading && !error && doctors.length === 0 && <div className="state empty"><div className="orb">✦</div><div className="eyebrow">VERIFIED DIRECTORY</div><h2>Our specialist directory is being curated.</h2><p>Doctor profiles will appear here as your Medpact team verifies and publishes them from the internal dashboard. No placeholder doctors are shown.</p><Link href="/medicalneeds#review" className="primary">Request a specialist <span>↗</span></Link></div>}
      {!loading && !error && doctors.length > 0 && filtered.length === 0 && <div className="state"><h2>No matching specialists</h2><p>Try another specialty, doctor name, city or area of expertise.</p><button onClick={() => { setQuery(""); setSpecialty("All specialties") }}>Clear filters</button></div>}

      {!loading && !error && filtered.length > 0 && <div className="doctorGrid">{filtered.map((doctor) => <article className="doctorCard" key={doctor.id}>
        <div className="photoWrap">{doctor.profilePhoto ? <img src={doctor.profilePhoto} alt={doctor.fullName} /> : <div className="initials">{initials(doctor.fullName)}</div>}{doctor.verified && <span className="verified">✓ Verified</span>}</div>
        <div className="cardBody"><div className="cardTop"><span>{doctor.specialty}</span>{doctor.featured && <b>Featured</b>}</div><h2>{doctor.title ? `${doctor.title} ` : ""}{doctor.fullName}</h2><p className="sub">{doctor.subSpecialty || "Specialist"}</p><div className="meta"><span>⌁ {doctor.experienceYears || "—"} yrs experience</span><span>⌖ {doctor.city || "India"}{doctor.state ? `, ${doctor.state}` : ""}</span></div>{doctor.profileSummary && <p className="summary">{doctor.profileSummary}</p>}<div className="chips">{(doctor.areasOfExpertise || []).slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><Link href={`/medicalneeds/doctors/${doctor.slug}`} className="view">View profile <span>→</span></Link></div>
      </article>)}</div>}
    </section>

    <section className="bottomCta"><div><span className="eyebrow">CAN'T FIND WHAT YOU NEED?</span><h2>Let Medpact find the right specialist for you.</h2></div><Link href="/medicalneeds#review" className="primary">Start a medical review <span>↗</span></Link></section>
    <footer><Link href="/medicalneeds" className="brand"><span className="brandMark">M</span><span>Medpact <b>Care</b></span></Link><span>Medical information for care navigation. Not a substitute for medical advice.</span></footer>
  </main>
}

const styles = `
:root{--ink:#12201d;--muted:#6b7773;--line:#dfe7e3;--paper:#f6f8f5;--card:#fff;--accent:#0e7569;--soft:#e8f2ee}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-body),Arial,sans-serif}.page{min-height:100vh}.nav{height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,72px);border-bottom:1px solid var(--line);background:rgba(246,248,245,.92);position:sticky;top:0;z-index:20;backdrop-filter:blur(16px)}.brand{display:flex;gap:10px;align-items:center;color:var(--ink);font-weight:700;text-decoration:none;letter-spacing:-.03em}.brand b{font-weight:400;color:var(--accent)}.brandMark{width:34px;height:34px;border-radius:11px;background:var(--ink);color:white;display:grid;place-items:center;font-family:var(--font-display);font-size:21px}.nav nav{display:flex;gap:30px}.nav nav a{color:#53615d;text-decoration:none;font-size:13px}.navCta,.primary{background:var(--ink);color:white;text-decoration:none;padding:13px 17px;border-radius:13px;font-size:13px;font-weight:700}.hero{padding:86px clamp(20px,7vw,100px) 55px;max-width:1250px;margin:auto}.eyebrow{font-size:11px;letter-spacing:.17em;font-weight:800;color:var(--accent);margin-bottom:18px}.hero h1{font-family:var(--font-display);font-size:clamp(46px,7vw,86px);font-weight:400;line-height:.92;letter-spacing:-.045em;max-width:850px;margin:0}.hero h1 em{color:var(--accent);font-style:italic}.hero>p{font-size:17px;line-height:1.65;color:var(--muted);max-width:690px;margin:28px 0 35px}.searchBox{height:64px;max-width:780px;border:1px solid #cfdad5;background:white;border-radius:18px;display:flex;align-items:center;padding:0 18px;box-shadow:0 15px 50px rgba(18,32,29,.06)}.searchBox>span{font-size:25px;color:var(--accent)}.searchBox input{border:0;outline:0;flex:1;font:inherit;font-size:15px;padding:0 13px;background:transparent}.searchBox kbd{border:1px solid var(--line);border-radius:7px;padding:5px 8px;color:#89938f;font-size:10px}.directory{max-width:1250px;margin:auto;padding:15px clamp(20px,5vw,72px) 90px}.toolbar{display:flex;gap:20px;align-items:center;justify-content:space-between;margin-bottom:28px}.filters{display:flex;gap:8px;overflow:auto;padding-bottom:4px}.filters button,.state button{border:1px solid var(--line);background:white;color:#5b6965;border-radius:999px;padding:10px 14px;white-space:nowrap;cursor:pointer}.filters button.active{background:var(--ink);color:white;border-color:var(--ink)}select{border:1px solid var(--line);background:white;border-radius:10px;padding:11px 14px;color:var(--ink)}.doctorGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.doctorCard{background:var(--card);border:1px solid var(--line);border-radius:24px;overflow:hidden;transition:.2s;box-shadow:0 8px 30px rgba(18,32,29,.035)}.doctorCard:hover{transform:translateY(-3px);box-shadow:0 18px 50px rgba(18,32,29,.08)}.photoWrap{height:235px;background:linear-gradient(145deg,#e5eee9,#f6f8f5);position:relative;display:grid;place-items:center;overflow:hidden}.photoWrap img{width:100%;height:100%;object-fit:cover}.initials{font-family:var(--font-display);font-size:64px;color:#8ba59e}.verified{position:absolute;left:14px;bottom:14px;background:white;color:var(--accent);border-radius:999px;padding:7px 10px;font-size:10px;font-weight:800;box-shadow:0 6px 18px #0001}.cardBody{padding:22px}.cardTop{display:flex;justify-content:space-between;gap:10px;color:var(--accent);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.cardTop b{color:#98713b}.doctorCard h2{font-family:var(--font-display);font-size:29px;font-weight:500;line-height:1.05;margin:12px 0 5px}.sub{color:#66736f;font-size:13px;margin:0}.meta{display:flex;flex-wrap:wrap;gap:10px;margin:17px 0;color:#697772;font-size:11px}.summary{font-size:13px;line-height:1.55;color:#596763}.chips{display:flex;gap:6px;flex-wrap:wrap;margin:16px 0}.chips span{background:var(--soft);color:#3e625a;padding:6px 8px;border-radius:7px;font-size:10px}.view{display:flex;justify-content:space-between;align-items:center;color:var(--ink);font-size:13px;font-weight:800;text-decoration:none;border-top:1px solid var(--line);padding-top:16px}.view span{color:var(--accent);font-size:18px}.state{background:white;border:1px solid var(--line);border-radius:25px;padding:75px 25px;text-align:center}.state h2{font-family:var(--font-display);font-size:38px;font-weight:400;margin:12px 0}.state p{max-width:600px;margin:0 auto 24px;color:var(--muted);line-height:1.6}.stateIcon,.orb{margin:auto;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:var(--soft);color:var(--accent);font-weight:800}.orb{font-size:25px}.spinner{width:30px;height:30px;border:3px solid #dce6e2;border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:auto}@keyframes spin{to{transform:rotate(360deg)}}.bottomCta{max-width:1250px;margin:0 auto 40px;padding:45px clamp(22px,5vw,55px);border-radius:28px;background:#dfece6;display:flex;justify-content:space-between;align-items:center;gap:30px}.bottomCta h2{font-family:var(--font-display);font-size:40px;font-weight:400;max-width:600px;margin:0}.bottomCta .primary{white-space:nowrap}footer{border-top:1px solid var(--line);padding:25px clamp(20px,5vw,72px);display:flex;justify-content:space-between;gap:20px;color:#78837f;font-size:11px}footer .brand{color:var(--ink)}@media(max-width:900px){.nav nav{display:none}.doctorGrid{grid-template-columns:repeat(2,1fr)}.toolbar{align-items:flex-start;flex-direction:column}.bottomCta{margin:0 20px 30px;flex-direction:column;align-items:flex-start}}@media(max-width:620px){.nav{height:68px}.navCta{padding:10px 12px;font-size:11px}.hero{padding-top:55px}.hero h1{font-size:50px}.searchBox{height:58px}.searchBox kbd{display:none}.doctorGrid{grid-template-columns:1fr}.photoWrap{height:260px}.bottomCta h2{font-size:34px}footer{flex-direction:column}.directory{padding-bottom:55px}}
`
