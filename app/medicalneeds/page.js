"use client"

import { useMemo, useState } from "react"
import { Newsreader, Public_Sans } from "next/font/google"
import { procedures, procedureCategories } from "../../data/procedures"

const displayFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
})

const bodyFont = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
})

const WHATSAPP_NUMBER = "919000000000"
const EMAIL = "care@medpact.in"
const PHONE = "+91 90000 00000"

const discoveryItems = [
  {
    icon: "01",
    title: "Doctors",
    text: "Explore specialists by expertise, procedure and location.",
    href: "/medicalneeds/doctors",
  },
  {
    icon: "02",
    title: "Hospitals",
    text: "Discover hospitals and international-patient services.",
    href: "/medicalneeds/hospitals",
  },
  {
    icon: "03",
    title: "Treatments",
    text: "Understand procedures, recovery and treatment pathways.",
    href: "#treatments",
  },
  {
    icon: "04",
    title: "Cost Guide",
    text: "Compare indicative treatment costs before you travel.",
    href: "#cost-guide",
  },
]

const journeySteps = [
  ["01", "Tell us what you need", "Start with a treatment, condition, procedure or medical question."],
  ["02", "Share your medical records", "Provide reports, scans and relevant treatment history for review."],
  ["03", "Specialist & hospital matching", "We help identify appropriate specialists and hospital options."],
  ["04", "Compare your options", "Understand treatment pathways, indicative costs and practical considerations."],
  ["05", "Confirm your plan", "Choose the option that makes sense for your situation."],
  ["06", "Coordinate your journey", "Appointments, travel planning and local coordination can be arranged."],
  ["07", "Treatment in India", "Receive care through the selected hospital and specialist team."],
  ["08", "Follow-up", "Continue your recovery and coordinate follow-up as appropriate."],
]

const faqs = [
  ["How do I get a treatment estimate?", "Share your medical reports and relevant treatment history. Medpact can coordinate a preliminary review and help you understand an indicative treatment pathway and cost range."],
  ["Do I need to travel to India before speaking to a doctor?", "No. The initial review can usually begin remotely. Your records can be shared digitally before you decide whether to travel."],
  ["Can Medpact arrange hospital appointments?", "Medpact can coordinate communication with hospitals and specialists, subject to availability and the clinical suitability of the requested care."],
  ["Are the prices on this website guaranteed?", "No. Cost figures shown during this initial launch are illustrative benchmarks. Final costs depend on the hospital, specialist, diagnosis, complexity, implants, investigations, length of stay and other factors."],
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank", "noopener,noreferrer")
}

function formatUSD(value) {
  return `$${value.toLocaleString("en-US")}`
}

export default function MedicalNeedsPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [openFaq, setOpenFaq] = useState(null)

  const filteredProcedures = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return procedures
      .filter((item) => activeCategory === "All" || item.category === activeCategory)
      .filter((item) => {
        if (!normalized) return true
        return [
          item.name,
          item.specialty,
          item.category,
          item.description,
        ].some((value) => value.toLowerCase().includes(normalized))
      })
      .slice(0, 6)
  }, [activeCategory, query])

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []

    const results = []

    procedures.forEach((item) => {
      if (
        item.name.toLowerCase().includes(normalized) ||
        item.specialty.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized)
      ) {
        results.push({
          type: "Treatment",
          title: item.name,
          meta: `${item.specialty} · ${item.stay}`,
          href: `#treatment-${item.slug}`,
        })
      }
    })

    if ("doctor".includes(normalized) || "specialist".includes(normalized)) {
      results.push({
        type: "Directory",
        title: "Doctors Directory",
        meta: "Explore specialists",
        href: "/medicalneeds/doctors",
      })
    }

    if ("hospital".includes(normalized)) {
      results.push({
        type: "Directory",
        title: "Hospitals Directory",
        meta: "Explore hospitals",
        href: "/medicalneeds/hospitals",
      })
    }

    return results.slice(0, 6)
  }, [query])

  function startMedicalReview() {
    openWhatsApp(
      "Hello Medpact, I would like to request a medical review and explore treatment options in India."
    )
  }

  return (
    <main className={`${displayFont.variable} ${bodyFont.variable} site`}>
      <header className="header">
        <div className="container header-inner">
          <button className="brand" onClick={() => scrollToId("top")} aria-label="Medpact home">
            <span className="brand-mark">M</span>
            <span className="brand-copy">
              <strong>medpact</strong>
              <small>MEDICAL NEEDS</small>
            </span>
          </button>

          <nav className={`desktop-nav ${mobileMenu ? "mobile-open" : ""}`}>
            <a href="#treatments" onClick={() => setMobileMenu(false)}>Treatments</a>
            <a href="/medicalneeds/doctors" onClick={() => setMobileMenu(false)}>Doctors</a>
            <a href="/medicalneeds/hospitals" onClick={() => setMobileMenu(false)}>Hospitals</a>
            <a href="#cost-guide" onClick={() => setMobileMenu(false)}>Cost Guide</a>
            <a href="#journey" onClick={() => setMobileMenu(false)}>How It Works</a>
            <a href="#partners" onClick={() => setMobileMenu(false)}>For Partners</a>
          </nav>

          <div className="header-actions">
            <button className="header-review" onClick={startMedicalReview}>
              Get Medical Review <span>↗</span>
            </button>
            <button
              className="menu-toggle"
              onClick={() => setMobileMenu((value) => !value)}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenu}
            >
              {mobileMenu ? "×" : "☰"}
            </button>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span /> MEDPACT MEDICAL NEEDS</div>
            <h1>
              Find the right care in India.
              <em>Know your options before you travel.</em>
            </h1>
            <p className="hero-lead">
              Explore specialists, hospitals, treatments and indicative costs —
              then let Medpact help coordinate the journey.
            </p>

            <div className="search-shell">
              <div className="search-row">
                <span className="search-icon">⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What treatment, condition or specialist are you looking for?"
                  aria-label="Search medical needs"
                />
                <button onClick={() => scrollToId("treatments")}>Search</button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result) => (
                    <a key={`${result.type}-${result.title}`} href={result.href} onClick={() => setQuery("")}>
                      <span className="result-type">{result.type}</span>
                      <strong>{result.title}</strong>
                      <small>{result.meta}</small>
                      <span className="result-arrow">→</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="popular-searches">
              <span>Popular</span>
              {["Knee Replacement", "Heart Bypass", "Dental Implants", "Spine Surgery"].map((item) => (
                <button key={item} onClick={() => setQuery(item)}>
                  {item}
                </button>
              ))}
            </div>

            <div className="hero-actions">
              <button className="button primary" onClick={startMedicalReview}>
                Get a Medical Review <span>→</span>
              </button>
              <a className="button secondary" href="#cost-guide">
                Compare treatment costs
              </a>
            </div>

            <div className="trust-row">
              <span><b>01</b> Medical record review</span>
              <span><b>02</b> Specialist coordination</span>
              <span><b>03</b> Journey assistance</span>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-top">
              <span>YOUR CARE OPTIONS</span>
              <span className="live-dot"><i /> Explore</span>
            </div>

            <div className="panel-main">
              <div className="panel-kicker">A better starting point</div>
              <h2>Understand your choices before making a decision.</h2>
              <p>
                Search the care you need, compare options and speak with Medpact
                when you want help navigating the next step.
              </p>

              <div className="panel-path">
                <div><span>01</span><strong>Discover</strong><small>Doctors · hospitals · treatments</small></div>
                <div><span>02</span><strong>Compare</strong><small>Costs · locations · options</small></div>
                <div><span>03</span><strong>Coordinate</strong><small>Medical review · appointments</small></div>
              </div>
            </div>

            <div className="panel-footer">
              <span>INTERNATIONAL PATIENT SUPPORT</span>
              <strong>Medpact</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="discovery-strip">
        <div className="container discovery-grid">
          {discoveryItems.map((item) => (
            <a className="discovery-card" href={item.href} key={item.title}>
              <span className="discovery-number">{item.icon}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <span className="card-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section intro-section">
        <div className="container two-col">
          <div>
            <div className="eyebrow">WHY MEDPACT</div>
            <h2>
              Healthcare decisions are easier when
              <em>the information is in one place.</em>
            </h2>
          </div>
          <div className="intro-copy">
            <p>
              Finding treatment abroad can involve doctors, hospitals, costs,
              travel and dozens of practical questions. Medpact brings those
              pieces together into one structured experience.
            </p>
            <p>
              We help you explore your options first — and step in with human
              coordination when you are ready.
            </p>
          </div>
        </div>
      </section>

      <section className="section treatments-section" id="treatments">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TREATMENTS & PROCEDURES</div>
              <h2>Start with the <em>right treatment pathway.</em></h2>
            </div>
            <p>
              Explore common procedures considered by international patients.
              Cost figures on this initial version are illustrative benchmarks
              and will be replaced with verified Medpact data.
            </p>
          </div>

          <div className="category-scroll">
            {procedureCategories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="procedure-grid">
            {filteredProcedures.map((procedure) => (
              <article className="procedure-card" id={`treatment-${procedure.slug}`} key={procedure.id}>
                <div className="procedure-icon">{procedure.icon}</div>
                <div className="procedure-meta">
                  <span>{procedure.category}</span>
                  <span>{procedure.stay}</span>
                </div>
                <h3>{procedure.name}</h3>
                <p>{procedure.description}</p>

                <div className="cost-mini">
                  <div>
                    <span>Indicative India range</span>
                    <strong>{formatUSD(procedure.indiaCost.min)} – {formatUSD(procedure.indiaCost.max)}</strong>
                  </div>
                  <div>
                    <span>International benchmark</span>
                    <strong>{formatUSD(procedure.internationalBenchmark.min)} – {formatUSD(procedure.internationalBenchmark.max)}</strong>
                  </div>
                </div>

                <div className="card-link">Explore treatment <span>→</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section cost-section" id="cost-guide">
        <div className="container">
          <div className="cost-card">
            <div className="cost-copy">
              <div className="eyebrow light">COST INTELLIGENCE</div>
              <h2>
                See the cost equation
                <em>before you travel.</em>
              </h2>
              <p>
                Treatment price is only one part of the decision. We are building
                Medpact to help you understand hospital, specialist, implant,
                diagnostics, accommodation and travel considerations together.
              </p>
              <button className="button light-button" onClick={() => scrollToId("treatments")}>
                Explore cost guide <span>→</span>
              </button>
            </div>

            <div className="cost-visual">
              <div className="cost-header">
                <span>ILLUSTRATIVE COMPARISON</span>
                <span>USD</span>
              </div>
              {procedures.slice(0, 3).map((procedure) => (
                <div className="cost-row" key={procedure.id}>
                  <div className="cost-label">
                    <strong>{procedure.name}</strong>
                    <span>India vs international benchmark</span>
                  </div>
                  <div className="cost-bars">
                    <div><i style={{ width: `${Math.max(10, (procedure.indiaCost.max / procedure.internationalBenchmark.max) * 100)}%` }} /></div>
                    <div className="benchmark"><i style={{ width: "100%" }} /></div>
                  </div>
                  <div className="cost-values">
                    <strong>{formatUSD(procedure.indiaCost.min)}–{formatUSD(procedure.indiaCost.max)}</strong>
                    <span>{formatUSD(procedure.internationalBenchmark.min)}–{formatUSD(procedure.internationalBenchmark.max)}</span>
                  </div>
                </div>
              ))}
              <div className="cost-note">
                Illustrative benchmarks only. Final pricing depends on the patient,
                hospital, specialist, treatment plan and inclusions.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section directory-preview" id="doctors">
        <div className="container directory-grid">
          <div className="directory-intro">
            <div className="eyebrow">DOCTOR DIRECTORY</div>
            <h2>Find the specialist who fits the <em>clinical question.</em></h2>
            <p>
              We are building a verified specialist directory searchable by
              specialty, sub-specialty, procedure, city, hospital and experience.
            </p>
            <button className="text-button" onClick={startMedicalReview}>
              Need help finding a specialist? <span>Ask Medpact →</span>
            </button>
          </div>

          <div className="directory-placeholder">
            <div className="directory-placeholder-top">
              <span>DOCTORS</span>
              <span className="status-pill">DIRECTORY READY</span>
            </div>
            <div className="placeholder-lines">
              <div><span className="avatar-placeholder">DR</span><b>Verified specialist profiles</b><small>Specialty · experience · procedures</small></div>
              <div><span className="avatar-placeholder">DR</span><b>Search by treatment</b><small>Find doctors associated with a procedure</small></div>
              <div><span className="avatar-placeholder">DR</span><b>Compare options</b><small>Shortlist specialists for review</small></div>
            </div>
            <div className="placeholder-footer">Verified records will be added before publication.</div>
          </div>
        </div>
      </section>

      <section className="section hospital-section" id="hospitals">
        <div className="container hospital-layout">
          <div className="hospital-visual">
            <div className="visual-label">HOSPITAL DIRECTORY</div>
            <div className="visual-center">
              <span>◎</span>
              <strong>India</strong>
              <small>Explore care options by city</small>
            </div>
            <div className="city-chip chip-one">Chennai</div>
            <div className="city-chip chip-two">Hyderabad</div>
            <div className="city-chip chip-three">Bengaluru</div>
            <div className="city-chip chip-four">Mumbai</div>
          </div>

          <div className="hospital-copy">
            <div className="eyebrow">HOSPITALS</div>
            <h2>Choose the <em>right care environment.</em></h2>
            <p>
              Explore hospitals by city, specialty, procedure and international
              patient services. Accreditation and service claims will only be
              displayed after verification.
            </p>
            <div className="feature-list">
              <span>✓ Specialty & procedure coverage</span>
              <span>✓ International patient services</span>
              <span>✓ Location & practical information</span>
              <span>✓ Verified accreditation where applicable</span>
            </div>
            <button className="button primary" onClick={() => scrollToId("partners")}>
              Explore the Medpact network <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section journey-section" id="journey">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">YOUR JOURNEY</div>
              <h2>From medical question to <em>coordinated care.</em></h2>
            </div>
            <p>
              Medical travel can feel complicated. Our role is to make the
              process more structured, transparent and easier to navigate.
            </p>
          </div>

          <div className="journey-grid">
            {journeySteps.map(([number, title, text]) => (
              <div className="journey-card" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>

          <div className="journey-cta">
            <div>
              <span>READY TO EXPLORE?</span>
              <h3>Let your medical records start the conversation.</h3>
            </div>
            <button className="button primary" onClick={startMedicalReview}>
              Get a Medical Review <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section partner-section" id="partners">
        <div className="container partner-card">
          <div>
            <div className="eyebrow light">FOR HEALTHCARE PARTNERS</div>
            <h2>Extend your care options with <em>Medpact.</em></h2>
          </div>
          <div>
            <p>
              Medpact can work with healthcare cost-navigation companies, patient
              advocacy organizations, medical tourism companies, employers,
              benefits organizations and international healthcare partners.
            </p>
            <a className="light-link" href={`mailto:${EMAIL}`}>
              Discuss a partnership <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="container faq-layout">
          <div>
            <div className="eyebrow">QUESTIONS</div>
            <h2>Good decisions start with <em>clear answers.</em></h2>
            <p>
              If your question is more specific, send your medical enquiry and
              the Medpact team can help you understand the next step.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <span>{question}</span>
                  <b>{openFaq === index ? "−" : "+"}</b>
                </button>
                {openFaq === index && <p>{answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="review-section" id="medical-review">
        <div className="container review-card">
          <div>
            <div className="eyebrow light">MEDPACT MEDICAL REVIEW</div>
            <h2>Not sure where to start?</h2>
            <p>
              Share what you know about your treatment need. We can help you
              understand the options worth exploring in India.
            </p>
          </div>
          <div className="review-actions">
            <button className="button light-button" onClick={startMedicalReview}>
              Start my enquiry <span>→</span>
            </button>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="footer-brand"><span className="brand-mark">M</span><strong>medpact</strong></div>
            <p>
              Medical care discovery and coordination for patients considering
              treatment in India.
            </p>
          </div>

          <div>
            <span className="footer-heading">Explore</span>
            <a href="#treatments">Treatments</a>
            <a href="/medicalneeds/doctors">Doctors</a>
            <a href="/medicalneeds/hospitals">Hospitals</a>
            <a href="#cost-guide">Cost Guide</a>
          </div>

          <div>
            <span className="footer-heading">Medpact</span>
            <a href="#journey">How It Works</a>
            <a href="#partners">For Partners</a>
            <a href="#faq">FAQs</a>
            <button onClick={startMedicalReview}>Medical Review</button>
          </div>

          <div>
            <span className="footer-heading">Contact</span>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
            <button onClick={() => openWhatsApp("Hello Medpact, I would like to explore medical treatment in India.")}>
              WhatsApp
            </button>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Medpact. All rights reserved.</span>
          <span>Information on this website is for general guidance and is not medical advice.</span>
        </div>
      </footer>

      <button className="floating-assistant" onClick={startMedicalReview}>
        <span>✦</span>
        <b>Ask Medpact</b>
      </button>

      <div className="mobile-review-bar">
        <button onClick={startMedicalReview}>Get a Medical Review <span>→</span></button>
      </div>

      <style jsx>{`
        :global(*) { box-sizing: border-box; }
        :global(html) { scroll-behavior: smooth; }
        :global(body) { margin: 0; background: #f7f8f5; color: #17201d; }
        :global(button), :global(input) { font: inherit; }
        :global(button), :global(a) { -webkit-tap-highlight-color: transparent; }
        :global(a) { color: inherit; text-decoration: none; }

        .site {
          --ink: #17201d;
          --muted: #68736d;
          --line: #dfe4df;
          --soft: #edf2ed;
          --paper: #f7f8f5;
          --white: #ffffff;
          --green: #163e35;
          --green-2: #20574a;
          --mint: #dcebe2;
          --gold: #c8a968;
          --font-display: ${displayFont.style.fontFamily};
          --font-body: ${bodyFont.style.fontFamily};
          font-family: var(--font-body);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .container {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(247, 248, 245, .9);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(223, 228, 223, .85);
        }

        .header-inner {
          min-height: 78px;
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .brand {
          border: 0;
          background: transparent;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 11px;
          cursor: pointer;
          color: var(--ink);
          text-align: left;
        }

        .brand-mark, .footer-brand .brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: var(--green);
          color: white;
          display: grid;
          place-items: center;
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 600;
        }

        .brand-copy { display: grid; line-height: 1; }
        .brand-copy strong { font-size: 21px; letter-spacing: -.7px; }
        .brand-copy small { margin-top: 5px; font-size: 7px; letter-spacing: 2.2px; font-weight: 700; color: var(--muted); }

        .desktop-nav {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .desktop-nav a {
          font-size: 13px;
          font-weight: 600;
          color: #52605a;
          transition: color .2s ease;
        }

        .desktop-nav a:hover { color: var(--green); }

        .header-actions { display: flex; align-items: center; gap: 10px; }
        .header-review, .menu-toggle {
          border: 0;
          cursor: pointer;
        }

        .header-review {
          background: var(--green);
          color: white;
          padding: 12px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .header-review span { margin-left: 7px; color: #b9d7c5; }
        .menu-toggle { display: none; background: transparent; font-size: 27px; color: var(--ink); }

        .hero {
          position: relative;
          overflow: hidden;
          padding: 92px 0 80px;
          background:
            radial-gradient(circle at 80% 22%, rgba(196, 224, 210, .55), transparent 30%),
            linear-gradient(180deg, #f7f8f5 0%, #eef3ee 100%);
        }

        .hero-orb { position: absolute; border-radius: 50%; filter: blur(2px); pointer-events: none; }
        .hero-orb-one { width: 340px; height: 340px; right: -150px; top: 100px; background: rgba(199, 220, 207, .45); }
        .hero-orb-two { width: 210px; height: 210px; left: -120px; bottom: 0; background: rgba(225, 210, 171, .18); }

        .hero-grid {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(360px, .78fr);
          gap: 80px;
          align-items: center;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #5d6b64;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2.1px;
          text-transform: uppercase;
        }

        .eyebrow span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--gold);
        }

        .eyebrow.light { color: #b7cbc2; }

        .hero h1 {
          margin: 22px 0 24px;
          max-width: 760px;
          font-family: var(--font-display);
          font-size: clamp(52px, 6.2vw, 84px);
          line-height: .94;
          letter-spacing: -3.8px;
          font-weight: 500;
        }

        .hero h1 em, h2 em {
          display: block;
          font-style: italic;
          color: #315b4f;
        }

        .hero-lead {
          max-width: 650px;
          color: #65716b;
          font-size: 17px;
          line-height: 1.7;
          margin: 0 0 28px;
        }

        .search-shell {
          position: relative;
          max-width: 700px;
          z-index: 10;
        }

        .search-row {
          min-height: 64px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 8px 8px 18px;
          background: white;
          border: 1px solid #d8dfd9;
          border-radius: 18px;
          box-shadow: 0 18px 45px rgba(34, 57, 48, .08);
        }

        .search-icon { font-size: 28px; line-height: 1; color: #66736d; }
        .search-row input {
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--ink);
          font-size: 14px;
        }

        .search-row input::placeholder { color: #98a29d; }
        .search-row button {
          border: 0;
          background: var(--green);
          color: white;
          border-radius: 12px;
          padding: 13px 18px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
        }

        .search-results {
          position: absolute;
          left: 0;
          right: 0;
          top: 72px;
          overflow: hidden;
          background: white;
          border: 1px solid #dce3dd;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(30, 48, 41, .13);
        }

        .search-results a {
          display: grid;
          grid-template-columns: 82px 1fr auto;
          gap: 5px 12px;
          padding: 14px 17px;
          border-bottom: 1px solid #edf0ed;
        }

        .search-results a:last-child { border-bottom: 0; }
        .search-results a:hover { background: #f5f8f5; }
        .result-type { grid-row: span 2; align-self: center; color: #718078; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .search-results strong { font-size: 13px; }
        .search-results small { color: var(--muted); font-size: 11px; }
        .result-arrow { grid-column: 3; grid-row: 1 / 3; align-self: center; color: var(--green); }

        .popular-searches {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 13px;
        }

        .popular-searches > span {
          color: #7b857f;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-right: 3px;
        }

        .popular-searches button {
          border: 1px solid #d8dfda;
          background: rgba(255,255,255,.65);
          color: #58665f;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 10px;
          cursor: pointer;
        }

        .hero-actions { display: flex; gap: 10px; margin-top: 27px; }
        .button {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          border-radius: 999px;
          padding: 0 19px;
          border: 1px solid transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .button.primary { background: var(--green); color: white; }
        .button.secondary { border-color: #cfd8d2; color: var(--green); background: rgba(255,255,255,.5); }
        .button span { color: #b9d7c5; }

        .trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 30px;
          color: #65716b;
          font-size: 10px;
        }

        .trust-row b { color: var(--gold); margin-right: 6px; }

        .hero-panel {
          min-height: 510px;
          border-radius: 28px;
          background: var(--green);
          color: white;
          padding: 20px;
          position: relative;
          box-shadow: 0 30px 70px rgba(22, 62, 53, .2);
          overflow: hidden;
        }

        .hero-panel::before {
          content: "";
          position: absolute;
          width: 350px;
          height: 350px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 50%;
          right: -150px;
          bottom: -140px;
        }

        .panel-top, .panel-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #a9c1b7;
          font-size: 9px;
          letter-spacing: 1.5px;
          font-weight: 800;
        }

        .live-dot { color: #d4e7dc; letter-spacing: 0; text-transform: none; display: flex; align-items: center; gap: 6px; }
        .live-dot i { width: 6px; height: 6px; border-radius: 50%; background: #b5d7bd; }

        .panel-main {
          position: relative;
          z-index: 1;
          padding: 105px 28px 60px;
        }

        .panel-kicker { color: #b6d0c3; text-transform: uppercase; letter-spacing: 2px; font-size: 9px; font-weight: 800; }
        .panel-main h2 { font-family: var(--font-display); font-size: 47px; line-height: .98; letter-spacing: -1.8px; font-weight: 500; margin: 14px 0 18px; }
        .panel-main p { color: #b7c9c1; font-size: 13px; line-height: 1.7; max-width: 410px; }

        .panel-path { margin-top: 34px; display: grid; gap: 11px; }
        .panel-path div {
          display: grid;
          grid-template-columns: 38px 95px 1fr;
          gap: 10px;
          align-items: center;
          padding: 12px 13px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 12px;
          background: rgba(255,255,255,.035);
        }

        .panel-path span { color: #8fb0a2; font-size: 9px; }
        .panel-path strong { font-size: 11px; }
        .panel-path small { color: #91aaa0; font-size: 9px; }
        .panel-footer { position: absolute; bottom: 20px; left: 20px; right: 20px; border-top: 1px solid rgba(255,255,255,.1); padding-top: 14px; }
        .panel-footer strong { color: white; letter-spacing: 0; text-transform: lowercase; font-size: 11px; }

        .discovery-strip { background: white; border-bottom: 1px solid var(--line); }
        .discovery-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .discovery-card {
          min-height: 150px;
          display: grid;
          grid-template-columns: 35px 1fr 20px;
          gap: 12px;
          align-items: center;
          padding: 24px 20px;
          border-right: 1px solid var(--line);
        }

        .discovery-card:first-child { border-left: 1px solid var(--line); }
        .discovery-number { color: var(--gold); font-size: 10px; font-weight: 800; align-self: start; padding-top: 2px; }
        .discovery-card h3 { margin: 0 0 6px; font-family: var(--font-display); font-size: 23px; font-weight: 500; }
        .discovery-card p { margin: 0; color: #77827c; font-size: 11px; line-height: 1.55; }
        .card-arrow { color: var(--green); font-size: 18px; }

        .section { padding: 105px 0; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; }
        h2 { font-family: var(--font-display); font-size: clamp(42px, 5vw, 62px); line-height: .98; letter-spacing: -2.6px; font-weight: 500; margin: 18px 0 0; }
        .intro-copy { padding-top: 27px; }
        .intro-copy p, .section-heading > p, .hospital-copy > p, .faq-layout > div > p, .directory-intro > p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.85;
          margin: 0 0 17px;
        }

        .treatments-section { background: white; }
        .section-heading { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: end; margin-bottom: 38px; }
        .section-heading > p { margin: 0; }
        .category-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 23px; scrollbar-width: none; }
        .category-scroll::-webkit-scrollbar { display: none; }
        .category-scroll button {
          flex: 0 0 auto;
          border: 1px solid #dbe1dc;
          background: #f8faf8;
          color: #67736d;
          border-radius: 999px;
          padding: 9px 14px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }
        .category-scroll button.active { background: var(--green); border-color: var(--green); color: white; }

        .procedure-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .procedure-card {
          position: relative;
          min-height: 340px;
          border: 1px solid #e0e5e1;
          border-radius: 20px;
          padding: 22px;
          background: #fbfcfb;
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .procedure-card:hover { transform: translateY(-4px); border-color: #cbd8d0; box-shadow: 0 18px 35px rgba(32, 65, 53, .08); }
        .procedure-icon { width: 42px; height: 42px; display: grid; place-items: center; background: #e7f0e9; color: var(--green); border-radius: 13px; font-size: 20px; }
        .procedure-meta { display: flex; justify-content: space-between; gap: 10px; margin-top: 28px; color: #829089; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .procedure-card h3 { font-family: var(--font-display); font-size: 28px; line-height: 1; letter-spacing: -.7px; font-weight: 500; margin: 9px 0 9px; }
        .procedure-card > p { min-height: 54px; color: #78837e; font-size: 11px; line-height: 1.65; }
        .cost-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 17px; }
        .cost-mini div { background: #f1f4f1; padding: 10px; border-radius: 10px; }
        .cost-mini span { display: block; color: #8b958f; font-size: 8px; line-height: 1.35; margin-bottom: 4px; }
        .cost-mini strong { display: block; color: #27483e; font-size: 10px; line-height: 1.35; }
        .card-link { position: absolute; left: 22px; right: 22px; bottom: 18px; border-top: 1px solid #e3e8e4; padding-top: 13px; color: var(--green); font-size: 10px; font-weight: 800; }
        .card-link span { float: right; }

        .cost-section { background: #eef2ee; }
        .cost-card { display: grid; grid-template-columns: .78fr 1.22fr; overflow: hidden; border-radius: 27px; background: var(--green); color: white; box-shadow: 0 25px 55px rgba(23, 54, 46, .14); }
        .cost-copy { padding: 54px; }
        .cost-copy h2 { font-size: 55px; }
        .cost-copy h2 em { color: #c7dfd1; }
        .cost-copy p { max-width: 440px; color: #b8cbc2; font-size: 13px; line-height: 1.8; margin: 23px 0 28px; }
        .light-button { background: white; color: var(--green); }
        .light-button span { color: var(--green-2); }
        .cost-visual { padding: 37px; background: #102f28; }
        .cost-header { display: flex; justify-content: space-between; color: #87a399; font-size: 9px; letter-spacing: 1.6px; font-weight: 800; padding-bottom: 20px; }
        .cost-row { display: grid; grid-template-columns: 1.05fr 1fr .75fr; gap: 18px; align-items: center; padding: 18px 0; border-top: 1px solid rgba(255,255,255,.09); }
        .cost-label strong { display: block; font-family: var(--font-display); font-size: 19px; font-weight: 500; }
        .cost-label span { display: block; color: #809b90; font-size: 8px; margin-top: 4px; }
        .cost-bars { display: grid; gap: 6px; }
        .cost-bars > div { height: 6px; border-radius: 10px; background: rgba(255,255,255,.08); overflow: hidden; }
        .cost-bars i { display: block; height: 100%; border-radius: inherit; background: #a8cdb9; }
        .cost-bars .benchmark i { background: #718d82; }
        .cost-values { text-align: right; }
        .cost-values strong, .cost-values span { display: block; font-size: 9px; }
        .cost-values strong { color: #d7e7df; }
        .cost-values span { color: #789287; margin-top: 4px; }
        .cost-note { margin-top: 20px; color: #718d82; font-size: 8px; line-height: 1.6; }

        .directory-preview { background: white; }
        .directory-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 100px; align-items: center; }
        .directory-intro h2 { margin-bottom: 24px; }
        .text-button { border: 0; background: transparent; padding: 0; color: #6d7973; cursor: pointer; font-size: 11px; text-align: left; }
        .text-button span { color: var(--green); font-weight: 800; }
        .directory-placeholder { border: 1px solid #dfe5e1; border-radius: 23px; background: #f7f9f7; padding: 24px; }
        .directory-placeholder-top { display: flex; justify-content: space-between; color: #718079; font-size: 9px; letter-spacing: 1.5px; font-weight: 800; padding-bottom: 17px; border-bottom: 1px solid #e2e7e3; }
        .status-pill { border-radius: 999px; padding: 6px 9px; background: #e3eee7; color: #346051; letter-spacing: .7px; }
        .placeholder-lines { display: grid; gap: 0; }
        .placeholder-lines > div { display: grid; grid-template-columns: 40px 1fr; gap: 3px 13px; align-items: center; padding: 19px 0; border-bottom: 1px solid #e3e8e4; }
        .avatar-placeholder { grid-row: span 2; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: #dce8df; color: #557467; font-size: 9px; font-weight: 800; }
        .placeholder-lines b { font-size: 12px; }
        .placeholder-lines small { color: #89948e; font-size: 9px; }
        .placeholder-footer { color: #8a958f; font-size: 9px; margin-top: 17px; }

        .hospital-section { background: #f1f4f1; }
        .hospital-layout { display: grid; grid-template-columns: 1.05fr .95fr; gap: 100px; align-items: center; }
        .hospital-visual { min-height: 470px; border-radius: 27px; background: radial-gradient(circle at center, #345e51 0%, #173d34 43%, #0f2e27 100%); position: relative; overflow: hidden; display: grid; place-items: center; box-shadow: 0 25px 55px rgba(22,62,53,.15); }
        .hospital-visual::before, .hospital-visual::after { content: ""; position: absolute; border: 1px solid rgba(255,255,255,.08); border-radius: 50%; }
        .hospital-visual::before { width: 330px; height: 330px; }
        .hospital-visual::after { width: 500px; height: 500px; }
        .visual-label { position: absolute; top: 23px; left: 25px; color: #a8c0b7; font-size: 9px; letter-spacing: 1.7px; font-weight: 800; }
        .visual-center { position: relative; z-index: 2; text-align: center; color: white; }
        .visual-center span { width: 68px; height: 68px; margin: 0 auto 15px; display: grid; place-items: center; border-radius: 50%; background: rgba(255,255,255,.09); font-size: 28px; }
        .visual-center strong { display: block; font-family: var(--font-display); font-size: 34px; font-weight: 500; }
        .visual-center small { color: #9ab3a8; font-size: 9px; }
        .city-chip { position: absolute; z-index: 3; padding: 8px 11px; border-radius: 999px; background: rgba(255,255,255,.08); color: #d2e1da; border: 1px solid rgba(255,255,255,.1); font-size: 9px; backdrop-filter: blur(8px); }
        .chip-one { top: 24%; left: 14%; } .chip-two { top: 31%; right: 12%; } .chip-three { bottom: 22%; left: 17%; } .chip-four { bottom: 15%; right: 17%; }
        .feature-list { display: grid; gap: 11px; margin: 25px 0 30px; color: #63716a; font-size: 11px; }
        .feature-list span { padding-bottom: 11px; border-bottom: 1px solid #dfe5e0; }

        .journey-section { background: white; }
        .journey-grid { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
        .journey-card { min-height: 190px; padding: 22px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
        .journey-card > span { color: var(--gold); font-size: 10px; font-weight: 800; }
        .journey-card h3 { margin: 38px 0 8px; font-family: var(--font-display); font-size: 23px; font-weight: 500; }
        .journey-card p { color: #77827c; font-size: 10px; line-height: 1.6; margin: 0; }
        .journey-cta { margin-top: 25px; padding: 25px 28px; background: #edf2ed; border-radius: 17px; display: flex; justify-content: space-between; align-items: center; gap: 25px; }
        .journey-cta span { color: #738078; font-size: 8px; letter-spacing: 1.5px; font-weight: 800; }
        .journey-cta h3 { margin: 7px 0 0; font-family: var(--font-display); font-size: 24px; font-weight: 500; }

        .partner-section { background: #173e35; color: white; }
        .partner-card { display: grid; grid-template-columns: 1fr 1fr; gap: 90px; align-items: center; }
        .partner-card h2 { font-size: 57px; }
        .partner-card h2 em { color: #c4ded0; }
        .partner-card p { color: #aec4ba; font-size: 13px; line-height: 1.8; margin-bottom: 25px; }
        .light-link { color: white; font-size: 11px; font-weight: 800; }
        .light-link span { color: #b7d7c6; margin-left: 7px; }

        .faq-section { background: #f7f8f5; }
        .faq-layout { display: grid; grid-template-columns: .85fr 1.15fr; gap: 110px; }
        .faq-layout > div > p { margin-top: 22px; max-width: 430px; }
        .faq-list { border-top: 1px solid var(--line); }
        .faq-item { border-bottom: 1px solid var(--line); }
        .faq-item button { width: 100%; display: flex; justify-content: space-between; gap: 20px; align-items: center; border: 0; background: transparent; padding: 19px 0; cursor: pointer; color: var(--ink); text-align: left; font-size: 12px; font-weight: 700; }
        .faq-item button b { font-size: 18px; font-weight: 400; color: #617069; }
        .faq-item p { margin: -3px 40px 19px 0; color: #748079; font-size: 11px; line-height: 1.75; }

        .review-section { padding: 75px 0; background: #102f28; color: white; }
        .review-card { display: grid; grid-template-columns: 1fr .8fr; gap: 90px; align-items: center; }
        .review-card h2 { font-size: 59px; margin-top: 13px; }
        .review-card p { max-width: 550px; color: #a9c0b6; font-size: 13px; line-height: 1.8; }
        .review-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 11px; }
        .review-actions a { color: #a9c0b6; font-size: 10px; }
        .review-actions a:hover { color: white; }

        .footer { background: #0b241f; color: #b5c5bf; padding: 65px 0 25px; }
        .footer-grid { display: grid; grid-template-columns: 1.5fr .8fr .8fr .8fr; gap: 55px; }
        .footer-brand { display: flex; align-items: center; gap: 10px; color: white; margin-bottom: 17px; }
        .footer-brand strong { font-size: 22px; letter-spacing: -.7px; }
        .footer-grid > div:first-child p { max-width: 310px; color: #71877f; font-size: 10px; line-height: 1.8; }
        .footer-heading { display: block; color: #7e978d; font-size: 8px; letter-spacing: 1.6px; font-weight: 800; text-transform: uppercase; margin-bottom: 14px; }
        .footer-grid a, .footer-grid button { display: block; border: 0; padding: 0; background: transparent; color: #b5c5bf; margin: 0 0 10px; font-size: 10px; cursor: pointer; text-align: left; }
        .footer-grid a:hover, .footer-grid button:hover { color: white; }
        .footer-bottom { display: flex; justify-content: space-between; gap: 20px; border-top: 1px solid rgba(255,255,255,.08); margin-top: 45px; padding-top: 18px; color: #637a72; font-size: 8px; line-height: 1.5; }

        .floating-assistant { position: fixed; z-index: 40; right: 22px; bottom: 22px; border: 1px solid rgba(255,255,255,.15); background: var(--green); color: white; box-shadow: 0 16px 30px rgba(15,43,36,.24); border-radius: 999px; padding: 12px 16px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .floating-assistant span { color: #d5b66f; }
        .floating-assistant b { font-size: 10px; }
        .mobile-review-bar { display: none; }

        @media (max-width: 1050px) {
          .desktop-nav { gap: 14px; }
          .desktop-nav a { font-size: 11px; }
          .hero-grid { gap: 40px; }
          .hero h1 { font-size: 65px; }
          .section-heading, .directory-grid, .hospital-layout, .faq-layout, .partner-card, .review-card { gap: 55px; }
          .cost-card { grid-template-columns: 1fr; }
          .cost-copy { padding-bottom: 40px; }
        }

        @media (max-width: 820px) {
          .container { width: min(100% - 32px, 650px); }
          .header-inner { min-height: 68px; }
          .desktop-nav {
            display: none;
            position: absolute;
            top: 68px;
            left: 16px;
            right: 16px;
            margin: 0;
            padding: 14px;
            background: rgba(255,255,255,.97);
            border: 1px solid var(--line);
            border-radius: 17px;
            box-shadow: 0 20px 40px rgba(24,45,37,.1);
          }
          .desktop-nav.mobile-open { display: grid; }
          .desktop-nav a { padding: 12px; font-size: 12px; }
          .menu-toggle { display: block; }
          .header-review { display: none; }

          .hero { padding: 65px 0 55px; }
          .hero-grid, .two-col, .section-heading, .directory-grid, .hospital-layout, .faq-layout, .partner-card, .review-card { grid-template-columns: 1fr; }
          .hero-grid { gap: 40px; }
          .hero h1 { font-size: clamp(48px, 12vw, 68px); letter-spacing: -2.7px; }
          .hero-lead { font-size: 15px; }
          .hero-panel { min-height: 440px; }
          .panel-main { padding: 75px 22px 45px; }
          .panel-main h2 { font-size: 39px; }
          .discovery-grid { grid-template-columns: 1fr 1fr; }
          .discovery-card:nth-child(2) { border-right: 0; }
          .discovery-card:nth-child(n+3) { border-top: 1px solid var(--line); }
          .section { padding: 78px 0; }
          .procedure-grid { grid-template-columns: 1fr 1fr; }
          .journey-grid { grid-template-columns: 1fr 1fr; }
          .partner-card h2, .review-card h2 { font-size: 49px; }
          .directory-grid, .hospital-layout { gap: 38px; }
          .hospital-visual { min-height: 390px; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 560px) {
          .container { width: calc(100% - 28px); }
          .brand-copy small { letter-spacing: 1.5px; }
          .hero { padding-top: 47px; }
          .hero h1 { font-size: 48px; }
          .hero-lead { font-size: 14px; }
          .search-row { min-height: 58px; padding-left: 13px; }
          .search-row button { padding: 11px 13px; }
          .search-row input { font-size: 12px; }
          .search-results { top: 66px; }
          .popular-searches { gap: 6px; }
          .popular-searches button { font-size: 9px; }
          .hero-actions { flex-direction: column; }
          .hero-actions .button { width: 100%; }
          .trust-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; line-height: 1.5; }
          .hero-panel { min-height: 425px; border-radius: 21px; padding: 17px; }
          .panel-main { padding: 64px 8px 35px; }
          .panel-main h2 { font-size: 37px; }
          .panel-path div { grid-template-columns: 30px 1fr; }
          .panel-path small { grid-column: 2; }
          .discovery-grid { grid-template-columns: 1fr; }
          .discovery-card, .discovery-card:first-child { border-left: 0; border-right: 0; border-top: 1px solid var(--line); }
          .discovery-card:first-child { border-top: 0; }
          h2 { font-size: 43px; }
          .section-heading { gap: 17px; }
          .procedure-grid { grid-template-columns: 1fr; }
          .procedure-card { min-height: 325px; }
          .cost-copy { padding: 34px 24px; }
          .cost-copy h2 { font-size: 44px; }
          .cost-visual { padding: 22px 18px; }
          .cost-row { grid-template-columns: 1fr; gap: 9px; }
          .cost-values { text-align: left; display: flex; gap: 12px; }
          .cost-values span { margin-top: 0; }
          .journey-grid { grid-template-columns: 1fr; }
          .journey-card { min-height: auto; padding: 19px; }
          .journey-card h3 { margin-top: 20px; }
          .journey-cta { flex-direction: column; align-items: flex-start; }
          .partner-card h2, .review-card h2 { font-size: 43px; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 35px 20px; }
          .footer-grid > div:first-child { grid-column: 1 / -1; }
          .footer-bottom { flex-direction: column; }
          .floating-assistant { right: 14px; bottom: 72px; padding: 10px 13px; }
          .mobile-review-bar {
            position: fixed;
            z-index: 45;
            left: 0;
            right: 0;
            bottom: 0;
            display: block;
            padding: 9px 12px;
            background: rgba(247,248,245,.94);
            backdrop-filter: blur(14px);
            border-top: 1px solid var(--line);
          }
          .mobile-review-bar button {
            width: 100%;
            min-height: 45px;
            border: 0;
            border-radius: 12px;
            background: var(--green);
            color: white;
            font-size: 11px;
            font-weight: 800;
          }
          .mobile-review-bar span { margin-left: 8px; color: #c6dfd1; }
        }
      `}</style>
    </main>
  )
}
