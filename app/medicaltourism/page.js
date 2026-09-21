"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Newsreader, Public_Sans } from "next/font/google"
import { supabase } from "../../lib/supabase"

const display = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
})

const body = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

/* ================================================================
   SETTINGS
================================================================ */

const WHATSAPP = "919999999999"
const EMAIL = "care@medpact.in"
const PHONE_DISPLAY = "+91 99999 99999"

const CURRENCIES = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
}

const TRAVEL_ALLOWANCE_USD = 2800

/* ================================================================
   TEN TARGET PROCEDURES
   These are illustrative benchmark figures, not quotations.
================================================================ */

const SAMPLE_PROCEDURES = [
  {
    id: "s1",
    name: "Dental implants",
    price_india: 1800,
    price_us: 5000,
    category: "Dental",
    stay_days: 10,
    market_note:
      "A strong self-pay medical-tourism category, especially for multiple implants and full-mouth rehabilitation.",
  },
  {
    id: "s2",
    name: "Total knee replacement",
    price_india: 3200,
    price_us: 50000,
    category: "Orthopaedic",
    stay_days: 18,
    market_note:
      "A major elective procedure where cost, insurance and specialist access can vary considerably in the United States.",
  },
  {
    id: "s3",
    name: "Total hip replacement",
    price_india: 4200,
    price_us: 50000,
    category: "Orthopaedic",
    stay_days: 18,
    market_note:
      "A planned procedure with a substantial international price difference in published benchmarks.",
  },
  {
    id: "s4",
    name: "Coronary artery bypass (CABG)",
    price_india: 5200,
    price_us: 144000,
    category: "Cardiac",
    stay_days: 24,
    market_note:
      "A high-value cardiac procedure. International travel must be medically reviewed and approved.",
  },
  {
    id: "s5",
    name: "Heart valve replacement",
    price_india: 5500,
    price_us: 170000,
    category: "Cardiac",
    stay_days: 24,
    market_note:
      "Final cost depends on valve type, surgical technique, implant and patient complexity.",
  },
  {
    id: "s6",
    name: "Spinal fusion",
    price_india: 3100,
    price_us: 100000,
    category: "Neuro & Spine",
    stay_days: 18,
    market_note:
      "Complex spine cases require detailed imaging and specialist review before travel.",
  },
  {
    id: "s7",
    name: "Sleeve gastrectomy",
    price_india: 4200,
    price_us: 41400,
    category: "Bariatric",
    stay_days: 14,
    market_note:
      "Bariatric surgery has documented international medical-travel activity involving U.S. patients.",
  },
  {
    id: "s8",
    name: "Cataract surgery",
    price_india: 900,
    price_us: 4000,
    category: "Ophthalmology",
    stay_days: 7,
    market_note:
      "A high-volume procedure where the financial benefit depends strongly on insurance and lens choice.",
  },
  {
    id: "s9",
    name: "Brain tumor surgery",
    price_india: 2600,
    price_us: 90000,
    category: "Neurosurgery",
    stay_days: 28,
    market_note:
      "A highly individualized procedure requiring specialist case review rather than mass-market promotion.",
  },
  {
    id: "s10",
    name: "Angioplasty",
    price_india: 3300,
    price_us: 57000,
    category: "Cardiac",
    stay_days: 10,
    market_note:
      "Only appropriate for planned/elective cases after specialist review.",
  },
]

/* ================================================================
   FALLBACK DOCTORS
================================================================ */

const SAMPLE_DOCTORS = [
  {
    id: "d1",
    name: "Dr. Anand Krishnan",
    experience_years: 27,
    specialty: "Cardiothoracic Surgery",
    hospital: "Chennai",
  },
  {
    id: "d2",
    name: "Dr. Meera Iyer",
    experience_years: 19,
    specialty: "Neurosurgery",
    hospital: "Bengaluru",
  },
  {
    id: "d3",
    name: "Dr. Rajiv Sethi",
    experience_years: 22,
    specialty: "Implantology",
    hospital: "Hyderabad",
  },
  {
    id: "d4",
    name: "Dr. Fatima Sheikh",
    experience_years: 16,
    specialty: "Joint Replacement",
    hospital: "Chennai",
  },
]

/* ================================================================
   FALLBACK TESTIMONIALS
================================================================ */

const SAMPLE_STORIES = [
  {
    id: "t1",
    name: "Karen D.",
    country: "Phoenix, Arizona",
    procedure: "Heart valve replacement",
    quote:
      "I wanted another opinion before making a major treatment decision. MedPact helped us understand the hospital, surgeon and expected costs before we travelled.",
    video_url: "",
  },
  {
    id: "t2",
    name: "Thomas R.",
    country: "United States",
    procedure: "Dental implants",
    quote:
      "The biggest difference was having one person coordinating the hospital, accommodation and appointments instead of trying to arrange everything ourselves.",
    video_url: "",
  },
  {
    id: "t3",
    name: "Michael P.",
    country: "United States",
    procedure: "Knee replacement",
    quote:
      "We wanted to compare our options before deciding. The medical records review gave us a much clearer picture of what was involved.",
    video_url: "",
  },
]

/* ================================================================
   JOURNEY
================================================================ */

const JOURNEY = [
  {
    t: "Send your reports",
    d: "Share your diagnosis, scans, prescriptions or the treatment recommendation you already received.",
  },
  {
    t: "Get a medical case review",
    d: "The treating team reviews your records and determines whether international treatment is appropriate.",
  },
  {
    t: "Compare treatment options",
    d: "Understand the proposed procedure, hospital, surgeon, expected stay and major inclusions.",
  },
  {
    t: "See the complete estimate",
    d: "We separate treatment, travel, accommodation and coordination costs so you can compare the whole journey.",
  },
  {
    t: "Plan your journey",
    d: "Once medically accepted, we help coordinate hospital dates, visa documentation and travel arrangements.",
  },
  {
    t: "Treatment and recovery",
    d: "The treating hospital manages your medical care and recovery plan.",
  },
  {
    t: "Follow-up from home",
    d: "Continue communication with the treating team after you return home.",
  },
]

/* ================================================================
   FAQ
================================================================ */

const FAQS = [
  {
    q: "Why can treatment cost less in India?",
    a:
      "Hospital operating costs, professional fees and other healthcare costs can be substantially different between countries. However, the final comparison should include insurance, travel, accommodation, implants, medicines and follow-up.",
  },
  {
    q: "Is the price shown on this website guaranteed?",
    a:
      "No. The figures shown on this page are illustrative benchmarks for comparison. Your final treatment estimate depends on your medical records, procedure complexity, surgeon, hospital, implants, room category and other factors.",
  },
  {
    q: "Who decides whether I can travel for treatment?",
    a:
      "The treating medical team determines whether international treatment and travel are appropriate for your particular medical condition. MedPact coordinates the process but does not practise medicine.",
  },
  {
    q: "What happens if something goes wrong?",
    a:
      "The treating hospital explains procedure-specific risks and follow-up requirements before treatment. Package inclusions and exclusions should be documented in writing before you travel.",
  },
  {
    q: "How long will I need to stay in India?",
    a:
      "It depends on the procedure, your medical condition and your recovery. Dental treatment may require a shorter stay, while major cardiac, neurological and orthopaedic procedures can require several weeks.",
  },
  {
    q: "Will my U.S. insurance pay for treatment in India?",
    a:
      "Insurance coverage varies by plan. Some international or out-of-network benefits may exist, while others may not. MedPact can provide itemised documentation that you can discuss with your insurer.",
  },
]

/* ================================================================
   HELPERS
================================================================ */

function money(usd, code) {
  const currency = CURRENCIES[code] || CURRENCIES.USD
  const value = Math.round((usd * currency.rate) / 10) * 10
  return currency.symbol + value.toLocaleString("en-US")
}

function embedUrl(url) {
  if (!url) return ""

  const match = url.match(
    /(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/
  )

  return match
    ? "https://www.youtube.com/embed/" + match[1]
    : url
}

function initials(name = "") {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element || seen) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setSeen(true)
        })
      },
      { threshold }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [seen, threshold])

  return [ref, seen]
}

/* ================================================================
   PAGE
================================================================ */

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
        supabase
          .from("doctors")
          .select(
            "id,name,experience_years,photo_url,hospital,specialties(name)"
          )
          .limit(8),
        supabase.from("testimonials").select("*").limit(6),
      ])

      if (!live) return

      if (proc.data?.length) {
        const clean = proc.data
          .filter(
            (p) =>
              Number(p.price_india) > 0 &&
              Number(p.price_us) > 0
          )
          .map((p) => ({
            ...p,
            category: p.category || p.department || "Other",
          }))

        if (clean.length) {
          setProcedures(clean)
          setSelectedId(clean[0].id)
        }
      }

      if (docs.data?.length) {
        setDoctors(
          docs.data.map((d) => ({
            ...d,
            specialty:
              d.specialties?.name ||
              d.specialties?.[0]?.name ||
              "Consultant",
          }))
        )
      }

      if (testi.data?.length) {
        setStories(testi.data)
      }
    }

    load().catch(() => {})

    return () => {
      live = false
    }
  }, [])

  const selected = useMemo(
    () =>
      procedures.find(
        (p) => String(p.id) === String(selectedId)
      ) || procedures[0],
    [procedures, selectedId]
  )

  const savings = selected
    ? Number(selected.price_us) - Number(selected.price_india)
    : 0

  const net = Math.max(
    0,
    savings - TRAVEL_ALLOWANCE_USD
  )

  const cut = selected
    ? Math.round(
        (1 -
          Number(selected.price_india) /
            Number(selected.price_us)) *
          100
      )
    : 0

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

        <USOpportunity />

        <Specialities
          procedures={procedures}
          currency={currency}
        />

        <Comparison
          procedures={procedures}
          currency={currency}
        />

        <TravelEconomics
          procedures={procedures}
          currency={currency}
        />

        <Journey />

        <Doctors doctors={doctors} />

        <Stories stories={stories} />

        <Faq
          open={openFaq}
          setOpen={setOpenFaq}
        />

        <Enquiry procedures={procedures} />
      </main>

      <SiteFooter />

      <a
        className="whatsapp-float"
        href={"https://wa.me/" + WHATSAPP}
        target="_blank"
        rel="noreferrer"
        aria-label="Message MedPact on WhatsApp"
      >
        <WhatsAppMark />
        <span>WhatsApp</span>
      </a>

      <GlobalStyles />
    </div>
  )
}

/* ================================================================
   HEADER
================================================================ */

function SiteHeader() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 24)
    }

    window.addEventListener("scroll", onScroll, {
      passive: true,
    })

    return () =>
      window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={
        "site-header" + (solid ? " is-solid" : "")
      }
    >
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

        <a
          className="btn btn-dark btn-sm"
          href="#enquire"
        >
          Get a case review
        </a>
      </div>
    </header>
  )
}

/* ================================================================
   HERO
================================================================ */

function Hero({
  procedures,
  selected,
  selectedId,
  setSelectedId,
  currency,
  setCurrency,
  savings,
  net,
  cut,
}) {
  return (
    <section className="hero">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">
            Treatment options in India for international patients
          </p>

          <h1
            className={
              display.className + " hero-title"
            }
          >
            Your treatment.
            <br />
            A clearer choice
            <br />
            before you travel.
          </h1>

          <p className="hero-lede">
            If you have already been given a diagnosis or
            treatment estimate at home, MedPact can help
            you explore treatment options in India.
            We coordinate consultant review, hospital,
            written estimate, visa support, travel and
            local assistance.
          </p>

          <div className="hero-actions">
            <a
              className="btn btn-dark"
              href="#enquire"
            >
              Send my reports
            </a>

            <a
              className="btn btn-plain"
              href="#prices"
            >
              Compare treatment costs
            </a>
          </div>

          <p className="hero-note">
            Case review is subject to medical acceptance.
            No obligation to travel.
          </p>
        </div>

        {selected && (
          <div
            className="estimate"
            aria-live="polite"
          >
            <div className="estimate-head">
              <span className="estimate-title">
                Illustrative estimate
              </span>

              <div
                className="currency-switch"
                role="group"
                aria-label="Currency"
              >
                {Object.keys(CURRENCIES).map(
                  (code) => (
                    <button
                      key={code}
                      type="button"
                      className={
                        code === currency
                          ? "is-on"
                          : ""
                      }
                      onClick={() =>
                        setCurrency(code)
                      }
                      aria-pressed={
                        code === currency
                      }
                    >
                      {code}
                    </button>
                  )
                )}
              </div>
            </div>

            <label className="field">
              <span className="field-label">
                What treatment are you considering?
              </span>

              <select
                value={selectedId}
                onChange={(e) =>
                  setSelectedId(e.target.value)
                }
              >
                {procedures.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <dl className="ledger">
              <div className="ledger-row">
                <dt>
                  Published U.S. benchmark
                </dt>

                <dd className="strike">
                  {money(
                    selected.price_us,
                    currency
                  )}
                </dd>
              </div>

              <div className="ledger-row">
                <dt>
                  Illustrative India benchmark
                </dt>

                <dd>
                  {money(
                    selected.price_india,
                    currency
                  )}
                </dd>
              </div>

              <div className="ledger-row muted">
                <dt>
                  Illustrative travel allowance
                </dt>

                <dd>
                  +{" "}
                  {money(
                    TRAVEL_ALLOWANCE_USD,
                    currency
                  )}
                </dd>
              </div>

              <div className="ledger-row total">
                <dt>
                  Estimated gross difference
                </dt>

                <dd>
                  {money(net, currency)}
                </dd>
              </div>
            </dl>

            <div className="estimate-foot">
              <span className="cut-badge">
                ~{cut}% benchmark difference
              </span>

              <span>
                Illustrative stay:{" "}
                {selected.stay_days || "varies"} days
              </span>
            </div>

            <a
              className="btn btn-jade btn-block"
              href="#enquire"
            >
              Price my case
            </a>

            <p className="estimate-small">
              These are illustrative benchmarks, not
              quotations or guarantees. The treating
              consultant confirms the final treatment
              plan and price after reviewing your
              reports.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

/* ================================================================
   ASSURANCES
================================================================ */

function Assurances() {
  const items = [
    [
      "Accredited hospital options",
      "We help patients identify appropriate accredited hospitals and review the treating team's credentials.",
    ],
    [
      "Second-opinion first",
      "Send your reports first. The treating team determines whether international treatment is appropriate.",
    ],
    [
      "Transparent estimates",
      "Treatment, travel and coordination costs are separated so you can compare the complete picture.",
    ],
    [
      "One coordinator",
      "A named coordinator can help with hospital communication, visa support, airport pickup and follow-up.",
    ],
  ]

  return (
    <section className="assurances">
      <div className="shell assurance-grid">
        {items.map(([title, description]) => (
          <div
            className="assurance"
            key={title}
          >
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ================================================================
   U.S. OPPORTUNITY
================================================================ */

function USOpportunity() {
  return (
    <section className="band opportunity">
      <div className="shell">
        <SectionHead
          title="Why international patients are looking at India"
          note="The opportunity is not simply about a cheaper operation. For many patients, the decision combines treatment cost, access, specialist availability and the ability to plan care with a dedicated coordinator."
        />

        <div className="opportunity-grid">
          <article className="opportunity-card">
            <span className="opportunity-number">
              01
            </span>

            <h3 className={display.className}>
              Cost can be dramatically different
            </h3>

            <p>
              Published international-treatment
              benchmarks show large gross price
              differences for several major procedures.
              Your actual insurance coverage and
              out-of-pocket amount may be very
              different, so we compare the complete
              case rather than promising a percentage
              saving.
            </p>
          </article>

          <article className="opportunity-card">
            <span className="opportunity-number">
              02
            </span>

            <h3 className={display.className}>
              Planned care can be researched properly
            </h3>

            <p>
              Elective treatment gives families time
              to obtain a second opinion, compare
              hospitals, review the proposed procedure
              and understand the expected recovery
              before travelling.
            </p>
          </article>

          <article className="opportunity-card">
            <span className="opportunity-number">
              03
            </span>

            <h3 className={display.className}>
              One place for the whole journey
            </h3>

            <p>
              MedPact connects medical review with
              hospital coordination, travel planning,
              accommodation, airport assistance and
              follow-up communication after the patient
              returns home.
            </p>
          </article>
        </div>

        <div className="market-strip">
          <div>
            <strong>
              Medical-tourism evidence
            </strong>

            <span>
              Published research has identified
              dental treatment as a major component of
              U.S. medical tourism, while bariatric
              research has also documented Americans
              travelling internationally for surgery.
            </span>
          </div>

          <a
            className="btn btn-plain"
            href="#enquire"
          >
            Discuss your case
          </a>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   SPECIALITIES
================================================================ */

function Specialities({
  procedures,
  currency,
}) {
  const groups = useMemo(() => {
    const byCategory = {}

    procedures.forEach((p) => {
      const category =
        p.category ||
        p.department ||
        "Other"

      byCategory[category] =
        byCategory[category] || []

      byCategory[category].push(p)
    })

    const preferred = [
      "Dental",
      "Orthopaedic",
      "Cardiac",
      "Neuro & Spine",
      "Bariatric",
      "Ophthalmology",
      "Neurosurgery",
    ]

    const ordered = preferred
      .filter((category) => byCategory[category])
      .map((category) => [
        category,
        byCategory[category],
      ])

    const remaining = Object.entries(
      byCategory
    ).filter(
      ([category]) =>
        !preferred.includes(category)
    )

    return [...ordered, ...remaining]
  }, [procedures])

  const blurbs = {
    Cardiac:
      "CABG, valve procedures and planned angioplasty with consultant-led review before international travel.",

    Dental:
      "Implants and complex restorative treatment, including full-mouth rehabilitation.",

    "Neuro & Spine":
      "Spinal fusion and other complex spine pathways requiring specialist case review.",

    Orthopaedic:
      "Knee and hip replacement and other planned joint procedures.",

    Bariatric:
      "Sleeve gastrectomy and selected weight-management surgical pathways.",

    Ophthalmology:
      "Cataract surgery and other planned eye procedures.",

    Neurosurgery:
      "Complex neurosurgical cases, including selected brain-tumour pathways.",
  }

  return (
    <section
      id="specialities"
      className="band"
    >
      <div className="shell">
        <SectionHead
          title="Ten procedures worth comparing"
          note="These are the treatment categories we identified as having strong potential for international-patient enquiries. Prices are benchmarks, not guaranteed quotations."
        />

        <div className="spec-list">
          {groups.map(([category, list]) => {
            const from = Math.min(
              ...list.map((p) =>
                Number(p.price_india)
              )
            )

            return (
              <article
                className="spec"
                key={category}
              >
                <div className="spec-main">
                  <h3
                    className={
                      display.className
                    }
                  >
                    {category}
                  </h3>

                  <p>
                    {blurbs[category] ||
                      "Consultant-led treatment with a written package estimate."}
                  </p>

                  <ul className="spec-procs">
                    {list.map((p) => (
                      <li key={p.id}>
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="spec-side">
                  <span className="spec-from">
                    benchmark from
                  </span>

                  <span
                    className={
                      display.className +
                      " spec-price"
                    }
                  >
                    {money(
                      from,
                      currency
                    )}
                  </span>

                  <a
                    className="link-underline"
                    href="#enquire"
                  >
                    Ask about{" "}
                    {category.toLowerCase()}
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

/* ================================================================
   PRICE COMPARISON
================================================================ */

function Comparison({
  procedures,
  currency,
}) {
  const [ref, seen] = useInView(0.2)

  const rows = procedures.slice(0, 10)

  const ceiling = Math.max(
    ...rows.map((p) =>
      Number(p.price_us)
    )
  )

  return (
    <section
      id="prices"
      className="band band-ink"
      ref={ref}
    >
      <div className="shell">
        <SectionHead
          invert
          title="What the same treatment can cost"
          note="The bars show the relative scale of published/benchmark treatment figures. They are not patient out-of-pocket costs and do not represent a guaranteed MedPact quote."
        />

        <div className="chart">
          {rows.map((p) => {
            const us =
              Number(p.price_us)

            const india =
              Number(p.price_india)

            const usWidth =
              seen
                ? (us / ceiling) * 100
                : 0

            const indiaWidth =
              seen
                ? (india / ceiling) * 100
                : 0

            const saving = Math.round(
              (1 - india / us) * 100
            )

            return (
              <div
                className="chart-row"
                key={p.id}
              >
                <div className="chart-label">
                  <span className="chart-name">
                    {p.name}
                  </span>

                  <span className="chart-cut">
                    ~{saving}% benchmark difference
                  </span>
                </div>

                <div className="bars">
                  <div className="bar-line">
                    <span className="bar-key">
                      USA
                    </span>

                    <div className="track">
                      <div
                        className="fill fill-us"
                        style={{
                          width:
                            usWidth + "%",
                        }}
                      />
                    </div>

                    <span className="bar-val">
                      {money(
                        us,
                        currency
                      )}
                    </span>
                  </div>

                  <div className="bar-line">
                    <span className="bar-key">
                      India
                    </span>

                    <div className="track">
                      <div
                        className="fill fill-in"
                        style={{
                          width:
                            indiaWidth + "%",
                        }}
                      />
                    </div>

                    <span className="bar-val">
                      {money(
                        india,
                        currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="data-note data-note-dark">
          Benchmark figures are intended to illustrate
          the scale of the international price
          difference. They are not quotations, do not
          represent U.S. patient out-of-pocket costs,
          and should not be used to decide whether a
          particular patient should travel. A consultant
          must review the case first.
        </p>
      </div>
    </section>
  )
}

/* ================================================================
   TRAVEL ECONOMICS
================================================================ */

function TravelEconomics({
  procedures,
  currency,
}) {
  const featured = procedures
    .filter((p) =>
      [
        "Dental",
        "Orthopaedic",
        "Bariatric",
        "Cardiac",
      ].includes(p.category)
    )
    .slice(0, 6)

  return (
    <section className="band band-paper economics">
      <div className="shell">
        <SectionHead
          title="The number that matters is your total cost"
          note="A lower hospital price does not automatically mean a lower personal cost. Compare treatment, travel, accommodation, insurance and the time away from home."
        />

        <div className="economics-grid">
          <div className="economics-card-main">
            <div className="economics-eyebrow">
              COMPARE BEFORE YOU FLY
            </div>

            <h3
              className={display.className}
            >
              U.S. estimate → India treatment
              plan → full trip cost
            </h3>

            <p>
              Send the estimate or treatment
              recommendation you already have. We can
              use it as a starting point for a
              consultant-led comparison.
            </p>

            <a
              className="btn btn-dark"
              href="#enquire"
            >
              Compare my case
            </a>
          </div>

          <div className="economics-list">
            {featured.map((p) => {
              const gross =
                Number(p.price_us) -
                Number(p.price_india)

              const afterTravel = Math.max(
                0,
                gross -
                  TRAVEL_ALLOWANCE_USD
              )

              return (
                <div
                  className="economics-row"
                  key={p.id}
                >
                  <div>
                    <strong>
                      {p.name}
                    </strong>

                    <span>
                      {p.category}
                    </span>
                  </div>

                  <div className="economics-numbers">
                    <span>
                      {money(
                        p.price_us,
                        currency
                      )}{" "}
                      U.S. benchmark
                    </span>

                    <span>
                      {money(
                        p.price_india,
                        currency
                      )}{" "}
                      India benchmark
                    </span>

                    <b>
                      {money(
                        afterTravel,
                        currency
                      )}{" "}
                      after illustrative travel
                    </b>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="data-note">
          <strong>Important:</strong>{" "}
          benchmark figures are for orientation only.
          U.S. hospital charges, negotiated insurance
          rates and patient out-of-pocket costs vary
          widely. Indian hospital prices also vary by
          surgeon, implant, procedure complexity, room
          category and length of stay.
        </p>
      </div>
    </section>
  )
}

/* ================================================================
   JOURNEY
================================================================ */

function Journey() {
  return (
    <section
      id="journey"
      className="band"
    >
      <div className="shell">
        <SectionHead
          title="From your first message to your follow-up"
          note="A clear process from medical-record review to treatment coordination and follow-up."
        />

        <ol className="steps">
          {JOURNEY.map((step, index) => (
            <li
              className="step"
              key={step.t}
            >
              <span className="step-num">
                {index + 1}
              </span>

              <div>
                <h3>{step.t}</h3>
                <p>{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ================================================================
   DOCTORS
================================================================ */

function Doctors({ doctors }) {
  return (
    <section
      id="doctors"
      className="band band-paper"
    >
      <div className="shell">
        <SectionHead
          title="Who will treat you"
          note="The treating consultant's name should be known before you commit to treatment."
        />

        <div className="roster">
          {doctors.slice(0, 8).map((doctor) => (
            <article
              className="doc"
              key={doctor.id}
            >
              {doctor.photo_url ? (
                <img
                  className="doc-photo"
                  src={doctor.photo_url}
                  alt=""
                />
              ) : (
                <span
                  className={
                    display.className +
                    " doc-medallion"
                  }
                >
                  {initials(doctor.name)}
                </span>
              )}

              <div>
                <h3>{doctor.name}</h3>

                <p className="doc-spec">
                  {doctor.specialty ||
                    doctor.specialties?.name ||
                    "Consultant"}
                </p>

                <p className="doc-meta">
                  {doctor.experience_years
                    ? doctor.experience_years +
                      " years in practice"
                    : "Consultant"}

                  {doctor.hospital
                    ? " · " +
                      doctor.hospital
                    : ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   TESTIMONIALS
================================================================ */

function Stories({ stories }) {
  const withVideo = stories.filter(
    (story) => story.video_url
  )

  const lead = stories[0]

  return (
    <section className="band">
      <div className="shell">
        <SectionHead
          title="Patients who went"
          note="Patient stories and videos should be published only with appropriate consent."
        />

        {lead && (
          <figure className="pullquote">
            <blockquote
              className={display.className}
            >
              {lead.quote ||
                lead.message ||
                lead.text ||
                "A patient story will appear here."}
            </blockquote>

            <figcaption>
              {lead.name}

              {lead.country
                ? ", " + lead.country
                : ""}

              {lead.procedure
                ? " — " +
                  lead.procedure
                : ""}
            </figcaption>
          </figure>
        )}

        {withVideo.length > 0 && (
          <div className="videos">
            {withVideo
              .slice(0, 3)
              .map((story) => (
                <figure
                  className="video"
                  key={story.id}
                >
                  <div className="video-frame">
                    <iframe
                      src={embedUrl(
                        story.video_url
                      )}
                      title={
                        "Patient story — " +
                        story.name
                      }
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <figcaption>
                    <strong>
                      {story.name}
                    </strong>

                    {story.country ? (
                      <span>
                        {story.country}
                      </span>
                    ) : null}

                    {story.procedure ? (
                      <span>
                        {story.procedure}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ================================================================
   FAQ
================================================================ */

function Faq({
  open,
  setOpen,
}) {
  return (
    <section
      id="answers"
      className="band band-paper"
    >
      <div className="shell faq-shell">
        <SectionHead title="The questions people actually ask" />

        <div className="faq">
          {FAQS.map((faq, index) => {
            const isOpen =
              open === index

            return (
              <div
                className={
                  "faq-item" +
                  (isOpen
                    ? " is-open"
                    : "")
                }
                key={faq.q}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpen(
                      isOpen
                        ? -1
                        : index
                    )
                  }
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span
                    className="faq-mark"
                    aria-hidden="true"
                  />
                </button>

                <div
                  className="faq-body"
                  hidden={!isOpen}
                >
                  <p>{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   ENQUIRY
================================================================ */

function Enquiry({ procedures }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    phone: "",
    procedure: "",
    message: "",
  })

  const [state, setState] =
    useState("idle")

  function setField(key) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [key]: event.target.value,
      }))
    }
  }

  async function submit(event) {
    event.preventDefault()

    setState("sending")

    const { error } =
      await supabase
        .from("leads")
        .insert([form])

    setState(
      error ? "error" : "sent"
    )
  }

  return (
    <section
      id="enquire"
      className="band band-ink enquire"
    >
      <div className="shell enquire-grid">
        <div className="enquire-copy">
          <h2
            className={display.className}
          >
            Send your reports.
            <br />
            Start with a case review.
          </h2>

          <p>
            Tell us what treatment you have
            been advised to undergo. Share your
            reports or the estimate you already
            received and we will help coordinate
            the next step.
          </p>

          <ul className="contact-list">
            <li>
              <span>WhatsApp</span>

              <a
                href={
                  "https://wa.me/" +
                  WHATSAPP
                }
                target="_blank"
                rel="noreferrer"
              >
                {PHONE_DISPLAY}
              </a>
            </li>

            <li>
              <span>Email</span>

              <a
                href={
                  "mailto:" + EMAIL
                }
              >
                {EMAIL}
              </a>
            </li>

            <li>
              <span>Response</span>

              <span>
                International-patient coordination
                across U.S. and other time zones.
              </span>
            </li>
          </ul>
        </div>

        {state === "sent" ? (
          <div className="form-done">
            <h3
              className={
                display.className
              }
            >
              Your case has been received.
            </h3>

            <p>
              We will review the information
              submitted. If the matter is urgent,
              please use WhatsApp as well.
            </p>

            <a
              className="btn btn-jade"
              href={
                "https://wa.me/" +
                WHATSAPP
              }
              target="_blank"
              rel="noreferrer"
            >
              Continue on WhatsApp
            </a>
          </div>
        ) : (
          <form
            className="form"
            onSubmit={submit}
          >
            <div className="form-row">
              <label className="field">
                <span className="field-label">
                  Your name
                </span>

                <input
                  required
                  value={form.name}
                  onChange={setField(
                    "name"
                  )}
                  autoComplete="name"
                />
              </label>

              <label className="field">
                <span className="field-label">
                  Country
                </span>

                <input
                  required
                  value={form.country}
                  onChange={setField(
                    "country"
                  )}
                  placeholder="United States"
                />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label">
                  Email
                </span>

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={setField(
                    "email"
                  )}
                  autoComplete="email"
                />
              </label>

              <label className="field">
                <span className="field-label">
                  Phone or WhatsApp
                </span>

                <input
                  value={form.phone}
                  onChange={setField(
                    "phone"
                  )}
                  autoComplete="tel"
                />
              </label>
            </div>

            <label className="field">
              <span className="field-label">
                What are you being treated for?
              </span>

              <select
                value={form.procedure}
                onChange={setField(
                  "procedure"
                )}
              >
                <option value="">
                  I am not sure yet
                </option>

                {procedures.map(
                  (procedure) => (
                    <option
                      key={procedure.id}
                      value={
                        procedure.name
                      }
                    >
                      {procedure.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="field">
              <span className="field-label">
                Tell the consultant about your case
              </span>

              <textarea
                rows={5}
                value={form.message}
                onChange={setField(
                  "message"
                )}
                placeholder="Diagnosis, age, treatment recommended, U.S. estimate, and when you hope to travel."
              />
            </label>

            {state === "error" && (
              <p className="form-error">
                We could not submit the
                enquiry. Please contact us on
                WhatsApp.
              </p>
            )}

            <button
              className="btn btn-jade btn-block"
              type="submit"
              disabled={
                state === "sending"
              }
            >
              {state === "sending"
                ? "Sending..."
                : "Request my case review"}
            </button>

            <p className="form-small">
              Your enquiry is used for
              coordinating your medical-tourism
              request. Do not submit emergency
              medical information through this
              form.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}

/* ================================================================
   FOOTER
================================================================ */

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <a
            className="wordmark"
            href="/"
          >
            MedPact
            <span className="wordmark-dot">
              .
            </span>
          </a>

          <p className="footer-line">
            Medical treatment coordination
            for patients considering care in
            India.
          </p>
        </div>

        <nav className="footer-nav">
          <a href="#specialities">
            Treatments
          </a>

          <a href="#prices">
            Prices
          </a>

          <a href="#journey">
            How it works
          </a>

          <a href="#doctors">
            Doctors
          </a>

          <a href="#answers">
            Answers
          </a>

          <a href="#enquire">
            Contact
          </a>
        </nav>

        <p className="footer-legal">
          MedPact coordinates international
          patient services with independent
          hospitals and does not practise
          medicine. Prices and savings shown are
          illustrative benchmarks until confirmed
          by the treating consultant.
        </p>
      </div>
    </footer>
  )
}

/* ================================================================
   SECTION HEADING
================================================================ */

function SectionHead({
  title,
  note,
  invert,
}) {
  return (
    <div
      className={
        "section-head" +
        (invert ? " is-invert" : "")
      }
    >
      <h2 className={display.className}>
        {title}
      </h2>

      {note ? <p>{note}</p> : null}
    </div>
  )
}

/* ================================================================
   WHATSAPP ICON
================================================================ */

function WhatsAppMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  )
}

/* ================================================================
   GLOBAL CSS
================================================================ */

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
        width: min(
          1140px,
          calc(100% - 48px)
        );
        margin: 0 auto;
      }

      :focus-visible {
        outline: 2px solid var(--jade);
        outline-offset: 3px;
        border-radius: 3px;
      }

      /* BUTTONS */

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
        transition:
          background 0.18s ease,
          color 0.18s ease,
          border-color 0.18s ease,
          transform 0.18s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
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
        transform: none;
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

      /* HEADER */

      .site-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: transparent;
        transition:
          background 0.2s ease,
          border-color 0.2s ease;
        border-bottom: 1px solid transparent;
      }

      .site-header.is-solid {
        background: rgba(
          251,
          250,
          247,
          0.94
        );
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

      /* HERO */

      .hero {
        padding: 56px 0 84px;
        background:
          radial-gradient(
            900px 420px at 88% -8%,
            rgba(31, 111, 92, 0.1),
            transparent 70%
          ),
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
        font-size: clamp(
          42px,
          5.4vw,
          68px
        );
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

      /* ESTIMATE */

      .estimate {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 26px;
        box-shadow:
          0 24px 60px -34px
          rgba(17, 37, 31, 0.45);
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
        text-align: right;
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
        font-size: 28px;
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
        background: rgba(
          224,
          163,
          60,
          0.18
        );
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

      /* ASSURANCES */

      .assurances {
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        background: var(--paper-warm);
        padding: 34px 0;
      }

      .assurance-grid {
        display: grid;
        grid-template-columns: repeat(
          4,
          1fr
        );
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

      /* SECTIONS */

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
        max-width: 64ch;
        margin-bottom: 48px;
      }

      .section-head h2 {
        font-size: clamp(
          30px,
          3.4vw,
          42px
        );
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
        color: rgba(
          251,
          250,
          247,
          0.66
        );
      }

      /* OPPORTUNITY */

      .opportunity {
        background:
          radial-gradient(
            800px 360px at 100% 0%,
            rgba(224, 163, 60, 0.12),
            transparent 65%
          ),
          var(--paper-warm);
      }

      .opportunity-grid {
        display: grid;
        grid-template-columns: repeat(
          3,
          1fr
        );
        gap: 18px;
      }

      .opportunity-card {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 28px;
        box-shadow:
          0 18px 50px -38px
          rgba(17, 37, 31, 0.45);
      }

      .opportunity-number {
        display: inline-grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--ink);
        color: var(--paper);
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 22px;
      }

      .opportunity-card h3 {
        font-size: 25px;
        line-height: 1.15;
        color: var(--ink);
      }

      .opportunity-card p {
        margin-top: 13px !important;
        color: var(--text-soft);
        font-size: 15.5px;
        line-height: 1.6;
      }

      .market-strip {
        margin-top: 28px;
        padding: 22px 24px;
        border: 1px solid
          rgba(31, 111, 92, 0.2);
        border-radius: 14px;
        background: rgba(
          31,
          111,
          92,
          0.06
        );
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
      }

      .market-strip div {
        display: grid;
        gap: 4px;
      }

      .market-strip strong {
        color: var(--ink);
      }

      .market-strip span {
        color: var(--text-soft);
        font-size: 14.5px;
      }

      /* SPECIALITIES */

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
        max-width: 62ch;
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

      /* PRICE CHART */

      .chart {
        display: grid;
        gap: 34px;
      }

      .chart-row {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 40px;
        align-items: center;
        padding-bottom: 28px;
        border-bottom: 1px solid
          rgba(
            251,
            250,
            247,
            0.14
          );
      }

      .chart-row:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }

      .chart-name {
        display: block;
        font-size: 18px;
        font-weight: 600;
      }

      .chart-cut {
        display: inline-block;
        margin-top: 4px;
        font-size: 13.5px;
        color: var(--marigold);
        font-weight: 600;
      }

      .bars {
        display: grid;
        gap: 10px;
      }

      .bar-line {
        display: grid;
        grid-template-columns:
          44px 1fr 110px;
        align-items: center;
        gap: 14px;
      }

      .bar-key {
        font-size: 13px;
        color: rgba(
          251,
          250,
          247,
          0.55
        );
      }

      .track {
        height: 12px;
        background: rgba(
          251,
          250,
          247,
          0.1
        );
        border-radius: 999px;
        overflow: hidden;
      }

      .fill {
        height: 100%;
        border-radius: 999px;
        width: 0;
        transition:
          width 1.1s
          cubic-bezier(
            0.22,
            1,
            0.36,
            1
          );
      }

      .fill-us {
        background: rgba(
          251,
          250,
          247,
          0.32
        );
      }

      .fill-in {
        background: var(--marigold);
      }

      .bar-val {
        text-align: right;
        font-size: 15px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      /* ECONOMICS */

      .economics-grid {
        display: grid;
        grid-template-columns:
          0.75fr 1.25fr;
        gap: 42px;
        align-items: start;
      }

      .economics-card-main {
        padding: 30px;
        border-radius: 18px;
        background: var(--ink);
        color: var(--paper);
        box-shadow:
          0 24px 60px -42px
          rgba(17, 37, 31, 0.65);
      }

      .economics-eyebrow {
        color: var(--marigold);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.1em;
      }

      .economics-card-main h3 {
        margin-top: 15px;
        font-size: 34px;
        line-height: 1.08;
      }

      .economics-card-main p {
        margin-top: 18px !important;
        color: rgba(
          251,
          250,
          247,
          0.72
        );
        font-size: 15.5px;
      }

      .economics-card-main .btn {
        margin-top: 24px;
        background: var(--paper);
        color: var(--ink);
      }

      .economics-list {
        border-top: 1px solid var(--line);
      }

      .economics-row {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        padding: 18px 0;
        border-bottom: 1px solid var(--line);
      }

      .economics-row
        > div:first-child {
        display: grid;
        gap: 3px;
      }

      .economics-row strong {
        color: var(--ink);
        font-size: 15.5px;
      }

      .economics-row
        > div:first-child
        span {
        color: var(--jade);
        font-size: 13px;
        font-weight: 600;
      }

      .economics-numbers {
        display: grid;
        gap: 2px;
        text-align: right;
        font-size: 12.5px;
        color: var(--text-soft);
      }

      .economics-numbers b {
        color: var(--jade);
        font-size: 13px;
      }

      .data-note {
        margin-top: 26px !important;
        color: var(--text-soft);
        font-size: 13px;
        line-height: 1.55;
      }

      .data-note-dark {
        color: rgba(
          251,
          250,
          247,
          0.55
        );
        max-width: 82ch;
      }

      /* JOURNEY */

      .steps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns:
          repeat(2, 1fr);
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

      /* DOCTORS */

      .roster {
        display: grid;
        grid-template-columns:
          repeat(2, 1fr);
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

      /* STORIES */

      .pullquote {
        margin: 0 0 56px;
        max-width: 62ch;
      }

      .pullquote blockquote {
        margin: 0;
        font-size: clamp(
          24px,
          2.8vw,
          34px
        );
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
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(260px, 1fr)
          );
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

      /* FAQ */

      .faq-shell {
        width: min(
          820px,
          calc(100% - 48px)
        );
      }

      .faq {
        border-top: 1px solid var(--line);
      }

      .faq-item {
        border-bottom: 1px solid var(--line);
      }

      .faq-item button {
        width: 100%;
        border: 0;
        background: transparent;
        padding: 22px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        text-align: left;
        font: inherit;
        font-size: 17px;
        font-weight: 600;
        color: var(--ink);
        cursor: pointer;
      }

      .faq-mark {
        position: relative;
        flex: none;
        width: 22px;
        height: 22px;
      }

      .faq-mark::before,
      .faq-mark::after {
        content: "";
        position: absolute;
        background: var(--jade);
        left: 50%;
        top: 50%;
        transform: translate(
          -50%,
          -50%
        );
      }

      .faq-mark::before {
        width: 12px;
        height: 2px;
      }

      .faq-mark::after {
        width: 2px;
        height: 12px;
        transition: transform 0.2s;
      }

      .faq-item.is-open
        .faq-mark::after {
        transform:
          translate(-50%, -50%)
          rotate(90deg);
      }

      .faq-body {
        padding: 0 40px 24px 0;
      }

      .faq-body p {
        color: var(--text-soft);
        font-size: 15.5px;
      }

      /* ENQUIRY */

      .enquire {
        color: var(--paper);
      }

      .enquire-grid {
        display: grid;
        grid-template-columns:
          0.8fr 1.2fr;
        gap: 70px;
        align-items: start;
      }

      .enquire-copy h2 {
        font-size: clamp(
          36px,
          4vw,
          56px
        );
        line-height: 1.06;
      }

      .enquire-copy > p {
        margin-top: 22px !important;
        color: rgba(
          251,
          250,
          247,
          0.7
        );
        max-width: 48ch;
      }

      .contact-list {
        list-style: none;
        margin: 32px 0 0;
        padding: 0;
        display: grid;
        gap: 14px;
      }

      .contact-list li {
        display: grid;
        gap: 2px;
      }

      .contact-list li span:first-child {
        color: var(--marigold);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .contact-list a,
      .contact-list li span:last-child {
        color: rgba(
          251,
          250,
          247,
          0.8
        );
        text-decoration: none;
      }

      .form {
        background: #fff;
        color: var(--text);
        border-radius: 18px;
        padding: 28px;
      }

      .form-row {
        display: grid;
        grid-template-columns:
          repeat(2, 1fr);
        gap: 16px;
      }

      .form .field {
        margin-top: 16px;
      }

      .form .field:first-child {
        margin-top: 0;
      }

      .form-row .field {
        margin-top: 0;
      }

      .form-small {
        margin-top: 12px !important;
        color: var(--text-soft);
        font-size: 12.5px;
        line-height: 1.5;
      }

      .form-error {
        margin-top: 15px !important;
        color: #a23b32;
        font-size: 14px;
      }

      .form-done {
        background: #fff;
        color: var(--text);
        border-radius: 18px;
        padding: 40px;
      }

      .form-done h3 {
        font-size: 34px;
        color: var(--ink);
      }

      .form-done p {
        margin-top: 14px !important;
        color: var(--text-soft);
      }

      .form-done .btn {
        margin-top: 24px;
      }

      /* FOOTER */

      .site-footer {
        padding: 52px 0;
        background: #e9e7df;
      }

      .footer-grid {
        display: grid;
        grid-template-columns:
          1fr auto 1fr;
        gap: 40px;
        align-items: start;
      }

      .footer-line {
        margin-top: 12px !important;
        max-width: 32ch;
        color: var(--text-soft);
        font-size: 14px;
      }

      .footer-nav {
        display: grid;
        gap: 7px;
      }

      .footer-nav a {
        color: var(--text-soft);
        font-size: 14px;
        text-decoration: none;
      }

      .footer-nav a:hover {
        color: var(--ink);
      }

      .footer-legal {
        color: var(--text-soft);
        font-size: 12.5px;
        line-height: 1.5;
        max-width: 38ch;
      }

      /* WHATSAPP */

      .whatsapp-float {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 100;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 17px;
        border-radius: 999px;
        background: var(--jade);
        color: #fff !important;
        text-decoration: none;
        font-weight: 700;
        font-size: 14px;
        box-shadow:
          0 12px 30px
          rgba(17, 37, 31, 0.25);
      }

      .whatsapp-float:hover {
        background: #195b4c;
      }

      /* TABLET */

      @media (max-width: 1000px) {
        .hero-grid {
          grid-template-columns: 1fr;
          gap: 42px;
        }

        .hero-copy {
          max-width: 760px;
        }

        .assurance-grid {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .opportunity-grid,
        .economics-grid {
          grid-template-columns: 1fr;
        }

        .enquire-grid {
          grid-template-columns: 1fr;
          gap: 40px;
        }

        .footer-grid {
          grid-template-columns:
            1fr 1fr;
        }

        .footer-legal {
          grid-column: 1 / -1;
        }

        .chart-row {
          grid-template-columns: 1fr;
          gap: 16px;
        }
      }

      /* MOBILE */

      @media (max-width: 720px) {
        .shell {
          width: min(
            100% - 30px,
            1140px
          );
        }

        .header-inner {
          height: 64px;
        }

        .header-nav {
          display: none;
        }

        .header-inner .btn {
          margin-left: auto;
        }

        .hero {
          padding: 38px 0 55px;
        }

        .hero-title {
          font-size: 43px;
        }

        .hero-lede {
          font-size: 16.5px;
        }

        .hero-actions {
          display: grid;
          grid-template-columns: 1fr;
        }

        .hero-actions .btn {
          width: 100%;
        }

        .estimate {
          padding: 20px;
        }

        .estimate-head {
          align-items: flex-start;
          flex-direction: column;
        }

        .ledger-row {
          align-items: flex-start;
        }

        .ledger-row dd {
          max-width: 52%;
        }

        .ledger-row.total {
          align-items: flex-start;
        }

        .ledger-row.total dd {
          font-size: 23px;
        }

        .assurance-grid {
          grid-template-columns: 1fr;
          gap: 22px;
        }

        .band {
          padding: 62px 0;
        }

        .section-head {
          margin-bottom: 34px;
        }

        .section-head h2 {
          font-size: 34px;
        }

        .opportunity-grid {
          grid-template-columns: 1fr;
        }

        .opportunity-card {
          padding: 23px;
        }

        .market-strip {
          align-items: flex-start;
          flex-direction: column;
        }

        .market-strip .btn {
          width: 100%;
        }

        .spec {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .spec-side {
          align-items: flex-start;
          text-align: left;
        }

        .spec-price {
          font-size: 30px;
        }

        .chart-row {
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .bar-line {
          grid-template-columns:
            38px 1fr 78px;
          gap: 8px;
        }

        .bar-val {
          font-size: 12px;
        }

        .economics-row {
          display: grid;
          gap: 10px;
        }

        .economics-numbers {
          text-align: left;
        }

        .economics-card-main {
          padding: 24px;
        }

        .economics-card-main h3 {
          font-size: 30px;
        }

        .steps,
        .roster {
          grid-template-columns: 1fr;
        }

        .form-row {
          grid-template-columns: 1fr;
          gap: 0;
        }

        .form-row .field {
          margin-top: 16px;
        }

        .form {
          padding: 21px;
        }

        .enquire-copy h2 {
          font-size: 40px;
        }

        .footer-grid {
          grid-template-columns: 1fr;
          gap: 25px;
        }

        .footer-legal {
          grid-column: auto;
        }

        .faq-shell {
          width: min(
            100% - 30px,
            820px
          );
        }

        .whatsapp-float {
          right: 14px;
          bottom: 14px;
          padding: 12px 15px;
        }
      }

      @media (max-width: 420px) {
        .hero-title {
          font-size: 39px;
        }

        .estimate-foot {
          align-items: flex-start;
          flex-direction: column;
        }

        .bar-line {
          grid-template-columns:
            34px 1fr 66px;
        }

        .bar-val {
          font-size: 11px;
        }

        .whatsapp-float span {
          display: none;
        }

        .whatsapp-float {
          width: 48px;
          height: 48px;
          padding: 0;
          justify-content: center;
        }
      }
    `}</style>
  )
}
