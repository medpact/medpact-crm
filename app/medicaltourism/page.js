"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Newsreader, Public_Sans } from "next/font/google"
import { supabase } from "../../lib/supabase"

const display = Newsreader({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"] })
const body = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

/* ------------------------------------------------------------------ */
/*  EDIT THESE                                                         */
/* ------------------------------------------------------------------ */

const WHATSAPP = "919999999999"          // country code + number, digits only
const EMAIL = "care@medpact.in"
const PHONE_DISPLAY = "+91 99999 99999"

// Rough conversion for the estimate widget. Update when you like.
const CURRENCIES = {
  USD: { symbol: "$", rate: 1, label: "US dollars" },
  EUR: { symbol: "€", rate: 0.92, label: "Euros" },
  GBP: { symbol: "£", rate: 0.79, label: "Pounds" },
}

// What a trip realistically costs on top of the treatment quote.
const TRAVEL_ALLOWANCE_USD = 2800

/* ------------------------------------------------------------------ */
/*  FALLBACK CONTENT                                                   */
/* ------------------------------------------------------------------ */

/**
 * Benchmark price list.
 *
 *  price_us / price_india  — USD figures used by the estimate widget and the savings bars.
 *  us_label / india_label  — what is printed in the comparison table. Use these when the real
 *                            figure is a range or carries a qualifier, so the table stays honest.
 *  note                    — secondary line under the India figure (current hospital ranges).
 *  saving_label            — printed as given rather than recomputed.
 *
 *  Rupee figures converted at roughly Rs 83 to the dollar. Update alongside CURRENCIES.
 */
const SAMPLE_PROCEDURES = [
  {
    id: "s1", glyph: "🦷", name: "Dental implants", category: "Dental", stay_days: 12,
    price_us: 2800, price_india: 1000,
    us_label: "$2,800", india_label: "~$1,000", saving_label: "64%",
  },
  {
    id: "s2", glyph: "🦵", name: "Knee replacement", category: "Orthopaedic", stay_days: 16,
    price_us: 50000, price_india: 6200,
    us_label: "$50,000", india_label: "$6,200", note: "Rs 2–3.5L current Apollo range",
    saving_label: "~88%+",
  },
  {
    id: "s3", glyph: "🦴", name: "Hip replacement", category: "Orthopaedic", stay_days: 16,
    price_us: 50000, price_india: 7000,
    us_label: "$50,000", india_label: "$7,000", note: "Rs 1.5–4L current Apollo range",
    saving_label: "~86%+",
  },
  {
    id: "s4", glyph: "🫀", name: "Heart bypass (CABG)", category: "Cardiac", stay_days: 21,
    price_us: 144000, price_india: 5200,
    us_label: "$144,000", india_label: "$5,200", saving_label: "~96%",
  },
  {
    id: "s5", glyph: "❤️", name: "Heart valve replacement", category: "Cardiac", stay_days: 21,
    price_us: 170000, price_india: 5500,
    us_label: "$170,000", india_label: "$5,500", saving_label: "~97%",
  },
  {
    id: "s6", glyph: "🦴", name: "Spinal fusion", category: "Neuro", stay_days: 18,
    price_us: 100000, price_india: 2400,
    us_label: "~$100,000", us_note: "payer expenditure",
    india_label: "Rs 1–3L", saving_label: "~97–99%",
  },
  {
    id: "s7", glyph: "⚖️", name: "Sleeve gastrectomy", category: "Bariatric", stay_days: 14,
    price_us: 41400, price_india: 3600,
    us_label: "~$41,400", us_note: "two-year cost benchmark",
    india_label: "Rs 2–4L", saving_label: "~90%+",
  },
  {
    id: "s8", glyph: "👁️", name: "Cataract surgery", category: "Eye", stay_days: 7,
    price_us: 4000, price_india: 780,
    us_label: "$3,000–5,000", us_note: "per eye, uninsured",
    india_label: "Rs 30k–1L", saving_label: "~65–90%",
  },
  {
    id: "s9", glyph: "🧠", name: "Brain tumour surgery", category: "Neuro", stay_days: 24,
    price_us: 90000, price_india: 2100,
    us_label: "$50,000–140,000", us_note: "depending on the case",
    india_label: "Rs 1–2.5L", saving_label: "Very high",
  },
  {
    id: "s10", glyph: "🫀", name: "Angioplasty", category: "Cardiac", stay_days: 10,
    price_us: 57000, price_india: 3300,
    us_label: "$57,000", india_label: "$3,300", saving_label: "~94%",
  },
]

const SAMPLE_DOCTORS = [
  { id: "d1", name: "Dr. Anand Krishnan", experience_years: 27, specialty: "Cardiothoracic surgery", hospital: "Chennai" },
  { id: "d2", name: "Dr. Meera Iyer", experience_years: 19, specialty: "Neurosurgery", hospital: "Bengaluru" },
  { id: "d3", name: "Dr. Rajiv Sethi", experience_years: 22, specialty: "Implantology", hospital: "Hyderabad" },
  { id: "d4", name: "Dr. Fatima Sheikh", experience_years: 16, specialty: "Joint replacement", hospital: "Chennai" },
]

const SAMPLE_STORIES = [
  {
    id: "t1",
    name: "Karen D.",
    country: "Phoenix, Arizona",
    procedure: "Heart valve replacement",
    quote:
      "My surgeon in Phoenix quoted me a number I could not say out loud. Three weeks later I was walking the hospital garden in Chennai with a new valve and a bill I paid without borrowing.",
    video_url: "",
  },
  {
    id: "t2",
    name: "Thomas R.",
    country: "Manchester, UK",
    procedure: "Full-mouth implants",
    quote:
      "I had waited fourteen months on a list at home. MedPact had my scans reviewed in four days and a date within three weeks.",
    video_url: "",
  },
  {
    id: "t3",
    name: "Élise M.",
    country: "Lyon, France",
    procedure: "Spinal fusion",
    quote:
      "Someone met me at the airport at two in the morning. That sounds small. When you are travelling alone for surgery, it is not small.",
    video_url: "",
  },
]

const JOURNEY = [
  { t: "Send us your reports", d: "Scans, prescriptions, a recent quote from home — photos from your phone are fine." },
  { t: "Get a written opinion", d: "Two consultants review your case and reply within 48 hours. No charge, no obligation." },
  { t: "See the full price", d: "One figure covering surgery, surgeon, hospital stay, implants and medication. Not a starting price." },
  { t: "Visa and flights", d: "We issue the medical visa invitation letter and help you pick dates around the surgeon's calendar." },
  { t: "You land, we meet you", d: "Airport pickup, an apartment or hotel near the hospital, and a coordinator on call in English." },
  { t: "Treatment and recovery", d: "Surgery, ward, physiotherapy, and a fitness-to-fly clearance before you travel back." },
  { t: "Follow-up from home", d: "Video reviews with your surgeon at 1, 3 and 6 months, and records formatted for your GP." },
]

const FAQS = [
  {
    q: "Why is treatment in India so much cheaper?",
    a: "Salaries, land, and hospital overheads are a fraction of US costs, and there is no insurance billing layer adding administration to every line item. The implants, the machines and the drugs are largely the same brands you would get at home.",
  },
  {
    q: "Who actually operates on me?",
    a: "Consultants with 15 to 30 years of experience, most with fellowships in the UK, US or Singapore. You get the surgeon's name, registration number and case volume in writing before you book anything.",
  },
  {
    q: "Are the hospitals accredited?",
    a: "We only work with NABH-accredited hospitals, and most of our partners also hold JCI accreditation — the same international standard applied to hospitals in the US and Europe.",
  },
  {
    q: "What if something goes wrong?",
    a: "Complications are handled by the operating hospital at no additional surgical fee under the package terms, which are written into your estimate before you travel. We tell you the specific risk figures for your procedure up front.",
  },
  {
    q: "How long will I be away?",
    a: "Dental work is usually 10 to 14 days. Cardiac and spinal surgery run three to four weeks including recovery and clearance to fly.",
  },
  {
    q: "Will my insurer reimburse me?",
    a: "Some US and European insurers reimburse part of the cost, and most patients pay out of pocket because it is still far less than their deductible. We provide itemised, coded invoices for any claim you want to file.",
  },
]

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function money(usd, code) {
  const c = CURRENCIES[code]
  const value = Math.round((usd * c.rate) / 10) * 10
  return c.symbol + value.toLocaleString("en-US")
}

function embedUrl(url) {
  if (!url) return ""
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/)
  return m ? "https://www.youtube.com/embed/" + m[1] : url
}

function initials(name = "") {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function useInView(threshold = 0.25) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, threshold])
  return [ref, seen]
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function MedicalTourismPage() {
  const [procedures, setProcedures] = useState(SAMPLE_PROCEDURES)
  const [doctors, setDoctors] = useState(SAMPLE_DOCTORS)
  const [stories, setStories] = useState(SAMPLE_STORIES)

  const [currency, setCurrency] = useState("USD")
  const [selectedId, setSelectedId] = useState(SAMPLE_PROCEDURES[0].id)
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    let live = true

    async function load() {
      const [proc, docs, testi] = await Promise.all([
        supabase.from("procedures").select("*"),
        supabase.from("doctors").select("id,name,experience_years,photo_url,hospital,specialties(name)").limit(8),
        supabase.from("testimonials").select("*").limit(6),
      ])

      if (!live) return

      if (proc.data?.length) {
        const clean = proc.data.filter((p) => p.price_india > 0 && p.price_us > 0)
        if (clean.length) {
          setProcedures(clean)
          setSelectedId(clean[0].id)
        }
      }

      if (docs.data?.length) {
        setDoctors(
          docs.data.map((d) => ({
            ...d,
            specialty: d.specialties?.name || d.specialties?.[0]?.name || "Consultant",
          }))
        )
      }

      if (testi.data?.length) setStories(testi.data)
    }

    load().catch(() => {
      /* keep the sample content on screen rather than an empty page */
    })

    return () => {
      live = false
    }
  }, [])

  const selected = useMemo(
    () => procedures.find((p) => String(p.id) === String(selectedId)) || procedures[0],
    [procedures, selectedId]
  )

  const savings = selected ? selected.price_us - selected.price_india : 0
  const net = savings - TRAVEL_ALLOWANCE_USD
  const cut = selected ? Math.round((1 - selected.price_india / selected.price_us) * 100) : 0

  return (
    <div className={body.className + " page"}>
      <SiteHeader />

      <main>
        <Hero
          procedures={procedures}
          selected={selected}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          currency={currency}
          setCurrency={setCurrency}
          savings={savings}
          net={net}
          cut={cut}
        />

        <Assurances />
        <Specialities procedures={procedures} currency={currency} />
        <Comparison procedures={procedures} currency={currency} />
        <Journey />
        <Doctors doctors={doctors} />
        <Stories stories={stories} />
        <Faq open={openFaq} setOpen={setOpenFaq} />
        <Enquiry procedures={procedures} />
      </main>

      <SiteFooter />

      <a
        className="whatsapp-float"
        href={"https://wa.me/" + WHATSAPP}
        target="_blank"
        rel="noreferrer"
        aria-label="Message us on WhatsApp"
      >
        <WhatsAppMark />
        <span>WhatsApp</span>
      </a>

      <GlobalStyles />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTIONS                                                           */
/* ------------------------------------------------------------------ */

function SiteHeader() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={"site-header" + (solid ? " is-solid" : "")}>
      <div className="shell header-inner">
        <a className="wordmark" href="/">
          MedPact<span className="wordmark-dot">.</span>
        </a>

        <nav className="header-nav">
          <a href="#specialities">Treatments</a>
          <a href="#prices">Prices</a>
          <a href="#journey">How it works</a>
          <a href="#doctors">Doctors</a>
          <a href="#answers">Answers</a>
        </nav>

        <a className="btn btn-dark btn-sm" href="#enquire">
          Get a written estimate
        </a>
      </div>
    </header>
  )
}

function Hero({ procedures, selected, selectedId, setSelectedId, currency, setCurrency, savings, net, cut }) {
  return (
    <section className="hero">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">Treatment in India for patients from the US, UK and Europe</p>

          <h1 className={display.className + " hero-title"}>
            The same operation.
            <br />
            A different number
            <br />
            at the bottom.
          </h1>

          <p className="hero-lede">
            MedPact arranges surgery at NABH and JCI accredited hospitals in India — the consultant,
            the theatre, the ward, the visa letter and the person who meets you at arrivals. You see
            the whole price before you book a flight.
          </p>

          <div className="hero-actions">
            <a className="btn btn-dark" href="#enquire">
              Send my reports
            </a>
            <a className="btn btn-plain" href="#prices">
              See what things cost
            </a>
          </div>

          <p className="hero-note">
            Free second opinion within 48 hours. No card, no deposit, no obligation to travel.
          </p>
        </div>

        {/* The estimate card — the thing this whole page is really about */}
        <div className="estimate" aria-live="polite">
          <div className="estimate-head">
            <span className="estimate-title">Indicative estimate</span>
            <div className="currency-switch" role="group" aria-label="Currency">
              {Object.keys(CURRENCIES).map((code) => (
                <button
                  key={code}
                  type="button"
                  className={code === currency ? "is-on" : ""}
                  onClick={() => setCurrency(code)}
                  aria-pressed={code === currency}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field-label">What do you need done?</span>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <dl className="ledger">
            <div className="ledger-row">
              <dt>Typical price at home</dt>
              <dd className="strike">{money(selected.price_us, currency)}</dd>
            </div>
            <div className="ledger-row">
              <dt>MedPact package in India</dt>
              <dd>{money(selected.price_india, currency)}</dd>
            </div>
            <div className="ledger-row muted">
              <dt>Flights, stay, coordinator</dt>
              <dd>+ {money(TRAVEL_ALLOWANCE_USD, currency)}</dd>
            </div>
            <div className="ledger-row total">
              <dt>You keep</dt>
              <dd>{money(net, currency)}</dd>
            </div>
          </dl>

          <div className="estimate-foot">
            <span className="cut-badge">{cut}% less</span>
            <span>
              {selected.stay_days ? selected.stay_days + " days in India, door to door" : "Typically 2–4 weeks in India"}
            </span>
          </div>

          <a className="btn btn-jade btn-block" href="#enquire">
            Price my case exactly
          </a>
          <p className="estimate-small">
            Package covers surgeon, anaesthesia, theatre, implants, ward and medication. Your final
            figure is confirmed in writing after the consultant reads your reports.
          </p>
        </div>
      </div>
    </section>
  )
}

function Assurances() {
  const items = [
    ["Accredited hospitals only", "NABH accredited, most also JCI — the standard applied to hospitals in the US and Europe."],
    ["No waiting list", "Most dates are offered within three weeks of your reports being reviewed."],
    ["Everything in English", "Consultants, coordinators, discharge notes and invoices."],
    ["Visa letter in 48 hours", "Medical visa invitation issued by the treating hospital, for you and one attendant."],
  ]
  return (
    <section className="assurances">
      <div className="shell assurance-grid">
        {items.map(([t, d]) => (
          <div className="assurance" key={t}>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Specialities({ procedures, currency }) {
  const groups = useMemo(() => {
    const byCat = {}
    procedures.forEach((p) => {
      const cat = p.category || p.department || "Other"
      byCat[cat] = byCat[cat] || []
      byCat[cat].push(p)
    })
    return Object.entries(byCat).slice(0, 6)
  }, [procedures])

  const blurbs = {
    Cardiac: "Bypass, valve repair and replacement, angioplasty and paediatric cardiac surgery.",
    Dental: "Implants, full-mouth rehabilitation, veneers and complex restorative work.",
    Neuro: "Spinal fusion, disc replacement, tumour resection and deep brain stimulation.",
    Orthopaedic: "Hip and knee replacement, revision surgery, arthroscopy and sports injuries.",
    Bariatric: "Sleeve gastrectomy and gastric bypass, with dietetic follow-up once you are home.",
    Eye: "Cataract surgery, lens replacement, LASIK and retinal procedures.",
  }

  return (
    <section id="specialities" className="band">
      <div className="shell">
        <SectionHead
          title="What we arrange"
          note="Four departments we know deeply, rather than a catalogue of everything."
        />

        <div className="spec-list">
          {groups.map(([cat, list]) => {
            const from = Math.min(...list.map((p) => p.price_india))
            return (
              <article className="spec" key={cat}>
                <div className="spec-main">
                  <h3 className={display.className}>{cat}</h3>
                  <p>{blurbs[cat] || "Consultant-led treatment with a written package price."}</p>
                  <ul className="spec-procs">
                    {list.slice(0, 4).map((p) => (
                      <li key={p.id}>{p.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="spec-side">
                  <span className="spec-from">from</span>
                  <span className={display.className + " spec-price"}>{money(from, currency)}</span>
                  <a className="link-underline" href="#enquire">
                    Ask about {cat.toLowerCase()}
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Comparison({ procedures, currency }) {
  const [ref, seen] = useInView(0.15)
  const showNative = currency === "USD"

  return (
    <section id="prices" className="band band-ink" ref={ref}>
      <div className="shell">
        <SectionHead
          invert
          title="What the same treatment costs"
          note="Published US benchmarks against Indian hospital benchmarks. Treatment only — flights, accommodation and the coordinator are quoted separately so nothing is buried."
        />

        <div className="table-wrap">
          <table className="price-table">
            <thead>
              <tr>
                <th scope="col">Procedure</th>
                <th scope="col" className="num">United States</th>
                <th scope="col" className="num">India</th>
                <th scope="col">You save</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map((p) => {
                const pct = Math.round((1 - p.price_india / p.price_us) * 100)
                return (
                  <tr key={p.id}>
                    <th scope="row">
                      {p.glyph ? <span className="glyph" aria-hidden="true">{p.glyph}</span> : null}
                      {p.name}
                    </th>

                    <td className="num">
                      <span className="fig fig-us">
                        {showNative && p.us_label ? p.us_label : money(p.price_us, currency)}
                      </span>
                      {p.us_note ? <span className="fig-note">{p.us_note}</span> : null}
                    </td>

                    <td className="num">
                      <span className="fig fig-in">
                        {showNative && p.india_label ? p.india_label : money(p.price_india, currency)}
                      </span>
                      {p.note ? <span className="fig-note">{p.note}</span> : null}
                    </td>

                    <td>
                      <div className="save">
                        <span className="save-pct">{p.saving_label || pct + "%"}</span>
                        <span className="save-track">
                          <span
                            className="save-fill"
                            style={{ width: (seen ? Math.min(pct, 99) : 0) + "%" }}
                          />
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="table-foot">
          US figures are national benchmarks for uninsured or out-of-network care and vary by state,
          hospital and insurer. Indian figures are hospital benchmarks; rupee ranges reflect what our
          partner hospitals are quoting now. Your own price is confirmed in writing before you travel.
        </p>
      </div>
    </section>
  )
}

function Journey() {
  return (
    <section id="journey" className="band">
      <div className="shell">
        <SectionHead
          title="From your first message to your follow-up"
          note="Seven steps. You are handed to a named coordinator at step two and keep them until step seven."
        />

        <ol className="steps">
          {JOURNEY.map((s, i) => (
            <li className="step" key={s.t}>
              <span className="step-num">{i + 1}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Doctors({ doctors }) {
  return (
    <section id="doctors" className="band band-paper">
      <div className="shell">
        <SectionHead
          title="Who will treat you"
          note="You get the surgeon's name before you commit to anything — never a hospital name alone."
        />

        <div className="roster">
          {doctors.slice(0, 8).map((d) => (
            <article className="doc" key={d.id}>
              {d.photo_url ? (
                <img className="doc-photo" src={d.photo_url} alt="" />
              ) : (
                <span className={display.className + " doc-medallion"}>{initials(d.name)}</span>
              )}
              <div>
                <h3>{d.name}</h3>
                <p className="doc-spec">{d.specialty || d.specialties?.name}</p>
                <p className="doc-meta">
                  {d.experience_years ? d.experience_years + " years in practice" : "Consultant"}
                  {d.hospital ? " · " + d.hospital : ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stories({ stories }) {
  const withVideo = stories.filter((s) => s.video_url)
  const lead = stories[0]

  return (
    <section className="band">
      <div className="shell">
        <SectionHead title="Patients who went" note="Recorded after discharge, unscripted." />

        {lead && (
          <figure className="pullquote">
            <blockquote className={display.className}>
              {lead.quote || lead.message || lead.text || "A short note from a patient will appear here."}
            </blockquote>
            <figcaption>
              {lead.name}
              {lead.country ? ", " + lead.country : ""}
              {lead.procedure ? " — " + lead.procedure : ""}
            </figcaption>
          </figure>
        )}

        {withVideo.length > 0 && (
          <div className="videos">
            {withVideo.slice(0, 3).map((t) => (
              <figure className="video" key={t.id}>
                <div className="video-frame">
                  <iframe
                    src={embedUrl(t.video_url)}
                    title={"Patient story — " + t.name}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <figcaption>
                  <strong>{t.name}</strong>
                  {t.country ? <span>{t.country}</span> : null}
                  {t.procedure ? <span>{t.procedure}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Faq({ open, setOpen }) {
  return (
    <section id="answers" className="band band-paper">
      <div className="shell faq-shell">
        <SectionHead title="The questions people actually ask" />

        <div className="faq">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div className={"faq-item" + (isOpen ? " is-open" : "")} key={f.q}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                  <span>{f.q}</span>
                  <span className="faq-mark" aria-hidden="true" />
                </button>
                <div className="faq-body" hidden={!isOpen}>
                  <p>{f.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Enquiry({ procedures }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    phone: "",
    procedure: "",
    message: "",
  })
  const [state, setState] = useState("idle") // idle | sending | sent | error

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setState("sending")
    const { error } = await supabase.from("leads").insert([form])
    setState(error ? "error" : "sent")
  }

  return (
    <section id="enquire" className="band band-ink enquire">
      <div className="shell enquire-grid">
        <div className="enquire-copy">
          <h2 className={display.className}>Send your reports. Get a real price.</h2>
          <p>
            Two consultants read your case and reply within 48 hours with an opinion and a written
            package price. Nothing is charged, and nobody will call you at midnight.
          </p>

          <ul className="contact-list">
            <li>
              <span>WhatsApp</span>
              <a href={"https://wa.me/" + WHATSAPP} target="_blank" rel="noreferrer">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <span>Email</span>
              <a href={"mailto:" + EMAIL}>{EMAIL}</a>
            </li>
            <li>
              <span>Hours</span>
              <span>Replies 24/7, including US and UK evenings</span>
            </li>
          </ul>
        </div>

        {state === "sent" ? (
          <div className="form-done">
            <h3 className={display.className}>Your case is with our consultants.</h3>
            <p>
              You will get a reply at {form.email || "your email"} within 48 hours. If it is urgent,
              message the same details on WhatsApp and a coordinator will pick it up now.
            </p>
            <a className="btn btn-jade" href={"https://wa.me/" + WHATSAPP} target="_blank" rel="noreferrer">
              Continue on WhatsApp
            </a>
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            <div className="form-row">
              <label className="field">
                <span className="field-label">Your name</span>
                <input required value={form.name} onChange={set("name")} autoComplete="name" />
              </label>
              <label className="field">
                <span className="field-label">Country</span>
                <input required value={form.country} onChange={set("country")} placeholder="United States" />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label">Email</span>
                <input required type="email" value={form.email} onChange={set("email")} autoComplete="email" />
              </label>
              <label className="field">
                <span className="field-label">Phone or WhatsApp</span>
                <input value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </label>
            </div>

            <label className="field">
              <span className="field-label">What are you being treated for?</span>
              <select value={form.procedure} onChange={set("procedure")}>
                <option value="">I am not sure yet</option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Anything the consultant should know</span>
              <textarea
                rows={4}
                value={form.message}
                onChange={set("message")}
                placeholder="Diagnosis, age, when you were hoping to travel, the quote you were given at home."
              />
            </label>

            {state === "error" && (
              <p className="form-error">
                That did not send. Message the same details on WhatsApp and we will pick it up
                straight away.
              </p>
            )}

            <button className="btn btn-jade btn-block" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Request my estimate"}
            </button>
            <p className="form-small">
              Your reports go to the treating consultant and nobody else. We do not sell enquiries.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <a className="wordmark" href="/">
            MedPact<span className="wordmark-dot">.</span>
          </a>
          <p className="footer-line">
            Medical travel for patients from the United States, United Kingdom and Europe.
          </p>
        </div>

        <nav className="footer-nav">
          <a href="#specialities">Treatments</a>
          <a href="#prices">Prices</a>
          <a href="#journey">How it works</a>
          <a href="#doctors">Doctors</a>
          <a href="#answers">Answers</a>
          <a href="#enquire">Contact</a>
        </nav>

        <p className="footer-legal">
          MedPact arranges care with independently accredited hospitals and does not practise
          medicine. Prices shown are indicative until confirmed by the treating consultant.
        </p>
      </div>
    </footer>
  )
}

function SectionHead({ title, note, invert }) {
  return (
    <div className={"section-head" + (invert ? " is-invert" : "")}>
      <h2 className={display.className}>{title}</h2>
      {note ? <p>{note}</p> : null}
    </div>
  )
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  STYLES                                                             */
/* ------------------------------------------------------------------ */

function GlobalStyles() {
  return (
    <style jsx global>{`
      :root {
        --ink: #11251f;
        --ink-soft: #1c3a32;
        --jade: #1f6f5c;
        --jade-light: #4c9b86;
        --marigold: #e0a33c;
        --paper: #fbfaf7;
        --paper-warm: #f3f1ea;
        --mist: #dfe5e1;
        --text: #1a2420;
        --text-soft: #56655f;
        --line: rgba(17, 37, 31, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
        scroll-padding-top: 88px;
      }

      body {
        margin: 0;
      }

      .page {
        background: var(--paper);
        color: var(--text);
        font-size: 17px;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }

      .page h1,
      .page h2,
      .page h3 {
        margin: 0;
        font-weight: 400;
        letter-spacing: -0.01em;
      }

      .page p {
        margin: 0;
      }

      .page a {
        color: inherit;
      }

      .shell {
        width: min(1140px, calc(100% - 48px));
        margin: 0 auto;
      }

      :focus-visible {
        outline: 2px solid var(--jade);
        outline-offset: 3px;
        border-radius: 3px;
      }

      /* ---------- buttons ---------- */

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 24px;
        border: 1px solid transparent;
        border-radius: 999px;
        font: inherit;
        font-weight: 600;
        font-size: 16px;
        text-decoration: none;
        cursor: pointer;
        transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
      }
      .btn-sm {
        padding: 9px 18px;
        font-size: 14.5px;
      }
      .btn-block {
        width: 100%;
      }
      .btn-dark {
        background: var(--ink);
        color: var(--paper);
      }
      .btn-dark:hover {
        background: var(--ink-soft);
      }
      .btn-jade {
        background: var(--jade);
        color: #fff;
      }
      .btn-jade:hover {
        background: #195b4c;
      }
      .btn-jade:disabled {
        background: var(--jade-light);
        cursor: default;
      }
      .btn-plain {
        background: transparent;
        color: var(--ink);
        border-color: var(--line);
      }
      .btn-plain:hover {
        border-color: var(--ink);
      }

      .link-underline {
        text-decoration: none;
        font-weight: 600;
        font-size: 15px;
        color: var(--jade);
        border-bottom: 1px solid currentColor;
        padding-bottom: 2px;
      }

      /* ---------- header ---------- */

      .site-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: transparent;
        transition: background 0.2s ease, border-color 0.2s ease;
        border-bottom: 1px solid transparent;
      }
      .site-header.is-solid {
        background: rgba(251, 250, 247, 0.92);
        backdrop-filter: blur(10px);
        border-bottom-color: var(--line);
      }
      .header-inner {
        display: flex;
        align-items: center;
        gap: 32px;
        height: 72px;
      }
      .wordmark {
        font-size: 21px;
        font-weight: 700;
        letter-spacing: -0.03em;
        text-decoration: none;
        color: var(--ink);
      }
      .wordmark-dot {
        color: var(--marigold);
      }
      .header-nav {
        display: flex;
        gap: 26px;
        margin-left: auto;
      }
      .header-nav a {
        text-decoration: none;
        font-size: 15.5px;
        color: var(--text-soft);
      }
      .header-nav a:hover {
        color: var(--ink);
      }

      /* ---------- hero ---------- */

      .hero {
        padding: 56px 0 84px;
        background:
          radial-gradient(900px 420px at 88% -8%, rgba(31, 111, 92, 0.1), transparent 70%),
          var(--paper);
      }
      .hero-grid {
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 64px;
        align-items: start;
      }
      .hero-kicker {
        font-size: 14.5px;
        font-weight: 600;
        color: var(--jade);
        margin-bottom: 20px !important;
      }
      .hero-title {
        font-size: clamp(42px, 5.4vw, 68px);
        line-height: 1.04;
        letter-spacing: -0.028em;
        color: var(--ink);
      }
      .hero-lede {
        margin-top: 26px !important;
        max-width: 46ch;
        font-size: 18px;
        color: var(--text-soft);
      }
      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 32px;
      }
      .hero-note {
        margin-top: 18px !important;
        font-size: 14.5px;
        color: var(--text-soft);
      }

      /* ---------- estimate card ---------- */

      .estimate {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 26px;
        box-shadow: 0 24px 60px -34px rgba(17, 37, 31, 0.45);
      }
      .estimate-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--line);
      }
      .estimate-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-soft);
      }
      .currency-switch {
        display: inline-flex;
        background: var(--paper-warm);
        border-radius: 999px;
        padding: 3px;
      }
      .currency-switch button {
        border: 0;
        background: transparent;
        font: inherit;
        font-size: 13.5px;
        font-weight: 600;
        color: var(--text-soft);
        padding: 5px 11px;
        border-radius: 999px;
        cursor: pointer;
      }
      .currency-switch .is-on {
        background: var(--ink);
        color: var(--paper);
      }

      .field {
        display: block;
        margin-top: 18px;
      }
      .field-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-soft);
        margin-bottom: 7px;
      }
      .field select,
      .field input,
      .field textarea {
        width: 100%;
        font: inherit;
        font-size: 16px;
        color: var(--text);
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 12px 14px;
        appearance: none;
      }
      .field textarea {
        resize: vertical;
      }
      .field select:focus,
      .field input:focus,
      .field textarea:focus {
        border-color: var(--jade);
        outline: none;
      }

      .ledger {
        margin: 22px 0 0;
      }
      .ledger-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
        padding: 11px 0;
        border-bottom: 1px dashed var(--line);
        font-size: 15.5px;
      }
      .ledger-row dt {
        color: var(--text-soft);
      }
      .ledger-row dd {
        margin: 0;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .ledger-row .strike {
        text-decoration: line-through;
        color: var(--text-soft);
        font-weight: 500;
      }
      .ledger-row.muted dd {
        color: var(--text-soft);
        font-weight: 500;
      }
      .ledger-row.total {
        border-bottom: 0;
        padding-top: 16px;
        align-items: center;
      }
      .ledger-row.total dt {
        color: var(--ink);
        font-weight: 600;
        font-size: 17px;
      }
      .ledger-row.total dd {
        font-size: 30px;
        color: var(--jade);
        letter-spacing: -0.02em;
      }

      .estimate-foot {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 14px;
        color: var(--text-soft);
        margin-bottom: 18px;
      }
      .cut-badge {
        background: rgba(224, 163, 60, 0.18);
        color: #8a5c07;
        font-weight: 700;
        font-size: 13px;
        padding: 4px 10px;
        border-radius: 999px;
      }
      .estimate-small {
        margin-top: 14px !important;
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--text-soft);
      }

      /* ---------- assurances ---------- */

      .assurances {
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        background: var(--paper-warm);
        padding: 34px 0;
      }
      .assurance-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 36px;
      }
      .assurance h3 {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .assurance p {
        font-size: 14.5px;
        line-height: 1.5;
        color: var(--text-soft);
      }

      /* ---------- section frame ---------- */

      .band {
        padding: 86px 0;
      }
      .band-paper {
        background: var(--paper-warm);
      }
      .band-ink {
        background: var(--ink);
        color: var(--paper);
      }
      .section-head {
        max-width: 60ch;
        margin-bottom: 48px;
      }
      .section-head h2 {
        font-size: clamp(30px, 3.4vw, 42px);
        line-height: 1.12;
        letter-spacing: -0.022em;
        color: var(--ink);
      }
      .section-head p {
        margin-top: 14px !important;
        color: var(--text-soft);
        font-size: 17px;
      }
      .section-head.is-invert h2 {
        color: var(--paper);
      }
      .section-head.is-invert p {
        color: rgba(251, 250, 247, 0.66);
      }

      /* ---------- specialities ---------- */

      .spec-list {
        border-top: 1px solid var(--line);
      }
      .spec {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 48px;
        align-items: start;
        padding: 32px 0;
        border-bottom: 1px solid var(--line);
      }
      .spec-main h3 {
        font-size: 27px;
        color: var(--ink);
      }
      .spec-main > p {
        margin-top: 8px !important;
        color: var(--text-soft);
        max-width: 58ch;
      }
      .spec-procs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        list-style: none;
        margin: 18px 0 0;
        padding: 0;
      }
      .spec-procs li {
        font-size: 14px;
        background: var(--paper-warm);
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 5px 13px;
        color: var(--text-soft);
      }
      .band-paper .spec-procs li {
        background: #fff;
      }
      .spec-side {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        text-align: right;
      }
      .spec-from {
        font-size: 13.5px;
        color: var(--text-soft);
      }
      .spec-price {
        font-size: 34px;
        color: var(--ink);
        letter-spacing: -0.02em;
      }
      .spec-side .link-underline {
        margin-top: 8px;
      }

      /* ---------- price table ---------- */

      .table-wrap {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .price-table {
        width: 100%;
        min-width: 680px;
        border-collapse: collapse;
        text-align: left;
      }
      .price-table thead th {
        font-size: 13.5px;
        font-weight: 600;
        color: rgba(251, 250, 247, 0.5);
        padding: 0 0 14px;
        border-bottom: 1px solid rgba(251, 250, 247, 0.22);
      }
      .price-table tbody th,
      .price-table tbody td {
        padding: 18px 0;
        border-bottom: 1px solid rgba(251, 250, 247, 0.12);
        vertical-align: top;
      }
      .price-table tbody th {
        font-size: 17px;
        font-weight: 600;
        padding-right: 28px;
        white-space: nowrap;
      }
      .price-table .glyph {
        margin-right: 10px;
        font-size: 17px;
      }
      .price-table .num {
        text-align: right;
        padding-right: 40px !important;
      }
      .price-table thead th.num {
        padding-right: 40px;
      }
      .fig {
        display: block;
        font-size: 16.5px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .fig-us {
        color: rgba(251, 250, 247, 0.62);
        text-decoration: line-through;
        text-decoration-color: rgba(251, 250, 247, 0.32);
      }
      .fig-in {
        color: var(--paper);
      }
      .fig-note {
        display: block;
        margin-top: 4px;
        font-size: 12.5px;
        line-height: 1.4;
        color: rgba(251, 250, 247, 0.45);
        white-space: normal;
      }
      .save {
        min-width: 150px;
      }
      .save-pct {
        display: block;
        font-size: 16.5px;
        font-weight: 700;
        color: var(--marigold);
        margin-bottom: 8px;
      }
      .save-track {
        display: block;
        height: 6px;
        background: rgba(251, 250, 247, 0.12);
        border-radius: 999px;
        overflow: hidden;
      }
      .save-fill {
        display: block;
        height: 100%;
        width: 0;
        border-radius: 999px;
        background: var(--marigold);
        transition: width 1.1s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .table-foot {
        margin-top: 26px !important;
        max-width: 78ch;
        font-size: 13.5px;
        line-height: 1.6;
        color: rgba(251, 250, 247, 0.5);
      }

      /* ---------- journey ---------- */

      .steps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0 64px;
      }
      .step {
        display: flex;
        gap: 20px;
        padding: 22px 0;
        border-top: 1px solid var(--line);
      }
      .step-num {
        flex: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid var(--jade);
        color: var(--jade);
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 700;
        margin-top: 2px;
      }
      .step h3 {
        font-size: 18px;
        font-weight: 600;
      }
      .step p {
        margin-top: 5px !important;
        color: var(--text-soft);
        font-size: 15.5px;
        line-height: 1.55;
      }

      /* ---------- doctors ---------- */

      .roster {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0 64px;
      }
      .doc {
        display: flex;
        gap: 18px;
        align-items: center;
        padding: 22px 0;
        border-top: 1px solid var(--line);
      }
      .doc-medallion,
      .doc-photo {
        flex: none;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
      }
      .doc-medallion {
        display: grid;
        place-items: center;
        background: var(--ink);
        color: var(--paper);
        font-size: 20px;
        letter-spacing: 0.02em;
      }
      .doc h3 {
        font-size: 18px;
        font-weight: 600;
      }
      .doc-spec {
        color: var(--jade);
        font-size: 15px;
        font-weight: 600;
      }
      .doc-meta {
        font-size: 14.5px;
        color: var(--text-soft);
      }

      /* ---------- stories ---------- */

      .pullquote {
        margin: 0 0 56px;
        max-width: 26ch;
        max-width: 62ch;
      }
      .pullquote blockquote {
        margin: 0;
        font-size: clamp(24px, 2.8vw, 34px);
        line-height: 1.35;
        color: var(--ink);
        font-style: italic;
        letter-spacing: -0.015em;
      }
      .pullquote figcaption {
        margin-top: 18px;
        font-size: 15px;
        color: var(--text-soft);
      }
      .videos {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 28px;
      }
      .video {
        margin: 0;
      }
      .video-frame {
        position: relative;
        padding-top: 56.25%;
        border-radius: 12px;
        overflow: hidden;
        background: var(--mist);
      }
      .video-frame iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
      .video figcaption {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        font-size: 14.5px;
        color: var(--text-soft);
      }
      .video figcaption strong {
        color: var(--text);
      }

      /* ---------- faq ---------- */

      .faq-shell {
        width: min(820px, calc(100% - 48px));
      }
      .faq {
        border-top: 1px solid var(--line);
      }
      .faq-item {
        border-bottom: 1px solid var(--line);
      }
      .faq-item button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        background: none;
        border: 0;
        padding: 22px 0;
        font: inherit;
        font-size: 18px;
        font-weight: 600;
        color: var(--ink);
        text-align: left;
        cursor: pointer;
      }
      .faq-mark {
        flex: none;
        position: relative;
        width: 14px;
        height: 14px;
      }
      .faq-mark::before,
      .faq-mark::after {
        content: "";
        position: absolute;
        background: var(--jade);
        transition: transform 0.2s ease;
      }
      .faq-mark::before {
        top: 6px;
        left: 0;
        width: 14px;
        height: 2px;
      }
      .faq-mark::after {
        left: 6px;
        top: 0;
        width: 2px;
        height: 14px;
      }
      .faq-item.is-open .faq-mark::after {
        transform: scaleY(0);
      }
      .faq-body {
        padding-bottom: 24px;
      }
      .faq-body p {
        max-width: 68ch;
        color: var(--text-soft);
      }

      /* ---------- enquiry ---------- */

      .enquire-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 72px;
        align-items: start;
      }
      .enquire-copy h2 {
        font-size: clamp(30px, 3.4vw, 42px);
        line-height: 1.12;
        letter-spacing: -0.022em;
        color: var(--paper);
        max-width: 16ch;
      }
      .enquire-copy > p {
        margin-top: 18px !important;
        color: rgba(251, 250, 247, 0.7);
        max-width: 46ch;
      }
      .contact-list {
        list-style: none;
        padding: 0;
        margin: 36px 0 0;
        border-top: 1px solid rgba(251, 250, 247, 0.16);
      }
      .contact-list li {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 0;
        border-bottom: 1px solid rgba(251, 250, 247, 0.16);
        font-size: 15.5px;
      }
      .contact-list li span:first-child {
        color: rgba(251, 250, 247, 0.55);
      }
      .contact-list a {
        text-decoration: none;
        border-bottom: 1px solid rgba(251, 250, 247, 0.4);
      }

      .form,
      .form-done {
        background: var(--paper);
        color: var(--text);
        border-radius: 18px;
        padding: 30px;
      }
      .form .field:first-child,
      .form-row:first-child .field {
        margin-top: 0;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .form .btn {
        margin-top: 24px;
      }
      .form-small {
        margin-top: 14px !important;
        font-size: 13.5px;
        color: var(--text-soft);
        text-align: center;
      }
      .form-error {
        margin-top: 18px !important;
        font-size: 14.5px;
        color: #a4341f;
        background: rgba(164, 52, 31, 0.08);
        border-radius: 10px;
        padding: 12px 14px;
      }
      .form-done h3 {
        font-size: 26px;
        color: var(--ink);
      }
      .form-done p {
        margin: 14px 0 24px !important;
        color: var(--text-soft);
      }

      /* ---------- footer ---------- */

      .site-footer {
        background: var(--paper-warm);
        border-top: 1px solid var(--line);
        padding: 48px 0 72px;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 24px 48px;
      }
      .footer-line {
        margin-top: 10px !important;
        font-size: 15px;
        color: var(--text-soft);
        max-width: 40ch;
      }
      .footer-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
        align-items: flex-start;
      }
      .footer-nav a {
        text-decoration: none;
        font-size: 15px;
        color: var(--text-soft);
      }
      .footer-nav a:hover {
        color: var(--ink);
      }
      .footer-legal {
        grid-column: 1 / -1;
        margin-top: 24px !important;
        padding-top: 22px;
        border-top: 1px solid var(--line);
        font-size: 13.5px;
        color: var(--text-soft);
        max-width: 80ch;
      }

      /* ---------- whatsapp ---------- */

      .whatsapp-float {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 60;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        background: #1f6f5c;
        color: #fff;
        text-decoration: none;
        font-size: 15px;
        font-weight: 600;
        padding: 12px 18px;
        border-radius: 999px;
        box-shadow: 0 14px 30px -12px rgba(17, 37, 31, 0.6);
      }
      .whatsapp-float:hover {
        background: #195b4c;
      }

      /* ---------- responsive ---------- */

      @media (max-width: 1000px) {
        .hero-grid,
        .enquire-grid {
          grid-template-columns: 1fr;
          gap: 44px;
        }
        .assurance-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }
        .steps,
        .roster {
          grid-template-columns: 1fr;
          gap: 0;
        }
      }

      @media (max-width: 720px) {
        .shell,
        .faq-shell {
          width: calc(100% - 32px);
        }
        .header-nav {
          display: none;
        }
        .header-inner {
          justify-content: space-between;
        }
        .band {
          padding: 60px 0;
        }
        .hero {
          padding: 32px 0 60px;
        }
        .spec {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .spec-side {
          align-items: flex-start;
          text-align: left;
        }
        .form-row {
          grid-template-columns: 1fr;
          gap: 0;
        }
        .form-row .field + .field {
          margin-top: 18px;
        }
        .price-table {
          min-width: 620px;
        }
        .price-table .num {
          padding-right: 24px !important;
        }
        .table-wrap {
          margin-right: -16px;
          padding-right: 16px;
        }
        .footer-grid {
          grid-template-columns: 1fr;
        }
        .whatsapp-float span {
          display: none;
        }
        .whatsapp-float {
          padding: 14px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
        .save-fill {
          transition: none;
        }
      }
    `}</style>
  )
}
