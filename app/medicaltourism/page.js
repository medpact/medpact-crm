"use client"

import { useMemo, useState } from "react"
import { Newsreader, Public_Sans } from "next/font/google"

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
})

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
})

const WHATSAPP_NUMBER = "919000000000"
const EMAIL = "care@medpact.in"
const PHONE = "+91 90000 00000"

const procedures = [
  {
    id: 1,
    name: "Dental Implants",
    icon: "🦷",
    department: "Dental",
    india: 1000,
    us: 2800,
    indiaDisplay: "$1,000",
    usDisplay: "$2,800",
    stay: "7–10 days",
    description:
      "Implant-supported tooth replacement with specialist dental planning and restorative care.",
  },
  {
    id: 2,
    name: "Knee Replacement",
    icon: "🦵",
    department: "Orthopaedic",
    india: 6200,
    us: 50000,
    indiaDisplay: "$6,200",
    usDisplay: "$50,000",
    stay: "2–3 weeks",
    description:
      "Advanced joint replacement for patients seeking specialist orthopaedic treatment.",
  },
  {
    id: 3,
    name: "Hip Replacement",
    icon: "🦴",
    department: "Orthopaedic",
    india: 7000,
    us: 50000,
    indiaDisplay: "$7,000",
    usDisplay: "$50,000",
    stay: "2–3 weeks",
    description:
      "Hip replacement with coordinated surgical, rehabilitation and recovery planning.",
  },
  {
    id: 4,
    name: "CABG / Heart Bypass",
    icon: "🫀",
    department: "Cardiac",
    india: 5200,
    us: 144000,
    indiaDisplay: "$5,200",
    usDisplay: "$144,000",
    stay: "3–4 weeks",
    description:
      "Coronary artery bypass surgery coordinated with experienced cardiac specialists.",
  },
  {
    id: 5,
    name: "Heart Valve Replacement",
    icon: "❤️",
    department: "Cardiac",
    india: 5500,
    us: 170000,
    indiaDisplay: "$5,500",
    usDisplay: "$170,000",
    stay: "3–4 weeks",
    description:
      "Surgical valve replacement with specialist cardiac evaluation and coordinated recovery.",
  },
  {
    id: 6,
    name: "Spinal Fusion",
    icon: "🦴",
    department: "Neuro & Spine",
    india: 2500,
    us: 100000,
    indiaDisplay: "₹1–3 lakh",
    usDisplay: "~$100,000",
    stay: "2–3 weeks",
    description:
      "Complex spine surgery coordinated around diagnosis, imaging, surgery and rehabilitation.",
  },
  {
    id: 7,
    name: "Sleeve Gastrectomy",
    icon: "⚖️",
    department: "Bariatric",
    india: 3500,
    us: 41400,
    indiaDisplay: "₹2–4 lakh",
    usDisplay: "~$41,400",
    stay: "2 weeks",
    description:
      "Bariatric surgery with pre-operative evaluation and structured recovery support.",
  },
  {
    id: 8,
    name: "Cataract Surgery",
    icon: "👁️",
    department: "Ophthalmology",
    india: 1000,
    us: 5000,
    indiaDisplay: "₹30k–1 lakh",
    usDisplay: "$3,000–5,000 / eye",
    stay: "5–7 days",
    description:
      "Modern cataract treatment with specialist evaluation and post-operative care.",
  },
  {
    id: 9,
    name: "Brain Tumor / Craniotomy",
    icon: "🧠",
    department: "Neurosurgery",
    india: 3000,
    us: 140000,
    indiaDisplay: "₹1–2.5 lakh",
    usDisplay: "~$50k–140k+",
    stay: "3–4 weeks",
    description:
      "Complex neurosurgical care requiring detailed medical-record and imaging review.",
  },
  {
    id: 10,
    name: "Angioplasty",
    icon: "🫀",
    department: "Cardiac",
    india: 3300,
    us: 57000,
    indiaDisplay: "$3,300",
    usDisplay: "$57,000",
    stay: "7–10 days",
    description:
      "Catheter-based coronary intervention with coordinated cardiac evaluation and follow-up.",
  },
]

const departments = [
  {
    id: "dental",
    name: "Dental",
    eyebrow: "Precision. Comfort. Confidence.",
    description:
      "From implants and restorative dentistry to complex oral rehabilitation, connect with experienced dental specialists in leading Indian hospitals.",
    icon: "🦷",
    procedures: ["Dental Implants", "Full-mouth Rehabilitation", "Smile & Restorative Dentistry"],
    colorClass: "dental",
  },
  {
    id: "cardiac",
    name: "Cardiac",
    eyebrow: "Advanced heart care",
    description:
      "Access coordinated cardiac evaluation and specialist care for coronary disease, valve conditions and other complex cardiac procedures.",
    icon: "🫀",
    procedures: ["CABG / Heart Bypass", "Heart Valve Replacement", "Angioplasty"],
    colorClass: "cardiac",
  },
  {
    id: "neuro",
    name: "Neuro & Spine",
    eyebrow: "Complex neurological care",
    description:
      "Specialist pathways for neurological and spine conditions, with medical-record review before you travel.",
    icon: "🧠",
    procedures: ["Spinal Fusion", "Brain Tumor Surgery", "Complex Spine Care"],
    colorClass: "neuro",
  },
]

const doctors = [
  {
    name: "Dr. Anand Krishnan",
    specialty: "Cardiothoracic Surgery",
    experience: "27+ years",
    location: "Chennai",
    initials: "AK",
  },
  {
    name: "Dr. Meera Iyer",
    specialty: "Neurosurgery",
    experience: "19+ years",
    location: "Bengaluru",
    initials: "MI",
  },
  {
    name: "Dr. Rajiv Sethi",
    specialty: "Implantology",
    experience: "22+ years",
    location: "Hyderabad",
    initials: "RS",
  },
  {
    name: "Dr. Fatima Sheikh",
    specialty: "Joint Replacement",
    experience: "16+ years",
    location: "Chennai",
    initials: "FS",
  },
]

const testimonials = [
  {
    name: "Michael R.",
    country: "United States",
    text:
      "The biggest difference for us was having someone coordinate the medical discussions before we travelled. Everything felt much more structured.",
    procedure: "Cardiac treatment",
  },
  {
    name: "Sarah M.",
    country: "United States",
    text:
      "We were able to review the medical records, understand the treatment pathway and discuss the expected costs before making the trip.",
    procedure: "Orthopaedic treatment",
  },
  {
    name: "David K.",
    country: "United Kingdom",
    text:
      "The coordination between the hospital, doctor and travel arrangements made the experience much easier for our family.",
    procedure: "Neurosurgical care",
  },
]

const faqs = [
  {
    q: "How do I get a treatment estimate?",
    a:
      "Send us your medical reports, scans and relevant treatment history. Our team can coordinate a medical review and help you understand the expected treatment pathway and indicative costs.",
  },
  {
    q: "Do I need to travel to India before speaking to a doctor?",
    a:
      "No. The initial medical review can usually begin remotely. Your reports can be shared digitally for preliminary assessment before you decide to travel.",
  },
  {
    q: "Can Medpact arrange hospital appointments?",
    a:
      "Yes. Medpact can coordinate communication with hospitals and specialists, subject to doctor and hospital availability.",
  },
  {
    q: "What is included in the treatment cost?",
    a:
      "Inclusions vary by hospital and procedure. A final estimate should clearly identify hospital charges, surgeon fees, implants or devices where applicable, investigations, accommodation and other relevant costs.",
  },
  {
    q: "Can my family travel with me?",
    a:
      "Yes. Family members can travel with the patient. Travel and accommodation arrangements can be discussed as part of the coordination process.",
  },
  {
    q: "Are the prices on this website guaranteed?",
    a:
      "No. The prices shown are illustrative benchmarks for comparison. Actual treatment costs depend on the hospital, doctor, diagnosis, procedure complexity, implants, investigations, length of stay and other factors.",
  },
]

function openWhatsApp(message = "Hello Medpact, I would like to explore medical treatment in India.") {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank", "noopener,noreferrer")
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

export default function MedicalTourismPage() {
  const [currency, setCurrency] = useState("USD")
  const [activeDepartment, setActiveDepartment] = useState("All")
  const [openFaq, setOpenFaq] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    treatment: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const currencyRates = {
    USD: 1,
    EUR: 0.86,
    GBP: 0.74,
  }

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
  }

  const filteredProcedures = useMemo(() => {
    if (activeDepartment === "All") return procedures

    return procedures.filter((item) => {
      if (activeDepartment === "Dental") return item.department === "Dental"
      if (activeDepartment === "Cardiac") return item.department === "Cardiac"
      if (activeDepartment === "Neuro") {
        return (
          item.department === "Neuro & Spine" ||
          item.department === "Neurosurgery"
        )
      }
      return true
    })
  }, [activeDepartment])

  function formatPrice(value) {
    const converted = Math.round(value * currencyRates[currency])

    if (currency === "USD") {
      return `$${converted.toLocaleString()}`
    }

    if (currency === "EUR") {
      return `€${converted.toLocaleString()}`
    }

    return `£${converted.toLocaleString()}`
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const message = [
      `Hello Medpact, I would like to enquire about medical treatment in India.`,
      ``,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Country: ${form.country}`,
      `Treatment: ${form.treatment}`,
      `Message: ${form.message}`,
    ].join("\n")

    openWhatsApp(message)
    setSubmitted(true)
  }

  return (
    <main className={`${newsreader.variable} ${publicSans.variable} site`}>
      <header className="header">
        <div className="header-inner">
          <button
            className="logo"
            onClick={() => scrollToId("top")}
            aria-label="Medpact home"
          >
            <span className="logo-mark">M</span>
            <span>
              <strong>medpact</strong>
              <small>HEALTHCARE</small>
            </span>
          </button>

          <nav className={`nav ${mobileMenu ? "nav-open" : ""}`}>
            <button onClick={() => scrollToId("treatments")}>Treatments</button>
            <button onClick={() => scrollToId("compare")}>Cost Guide</button>
            <button onClick={() => scrollToId("specialists")}>Specialists</button>
            <button onClick={() => scrollToId("journey")}>Your Journey</button>
            <button onClick={() => scrollToId("faq")}>FAQ</button>
          </nav>

          <div className="header-actions">
            <div className="currency">
              {["USD", "EUR", "GBP"].map((item) => (
                <button
                  key={item}
                  className={currency === item ? "active" : ""}
                  onClick={() => setCurrency(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              className="header-cta"
              onClick={() => scrollToId("enquiry")}
            >
              Get a medical review
            </button>

            <button
              className="menu-button"
              onClick={() => setMobileMenu((value) => !value)}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              INTERNATIONAL PATIENT SERVICES
            </div>

            <h1>
              Exceptional care.
              <br />
              <em>Closer than you think.</em>
            </h1>

            <p className="hero-text">
              Explore specialist medical treatment in India with transparent
              cost comparisons, experienced doctors and a coordinated journey
              from your first enquiry to your return home.
            </p>

            <div className="hero-buttons">
              <button
                className="button button-primary"
                onClick={() => scrollToId("enquiry")}
              >
                Start your medical enquiry
                <span>→</span>
              </button>

              <button
                className="button button-outline"
                onClick={() => scrollToId("compare")}
              >
                Compare treatment costs
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <strong>01</strong>
                <span>Medical record review</span>
              </div>

              <div className="trust-item">
                <strong>02</strong>
                <span>Specialist coordination</span>
              </div>

              <div className="trust-item">
                <strong>03</strong>
                <span>Travel assistance</span>
              </div>
            </div>
          </div>

          <div className="hero-card-wrap">
            <div className="hero-card">
              <div className="card-top">
                <span>YOUR INDIA CARE PLAN</span>
                <span className="live-dot">●</span>
              </div>

              <div className="hero-card-main">
                <div className="mini-icon">✦</div>

                <h3>
                  Begin with your
                  <br />
                  medical records.
                </h3>

                <p>
                  Share your reports securely and receive guidance on suitable
                  specialists and treatment options.
                </p>
              </div>

              <div className="card-line" />

              <div className="card-stats">
                <div>
                  <span>STEP</span>
                  <strong>01 / 04</strong>
                </div>

                <div>
                  <span>RESPONSE</span>
                  <strong>Prompt</strong>
                </div>
              </div>

              <button
                className="card-button"
                onClick={() => scrollToId("enquiry")}
              >
                Send my reports <span>↗</span>
              </button>
            </div>

            <div className="floating-note note-one">
              <span>✓</span>
              Specialist coordination
            </div>

            <div className="floating-note note-two">
              <span>◎</span>
              International patient support
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stats-inner">
          <div>
            <strong>200+</strong>
            <span>Hospitals across India</span>
          </div>

          <div>
            <strong>25+</strong>
            <span>Specialities</span>
          </div>

          <div>
            <strong>1:1</strong>
            <span>Patient coordination</span>
          </div>

          <div>
            <strong>24/7</strong>
            <span>Journey assistance</span>
          </div>
        </div>
      </section>

      <section className="section opportunity" id="about">
        <div className="section-inner two-column">
          <div>
            <div className="eyebrow">WHY INDIA</div>

            <h2>
              World-class medical expertise,
              <br />
              <em>with a different cost equation.</em>
            </h2>
          </div>

          <div className="section-copy">
            <p>
              India has become an important destination for international
              patients seeking complex medical treatment, specialist expertise
              and access to advanced hospitals.
            </p>

            <p>
              The right choice is not simply about price. It is about finding
              the appropriate specialist, hospital, treatment pathway and level
              of support for your individual medical situation.
            </p>

            <button
              className="text-link"
              onClick={() => scrollToId("journey")}
            >
              See how Medpact coordinates your journey <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section treatment-section" id="treatments">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SPECIALIST CARE</div>

              <h2>
                Start with the
                <br />
                <em>right department.</em>
              </h2>
            </div>

            <p>
              Explore some of the medical pathways commonly considered by
              international patients travelling to India.
            </p>
          </div>

          <div className="department-grid">
            {departments.map((department) => (
              <article
                className={`department-card ${department.colorClass}`}
                key={department.id}
              >
                <div className="department-icon">{department.icon}</div>

                <div className="department-eyebrow">
                  {department.eyebrow}
                </div>

                <h3>{department.name}</h3>

                <p>{department.description}</p>

                <div className="department-procedures">
                  {department.procedures.map((procedure) => (
                    <span key={procedure}>{procedure}</span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setActiveDepartment(
                      department.id === "dental"
                        ? "Dental"
                        : department.id === "cardiac"
                        ? "Cardiac"
                        : "Neuro"
                    )

                    setTimeout(() => scrollToId("compare"), 50)
                  }}
                  className="department-link"
                >
                  Explore procedures <span>→</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section comparison-section" id="compare">
        <div className="section-inner">
          <div className="comparison-top">
            <div>
              <div className="eyebrow">ILLUSTRATIVE COST GUIDE</div>

              <h2>
                See the difference
                <br />
                <em>before you travel.</em>
              </h2>
            </div>

            <div className="comparison-intro">
              <p>
                International treatment costs can vary significantly between
                markets. The figures below are illustrative benchmarks intended
                to help you understand the broad cost landscape.
              </p>

              <div className="currency-note">
                Display currency:{" "}
                <strong>
                  {currency} {currencySymbols[currency]}
                </strong>
              </div>
            </div>
          </div>

          <div className="filter-row">
            {["All", "Dental", "Cardiac", "Neuro"].map((item) => (
              <button
                key={item}
                className={activeDepartment === item ? "active" : ""}
                onClick={() => setActiveDepartment(item)}
              >
                {item === "Neuro" ? "Neuro & Spine" : item}
              </button>
            ))}
          </div>

          <div className="comparison-list">
            {filteredProcedures.map((procedure) => {
              const max = procedure.us

              const indiaWidth = Math.max(
                5,
                Math.min(100, (procedure.india / max) * 100)
              )

              return (
                <article className="comparison-row" key={procedure.id}>
                  <div className="procedure-info">
                    <div className="procedure-icon">{procedure.icon}</div>

                    <div>
                      <span>{procedure.department}</span>
                      <h3>{procedure.name}</h3>
                      <small>{procedure.stay} typical stay</small>
                    </div>
                  </div>

                  <div className="price-comparison">
                    <div className="price-line">
                      <span className="price-label">U.S.</span>

                      <div className="bar-track">
                        <div
                          className="bar us-bar"
                          style={{ width: "100%" }}
                        />
                      </div>

                      <strong>{procedure.usDisplay}</strong>
                    </div>

                    <div className="price-line">
                      <span className="price-label">India</span>

                      <div className="bar-track">
                        <div
                          className="bar india-bar"
                          style={{ width: `${indiaWidth}%` }}
                        />
                      </div>

                      <strong>
                        {currency === "USD"
                          ? procedure.indiaDisplay
                          : formatPrice(procedure.india)}
                      </strong>
                    </div>
                  </div>

                  <div className="comparison-action">
                    <button
                      onClick={() =>
                        scrollToId("enquiry")
                      }
                    >
                      Ask about this procedure <span>→</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="comparison-disclaimer">
            <span>i</span>

            <p>
              <strong>About these figures:</strong> These are illustrative
              international benchmarks, not quotations. Actual costs can vary
              according to hospital, surgeon, diagnosis, procedure complexity,
              implants or devices, investigations, accommodation and length of
              stay. A personalised estimate should be obtained after medical
              review.
            </p>
          </div>
        </div>
      </section>

      <section className="section economics">
        <div className="section-inner economics-inner">
          <div className="economics-card">
            <div className="eyebrow">THE BIGGER PICTURE</div>

            <h2>
              Treatment cost is only
              <br />
              <em>one part of the equation.</em>
            </h2>

            <p>
              When comparing international treatment options, consider the
              complete journey — medical care, travel, accommodation,
              rehabilitation and the time required away from home.
            </p>

            <div className="economics-grid">
              <div>
                <span>01</span>
                <strong>Medical treatment</strong>
                <small>Hospital + specialist care</small>
              </div>

              <div>
                <span>02</span>
                <strong>Travel</strong>
                <small>Flights + local transfers</small>
              </div>

              <div>
                <span>03</span>
                <strong>Accommodation</strong>
                <small>Patient + companion stay</small>
              </div>

              <div>
                <span>04</span>
                <strong>Recovery</strong>
                <small>Follow-up + rehabilitation</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section journey-section" id="journey">
        <div className="section-inner">
          <div className="section-heading centered">
            <div>
              <div className="eyebrow">YOUR JOURNEY</div>

              <h2>
                From your first report
                <br />
                <em>to your return home.</em>
              </h2>
            </div>

            <p>
              Medical travel can feel complicated. Our role is to make the
              process more structured, transparent and easier to navigate.
            </p>
          </div>

          <div className="journey-line">
            <div className="journey-step">
              <div className="step-number">01</div>
              <h3>Share your reports</h3>
              <p>
                Send medical records, scans, prescriptions and previous
                treatment details.
              </p>
            </div>

            <div className="journey-step">
              <div className="step-number">02</div>
              <h3>Medical review</h3>
              <p>
                We coordinate with appropriate specialists and hospitals for
                preliminary assessment.
              </p>
            </div>

            <div className="journey-step">
              <div className="step-number">03</div>
              <h3>Plan your visit</h3>
              <p>
                Discuss treatment, indicative costs, hospital options and
                expected duration.
              </p>
            </div>

            <div className="journey-step">
              <div className="step-number">04</div>
              <h3>Arrive in India</h3>
              <p>
                Coordinate appointments, hospital visits, local assistance and
                follow-up.
              </p>
            </div>
          </div>

          <div className="journey-cta">
            <div>
              <span>READY TO EXPLORE YOUR OPTIONS?</span>
              <h3>Let your medical records start the conversation.</h3>
            </div>

            <button
              className="button button-primary"
              onClick={() => scrollToId("enquiry")}
            >
              Begin my enquiry <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section doctors-section" id="specialists">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SPECIALIST NETWORK</div>

              <h2>
                Experience matters.
                <br />
                <em>So does the right match.</em>
              </h2>
            </div>

            <p>
              A medical tourism decision should begin with the clinical
              question: which specialist and treatment pathway are appropriate
              for your condition?
            </p>
          </div>

          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <article className="doctor-card" key={doctor.name}>
                <div className="doctor-photo">
                  <span>{doctor.initials}</span>
                </div>

                <div className="doctor-info">
                  <span className="doctor-location">
                    {doctor.location}
                  </span>

                  <h3>{doctor.name}</h3>

                  <p>{doctor.specialty}</p>

                  <div className="doctor-bottom">
                    <strong>{doctor.experience}</strong>

                    <button onClick={() => scrollToId("enquiry")}>
                      Enquire <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section stories-section">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <div className="eyebrow">PATIENT EXPERIENCES</div>

              <h2>
                The journey is
                <br />
                <em>more than the procedure.</em>
              </h2>
            </div>

            <p>
              A coordinated medical journey can make a significant difference
              when treatment involves travelling to another country.
            </p>
          </div>

          <div className="stories-grid">
            {testimonials.map((story) => (
              <article className="story-card" key={story.name}>
                <div className="story-video">
                  <div className="play-button">▶</div>
                  <span>VIDEO TESTIMONIAL</span>
                </div>

                <div className="story-body">
                  <div className="stars">★★★★★</div>

                  <p>“{story.text}”</p>

                  <div className="story-person">
                    <div className="avatar">
                      {story.name.charAt(0)}
                    </div>

                    <div>
                      <strong>{story.name}</strong>
                      <span>
                        {story.country} · {story.procedure}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="video-note">
            <span>VIDEO</span>
            <p>
              Patient videos can be added here later without changing the page
              structure.
            </p>
          </div>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-inner faq-inner">
          <div>
            <div className="eyebrow">QUESTIONS</div>

            <h2>
              Before you
              <br />
              <em>make the journey.</em>
            </h2>

            <p className="faq-intro">
              Have another question? Talk to our international patient team.
            </p>

            <button
              className="text-link"
              onClick={() => scrollToId("enquiry")}
            >
              Ask us directly <span>→</span>
            </button>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index

              return (
                <div className={`faq-item ${isOpen ? "open" : ""}`} key={faq.q}>
                  <button
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                  >
                    <span>{faq.q}</span>
                    <strong>{isOpen ? "−" : "+"}</strong>
                  </button>

                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section enquiry-section" id="enquiry">
        <div className="section-inner enquiry-grid">
          <div className="enquiry-copy">
            <div className="eyebrow">PRIVATE MEDICAL ENQUIRY</div>

            <h2>
              Tell us what
              <br />
              <em>you need.</em>
            </h2>

            <p>
              Start with a conversation. Share your condition, previous
              treatment and what you are looking for. We can then guide you
              through the next steps.
            </p>

            <div className="contact-details">
              <div>
                <span>EMAIL</span>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </div>

              <div>
                <span>PHONE</span>
                <a href={`tel:${PHONE.replace(/\s/g, "")}`}>
                  {PHONE}
                </a>
              </div>

              <div>
                <span>WHATSAPP</span>
                <button
                  onClick={() =>
                    openWhatsApp(
                      "Hello Medpact, I would like to discuss medical treatment in India."
                    )
                  }
                >
                  Start a conversation →
                </button>
              </div>
            </div>
          </div>

          <div className="enquiry-form-card">
            {submitted ? (
              <div className="success-state">
                <div className="success-icon">✓</div>

                <h3>Your enquiry is ready.</h3>

                <p>
                  We opened WhatsApp with your enquiry details. Send the message
                  there so our team can start the conversation.
                </p>

                <button
                  className="button button-primary"
                  onClick={() => {
                    setSubmitted(false)
                    openWhatsApp()
                  }}
                >
                  Open WhatsApp again <span>→</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-heading">
                  <span>01</span>
                  <h3>Tell us about your treatment</h3>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Your name</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="Full name"
                      required
                    />
                  </label>

                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      placeholder="you@example.com"
                      required
                    />
                  </label>

                  <label>
                    <span>Phone / WhatsApp</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleFormChange}
                      placeholder="+1..."
                      required
                    />
                  </label>

                  <label>
                    <span>Country</span>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleFormChange}
                      placeholder="Country of residence"
                    />
                  </label>
                </div>

                <label className="full-field">
                  <span>Treatment / condition</span>
                  <input
                    name="treatment"
                    value={form.treatment}
                    onChange={handleFormChange}
                    placeholder="e.g. Knee replacement"
                    required
                  />
                </label>

                <label className="full-field">
                  <span>Tell us more</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleFormChange}
                    placeholder="Briefly describe your condition, previous treatment or what you would like to know."
                    rows="5"
                  />
                </label>

                <button
                  type="submit"
                  className="button button-primary submit-button"
                >
                  Continue with WhatsApp <span>→</span>
                </button>

                <small className="form-note">
                  Please do not share highly sensitive information through this
                  form. Detailed medical records can be shared through the
                  appropriate secure channel after initial contact.
                </small>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-mark">M</span>

              <span>
                <strong>medpact</strong>
                <small>HEALTHCARE</small>
              </span>
            </div>

            <p>
              Connecting international patients with specialist healthcare
              pathways in India.
            </p>
          </div>

          <div className="footer-column">
            <span>EXPLORE</span>
            <button onClick={() => scrollToId("treatments")}>
              Treatments
            </button>
            <button onClick={() => scrollToId("compare")}>
              Cost Guide
            </button>
            <button onClick={() => scrollToId("specialists")}>
              Specialists
            </button>
            <button onClick={() => scrollToId("journey")}>
              Your Journey
            </button>
          </div>

          <div className="footer-column">
            <span>CONTACT</span>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
            <button onClick={() => openWhatsApp()}>
              WhatsApp
            </button>
          </div>

          <div className="footer-column">
            <span>MEDICAL TOURISM</span>
            <p>India</p>
            <p>International Patients</p>
            <p>Specialist Care</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Medpact Healthcare</span>

          <span>
            Medical information is for general guidance and does not constitute
            medical advice.
          </span>
        </div>
      </footer>

      <button
        className="floating-whatsapp"
        onClick={() =>
          openWhatsApp(
            "Hello Medpact, I would like to explore medical treatment in India."
          )
        }
        aria-label="Contact Medpact on WhatsApp"
      >
        <span>◔</span>
        <strong>WhatsApp</strong>
      </button>

      <style jsx global>{`
        :root {
          --ink: #17231f;
          --muted: #68736f;
          --soft: #f5f7f4;
          --paper: #fbfcfa;
          --green: #1c5b4c;
          --green-dark: #123f35;
          --green-soft: #e8f0ec;
          --gold: #b8955b;
          --line: #dce3df;
          --white: #ffffff;
          --display: var(--font-display);
          --body: var(--font-body);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--body);
          -webkit-font-smoothing: antialiased;
        }

        button,
        input,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .site {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(210, 226, 217, 0.45),
              transparent 28%
            ),
            var(--paper);
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(220, 227, 223, 0.8);
          background: rgba(251, 252, 250, 0.92);
          backdrop-filter: blur(18px);
        }

        .header-inner {
          width: min(1380px, calc(100% - 56px));
          min-height: 82px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 11px;
          border: 0;
          background: transparent;
          color: var(--ink);
          padding: 0;
        }

        .logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: var(--green);
          color: white;
          font-family: var(--display);
          font-size: 23px;
          font-weight: 500;
        }

        .logo strong {
          display: block;
          font-size: 21px;
          letter-spacing: -0.8px;
          line-height: 18px;
        }

        .logo small {
          display: block;
          margin-top: 5px;
          color: var(--muted);
          font-size: 7px;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 26px;
          margin-left: auto;
        }

        .nav button {
          border: 0;
          background: transparent;
          color: #4e5a55;
          font-size: 13px;
          padding: 10px 0;
          transition: color 0.2s ease;
        }

        .nav button:hover {
          color: var(--green);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .currency {
          display: flex;
          padding: 3px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: white;
        }

        .currency button {
          border: 0;
          background: transparent;
          color: var(--muted);
          border-radius: 999px;
          padding: 7px 9px;
          font-size: 10px;
          font-weight: 700;
        }

        .currency button.active {
          background: var(--green);
          color: white;
        }

        .header-cta {
          border: 0;
          background: var(--ink);
          color: white;
          padding: 12px 18px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .menu-button {
          display: none;
          border: 0;
          background: transparent;
          font-size: 25px;
        }

        .hero {
          position: relative;
          min-height: 720px;
          overflow: hidden;
          background:
            linear-gradient(
              120deg,
              #f5f8f4 0%,
              #edf3ee 48%,
              #e3ece6 100%
            );
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          width: min(1380px, calc(100% - 56px));
          min-height: 720px;
          margin: auto;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: center;
          gap: 70px;
          padding: 80px 0;
        }

        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
        }

        .hero-glow-one {
          width: 500px;
          height: 500px;
          right: -120px;
          top: -120px;
          background: rgba(255, 255, 255, 0.55);
        }

        .hero-glow-two {
          width: 300px;
          height: 300px;
          left: 35%;
          bottom: -160px;
          background: rgba(184, 149, 91, 0.08);
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--green);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2.1px;
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          background: var(--gold);
          border-radius: 50%;
        }

        .hero h1 {
          max-width: 760px;
          margin: 23px 0 24px;
          font-family: var(--display);
          font-size: clamp(58px, 6.3vw, 91px);
          line-height: 0.92;
          font-weight: 400;
          letter-spacing: -4px;
        }

        h1 em,
        h2 em {
          color: var(--green);
          font-style: italic;
        }

        .hero-text {
          max-width: 630px;
          margin: 0;
          color: #59645f;
          font-size: 16px;
          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 34px;
        }

        .button {
          min-height: 50px;
          padding: 0 22px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 700;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .button:hover {
          transform: translateY(-2px);
        }

        .button-primary {
          background: var(--green);
          color: white;
          box-shadow: 0 12px 30px rgba(28, 91, 76, 0.18);
        }

        .button-outline {
          background: rgba(255, 255, 255, 0.45);
          border-color: #cbd6d0;
          color: var(--ink);
        }

        .hero-trust {
          display: flex;
          gap: 30px;
          margin-top: 50px;
          padding-top: 25px;
          border-top: 1px solid #d4ded8;
        }

        .trust-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .trust-item strong {
          color: var(--gold);
          font-size: 10px;
          letter-spacing: 1px;
        }

        .trust-item span {
          color: #5c6762;
          font-size: 11px;
        }

        .hero-card-wrap {
          position: relative;
          min-height: 500px;
          display: grid;
          place-items: center;
        }

        .hero-card {
          position: relative;
          width: min(460px, 100%);
          min-height: 470px;
          padding: 28px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          background:
            linear-gradient(
              150deg,
              rgba(255, 255, 255, 0.92),
              rgba(242, 248, 244, 0.88)
            );
          box-shadow: 0 30px 80px rgba(24, 51, 43, 0.14);
          border-radius: 5px;
          transform: rotate(1deg);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          color: #68746e;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .live-dot {
          color: #5d9b78;
          font-size: 9px;
        }

        .hero-card-main {
          padding: 80px 10px 50px;
        }

        .mini-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: var(--green);
          color: white;
          font-size: 19px;
          margin-bottom: 26px;
        }

        .hero-card h3 {
          margin: 0;
          font-family: var(--display);
          font-size: 43px;
          line-height: 0.98;
          font-weight: 400;
          letter-spacing: -1.7px;
        }

        .hero-card p {
          max-width: 350px;
          margin: 23px 0 0;
          color: #68736e;
          font-size: 13px;
          line-height: 1.7;
        }

        .card-line {
          height: 1px;
          background: #dce4df;
        }

        .card-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 23px 10px;
          gap: 30px;
        }

        .card-stats div {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .card-stats span {
          color: #87918c;
          font-size: 8px;
          letter-spacing: 1.5px;
          font-weight: 800;
        }

        .card-stats strong {
          font-size: 13px;
        }

        .card-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 0;
          background: var(--ink);
          color: white;
          padding: 15px 17px;
          font-size: 12px;
          font-weight: 700;
        }

        .floating-note {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 15px;
          border: 1px solid rgba(215, 225, 220, 0.8);
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 14px 35px rgba(27, 57, 48, 0.1);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          color: #53615a;
          backdrop-filter: blur(8px);
        }

        .floating-note span {
          color: var(--green);
        }

        .note-one {
          left: -20px;
          top: 105px;
        }

        .note-two {
          right: -25px;
          bottom: 90px;
        }

        .stats-strip {
          background: var(--green-dark);
          color: white;
        }

        .stats-inner {
          width: min(1380px, calc(100% - 56px));
          margin: auto;
          min-height: 112px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .stats-inner > div {
          padding: 25px 35px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
        }

        .stats-inner > div:last-child {
          border-right: 0;
        }

        .stats-inner strong {
          font-family: var(--display);
          font-size: 30px;
          font-weight: 400;
        }

        .stats-inner span {
          color: #b8cbc3;
          font-size: 10px;
          letter-spacing: 0.7px;
        }

        .section {
          padding: 120px 0;
        }

        .section-inner {
          width: min(1380px, calc(100% - 56px));
          margin: auto;
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 0.8fr;
          gap: 120px;
          align-items: start;
        }

        h2 {
          margin: 20px 0 0;
          font-family: var(--display);
          font-size: clamp(46px, 5vw, 70px);
          font-weight: 400;
          line-height: 0.98;
          letter-spacing: -2.8px;
        }

        .section-copy {
          padding-top: 25px;
        }

        .section-copy p {
          color: var(--muted);
          font-size: 15px;
          line-height: 1.9;
          margin: 0 0 20px;
        }

        .text-link {
          border: 0;
          background: transparent;
          padding: 10px 0;
          color: var(--green);
          font-weight: 800;
          font-size: 12px;
        }

        .text-link span {
          margin-left: 14px;
        }

        .treatment-section {
          background: #f3f6f3;
        }

        .section-heading {
          display: grid;
          grid-template-columns: 1fr 0.65fr;
          gap: 80px;
          align-items: end;
          margin-bottom: 55px;
        }

        .section-heading > p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
        }

        .department-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .department-card {
          position: relative;
          min-height: 485px;
          padding: 35px;
          overflow: hidden;
          background: white;
          border: 1px solid #e1e7e3;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .department-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(32, 54, 46, 0.08);
        }

        .department-card::after {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          border-radius: 50%;
          right: -90px;
          top: -90px;
          opacity: 0.5;
        }

        .department-card.dental::after {
          background: #eee9dd;
        }

        .department-card.cardiac::after {
          background: #e8e1e1;
        }

        .department-card.neuro::after {
          background: #e0e8e3;
        }

        .department-icon {
          position: relative;
          z-index: 1;
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--soft);
          font-size: 27px;
        }

        .department-eyebrow {
          margin-top: 75px;
          color: var(--gold);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .department-card h3 {
          margin: 10px 0 14px;
          font-family: var(--display);
          font-size: 43px;
          font-weight: 400;
          letter-spacing: -1.4px;
        }

        .department-card p {
          min-height: 82px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.75;
        }

        .department-procedures {
          display: flex;
          flex-direction: column;
          margin-top: 25px;
          border-top: 1px solid var(--line);
        }

        .department-procedures span {
          padding: 10px 0;
          border-bottom: 1px solid var(--line);
          font-size: 10px;
          color: #56615d;
        }

        .department-link {
          margin-top: 25px;
          border: 0;
          background: transparent;
          padding: 0;
          color: var(--green);
          font-size: 11px;
          font-weight: 800;
        }

        .department-link span {
          margin-left: 10px;
        }

        .comparison-section {
          background: var(--paper);
        }

        .comparison-top {
          display: grid;
          grid-template-columns: 1fr 0.7fr;
          gap: 100px;
          align-items: end;
        }

        .comparison-intro p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.8;
          margin: 0 0 20px;
        }

        .currency-note {
          display: inline-block;
          padding: 10px 13px;
          background: var(--green-soft);
          color: var(--green);
          font-size: 10px;
          letter-spacing: 0.3px;
        }

        .filter-row {
          display: flex;
          gap: 7px;
          margin: 55px 0 25px;
        }

        .filter-row button {
          border: 1px solid var(--line);
          background: white;
          color: #69746f;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
        }

        .filter-row button.active {
          background: var(--green);
          color: white;
          border-color: var(--green);
        }

        .comparison-list {
          border-top: 1px solid var(--line);
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 280px 1fr 190px;
          gap: 35px;
          align-items: center;
          padding: 24px 0;
          border-bottom: 1px solid var(--line);
        }

        .procedure-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .procedure-icon {
          flex: 0 0 auto;
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f1f4f1;
          font-size: 19px;
        }

        .procedure-info span {
          display: block;
          color: var(--gold);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.1px;
          text-transform: uppercase;
        }

        .procedure-info h3 {
          margin: 4px 0;
          font-size: 13px;
          font-weight: 700;
        }

        .procedure-info small {
          color: #8a9490;
          font-size: 9px;
        }

        .price-comparison {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .price-line {
          display: grid;
          grid-template-columns: 43px 1fr 130px;
          align-items: center;
          gap: 10px;
        }

        .price-label {
          color: #78827d;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .bar-track {
          height: 8px;
          overflow: hidden;
          background: #edf0ee;
          border-radius: 999px;
        }

        .bar {
          height: 100%;
          border-radius: 999px;
        }

        .us-bar {
          background: #9da9a3;
        }

        .india-bar {
          background: var(--green);
        }

        .price-line strong {
          text-align: right;
          font-size: 11px;
        }

        .comparison-action {
          text-align: right;
        }

        .comparison-action button {
          border: 0;
          background: transparent;
          color: var(--green);
          font-size: 10px;
          font-weight: 800;
          line-height: 1.5;
          text-align: right;
        }

        .comparison-action span {
          margin-left: 6px;
        }

        .comparison-disclaimer {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          padding: 18px;
          background: #f3f6f3;
          border: 1px solid #e2e8e4;
        }

        .comparison-disclaimer > span {
          flex: 0 0 auto;
          width: 21px;
          height: 21px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--green);
          color: white;
          font-size: 10px;
        }

        .comparison-disclaimer p {
          margin: 0;
          color: #66716c;
          font-size: 10px;
          line-height: 1.7;
        }

        .comparison-disclaimer strong {
          color: var(--ink);
        }

        .economics {
          padding-top: 20px;
          background: #f3f6f3;
        }

        .economics-card {
          padding: 70px;
          background: var(--green-dark);
          color: white;
        }

        .economics-card .eyebrow {
          color: #a8c4b8;
        }

        .economics-card h2 {
          margin-top: 18px;
        }

        .economics-card h2 em {
          color: #bdd2c8;
        }

        .economics-card > p {
          max-width: 680px;
          margin: 28px 0 45px;
          color: #b5c7bf;
          font-size: 13px;
          line-height: 1.8;
        }

        .economics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid rgba(255, 255, 255, 0.16);
        }

        .economics-grid > div {
          padding: 24px 20px 0 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-right: 1px solid rgba(255, 255, 255, 0.16);
          margin-right: 20px;
        }

        .economics-grid > div:last-child {
          border-right: 0;
        }

        .economics-grid span {
          color: #a8c4b8;
          font-size: 9px;
          font-weight: 800;
        }

        .economics-grid strong {
          font-family: var(--display);
          font-size: 23px;
          font-weight: 400;
        }

        .economics-grid small {
          color: #9eb4aa;
          font-size: 9px;
        }

        .journey-section {
          background: white;
        }

        .centered {
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }

        .centered .eyebrow {
          justify-content: center;
        }

        .centered > p {
          max-width: 630px;
          margin: 25px auto 0;
        }

        .journey-line {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 70px;
          border-top: 1px solid var(--line);
        }

        .journey-step {
          position: relative;
          padding: 35px 35px 0 0;
          margin-right: 35px;
          border-right: 1px solid var(--line);
        }

        .journey-step:last-child {
          border-right: 0;
        }

        .step-number {
          display: inline-grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--green);
          color: white;
          font-size: 10px;
          font-weight: 800;
        }

        .journey-step h3 {
          margin: 28px 0 12px;
          font-family: var(--display);
          font-size: 25px;
          font-weight: 400;
        }

        .journey-step p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.8;
        }

        .journey-cta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          margin-top: 70px;
          padding: 30px 35px;
          background: #f1f5f2;
        }

        .journey-cta span {
          color: var(--gold);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .journey-cta h3 {
          margin: 8px 0 0;
          font-family: var(--display);
          font-size: 27px;
          font-weight: 400;
        }

        .doctors-section {
          background: #f4f6f4;
        }

        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .doctor-card {
          background: white;
          border: 1px solid #e2e7e3;
        }

        .doctor-photo {
          height: 270px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 50% 30%, #dce7e1 0 17%, transparent 18%),
            linear-gradient(145deg, #eaf0ec, #d9e4de);
        }

        .doctor-photo span {
          width: 92px;
          height: 92px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.8);
          color: var(--green);
          font-family: var(--display);
          font-size: 30px;
          box-shadow: 0 15px 35px rgba(33, 65, 54, 0.08);
        }

        .doctor-info {
          padding: 24px;
        }

        .doctor-location {
          color: var(--gold);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .doctor-info h3 {
          margin: 9px 0 4px;
          font-family: var(--display);
          font-size: 26px;
          font-weight: 400;
        }

        .doctor-info p {
          min-height: 36px;
          margin: 0;
          color: var(--muted);
          font-size: 10px;
        }

        .doctor-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 23px;
          padding-top: 16px;
          border-top: 1px solid var(--line);
        }

        .doctor-bottom strong {
          font-size: 9px;
        }

        .doctor-bottom button {
          border: 0;
          background: transparent;
          color: var(--green);
          font-size: 9px;
          font-weight: 800;
        }

        .stories-section {
          background: white;
        }

        .stories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .story-card {
          border: 1px solid #e1e7e3;
          background: #fbfcfb;
        }

        .story-video {
          height: 220px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              rgba(28, 91, 76, 0.9),
              rgba(16, 52, 44, 0.95)
            );
          color: white;
        }

        .story-video span {
          position: absolute;
          bottom: 15px;
          left: 18px;
          color: #bbd1c7;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .play-button {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          padding-left: 3px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          font-size: 13px;
        }

        .story-body {
          padding: 25px;
        }

        .stars {
          color: var(--gold);
          font-size: 10px;
          letter-spacing: 2px;
        }

        .story-body > p {
          min-height: 115px;
          margin: 18px 0;
          color: #58645f;
          font-family: var(--display);
          font-size: 20px;
          line-height: 1.35;
        }

        .story-person {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
        }

        .avatar {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--green-soft);
          color: var(--green);
          font-size: 11px;
          font-weight: 800;
        }

        .story-person strong,
        .story-person span {
          display: block;
        }

        .story-person strong {
          font-size: 10px;
        }

        .story-person span {
          margin-top: 3px;
          color: #87918c;
          font-size: 8px;
        }

        .video-note {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-top: 25px;
          padding: 14px 18px;
          background: #f3f6f3;
        }

        .video-note span {
          color: var(--green);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .video-note p {
          margin: 0;
          color: #68736e;
          font-size: 9px;
        }

        .faq-section {
          background: #f3f6f3;
        }

        .faq-inner {
          display: grid;
          grid-template-columns: 0.7fr 1.1fr;
          gap: 120px;
        }

        .faq-intro {
          max-width: 300px;
          margin: 30px 0 15px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .faq-list {
          border-top: 1px solid var(--line);
        }

        .faq-item {
          border-bottom: 1px solid var(--line);
        }

        .faq-item > button {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          border: 0;
          background: transparent;
          padding: 22px 0;
          color: var(--ink);
          text-align: left;
          font-size: 13px;
          font-weight: 700;
        }

        .faq-item > button strong {
          color: var(--green);
          font-size: 20px;
          font-weight: 400;
        }

        .faq-answer {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s ease;
        }

        .faq-answer p {
          overflow: hidden;
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.8;
        }

        .faq-item.open .faq-answer {
          grid-template-rows: 1fr;
        }

        .faq-item.open .faq-answer p {
          padding-bottom: 22px;
        }

        .enquiry-section {
          background: var(--green-dark);
          color: white;
        }

        .enquiry-grid {
          display: grid;
          grid-template-columns: 0.8fr 1fr;
          gap: 100px;
          align-items: center;
        }

        .enquiry-copy .eyebrow {
          color: #a8c4b8;
        }

        .enquiry-copy h2 {
          margin-top: 20px;
        }

        .enquiry-copy h2 em {
          color: #bdd2c8;
        }

        .enquiry-copy > p {
          max-width: 470px;
          margin: 28px 0 35px;
          color: #b7c8c0;
          font-size: 13px;
          line-height: 1.8;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .contact-details > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .contact-details span {
          color: #8eaca0;
          font-size: 8px;
          letter-spacing: 1.5px;
          font-weight: 800;
        }

        .contact-details a,
        .contact-details button {
          width: fit-content;
          border: 0;
          padding: 0;
          background: transparent;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        .enquiry-form-card {
          padding: 38px;
          background: white;
          color: var(--ink);
        }

        .form-heading {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--line);
        }

        .form-heading span {
          color: var(--gold);
          font-size: 9px;
          font-weight: 800;
        }

        .form-heading h3 {
          margin: 0;
          font-family: var(--display);
          font-size: 26px;
          font-weight: 400;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        label > span {
          color: #707b76;
          font-size: 9px;
          font-weight: 700;
        }

        input,
        textarea {
          width: 100%;
          border: 1px solid #dce3df;
          background: #fafcfb;
          color: var(--ink);
          border-radius: 2px;
          padding: 12px 13px;
          outline: none;
          font-size: 11px;
          resize: vertical;
        }

        input:focus,
        textarea:focus {
          border-color: var(--green);
          background: white;
        }

        .full-field {
          margin-top: 17px;
        }

        .submit-button {
          width: 100%;
          margin-top: 22px;
        }

        .form-note {
          display: block;
          margin-top: 14px;
          color: #8a9490;
          font-size: 8px;
          line-height: 1.6;
        }

        .success-state {
          min-height: 470px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }

        .success-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin-bottom: 22px;
          border-radius: 50%;
          background: var(--green-soft);
          color: var(--green);
          font-size: 22px;
        }

        .success-state h3 {
          margin: 0;
          font-family: var(--display);
          font-size: 36px;
          font-weight: 400;
        }

        .success-state p {
          max-width: 470px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.8;
          margin: 15px 0 25px;
        }

        .footer {
          background: #102e27;
          color: white;
        }

        .footer-inner {
          width: min(1380px, calc(100% - 56px));
          margin: auto;
          padding: 70px 0 50px;
          display: grid;
          grid-template-columns: 1.5fr 0.7fr 0.8fr 0.9fr;
          gap: 60px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .footer-logo strong {
          display: block;
          font-size: 20px;
          line-height: 17px;
        }

        .footer-logo small {
          display: block;
          margin-top: 5px;
          color: #78948a;
          font-size: 7px;
          letter-spacing: 2px;
        }

        .footer-brand > p {
          max-width: 280px;
          margin-top: 25px;
          color: #8da59d;
          font-size: 10px;
          line-height: 1.8;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .footer-column > span {
          margin-bottom: 8px;
          color: #759189;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .footer-column button,
        .footer-column a,
        .footer-column p {
          border: 0;
          background: transparent;
          padding: 0;
          margin: 0;
          color: #d3ded9;
          font-size: 10px;
        }

        .footer-bottom {
          width: min(1380px, calc(100% - 56px));
          margin: auto;
          padding: 18px 0 25px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: #718b83;
          font-size: 8px;
        }

        .floating-whatsapp {
          position: fixed;
          z-index: 150;
          right: 24px;
          bottom: 24px;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 0;
          background: var(--green);
          color: white;
          padding: 12px 16px;
          border-radius: 999px;
          box-shadow: 0 15px 35px rgba(19, 64, 53, 0.25);
          font-size: 10px;
        }

        .floating-whatsapp span {
          font-size: 18px;
        }

        @media (max-width: 1100px) {
          .nav {
            gap: 15px;
          }

          .header-cta {
            display: none;
          }

          .hero-inner {
            gap: 40px;
          }

          .comparison-row {
            grid-template-columns: 250px 1fr;
          }

          .comparison-action {
            display: none;
          }

          .doctors-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .faq-inner,
          .enquiry-grid {
            gap: 60px;
          }
        }

        @media (max-width: 800px) {
          .header-inner,
          .section-inner,
          .stats-inner,
          .footer-inner,
          .footer-bottom {
            width: min(100% - 32px, 680px);
          }

          .header-inner {
            min-height: 70px;
          }

          .nav {
            position: absolute;
            left: 16px;
            right: 16px;
            top: 70px;
            display: none;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            padding: 12px 18px;
            background: rgba(251, 252, 250, 0.98);
            border: 1px solid var(--line);
            box-shadow: 0 15px 40px rgba(20, 40, 33, 0.1);
          }

          .nav.nav-open {
            display: flex;
          }

          .nav button {
            padding: 13px 0;
            text-align: left;
            border-bottom: 1px solid #edf0ee;
          }

          .menu-button {
            display: block;
          }

          .currency {
            display: none;
          }

          .hero-inner {
            min-height: auto;
            grid-template-columns: 1fr;
            padding: 70px 0 80px;
          }

          .hero h1 {
            font-size: clamp(51px, 15vw, 72px);
            letter-spacing: -3px;
          }

          .hero-card-wrap {
            min-height: 450px;
          }

          .hero-card {
            width: min(430px, 90%);
          }

          .note-one {
            left: 0;
          }

          .note-two {
            right: 0;
          }

          .stats-inner {
            grid-template-columns: 1fr 1fr;
          }

          .stats-inner > div:nth-child(2) {
            border-right: 0;
          }

          .stats-inner > div:nth-child(3),
          .stats-inner > div:nth-child(4) {
            border-top: 1px solid rgba(255, 255, 255, 0.12);
          }

          .section {
            padding: 80px 0;
          }

          .two-column,
          .section-heading,
          .comparison-top,
          .faq-inner,
          .enquiry-grid {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          h2 {
            font-size: 49px;
          }

          .department-grid,
          .stories-grid {
            grid-template-columns: 1fr;
          }

          .department-card {
            min-height: auto;
          }

          .department-card p {
            min-height: auto;
          }

          .comparison-row {
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 24px 0;
          }

          .price-line {
            grid-template-columns: 40px 1fr 110px;
          }

          .economics-card {
            padding: 40px 25px;
          }

          .economics-grid {
            grid-template-columns: 1fr 1fr;
          }

          .economics-grid > div:nth-child(2) {
            border-right: 0;
          }

          .journey-line {
            grid-template-columns: 1fr;
            border-top: 0;
          }

          .journey-step {
            padding: 25px 0;
            margin: 0;
            border-right: 0;
            border-top: 1px solid var(--line);
          }

          .journey-cta {
            flex-direction: column;
            align-items: flex-start;
          }

          .doctors-grid {
            grid-template-columns: 1fr;
          }

          .doctor-photo {
            height: 240px;
          }

          .footer-inner {
            grid-template-columns: 1fr 1fr;
            gap: 45px 30px;
          }

          .footer-brand {
            grid-column: 1 / -1;
          }

          .footer-bottom {
            flex-direction: column;
          }
        }

        @media (max-width: 500px) {
          .hero-buttons {
            flex-direction: column;
          }

          .hero-buttons .button {
            width: 100%;
          }

          .hero-trust {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .hero-card {
            min-height: 430px;
            padding: 23px;
          }

          .hero-card-main {
            padding: 65px 5px 40px;
          }

          .hero-card h3 {
            font-size: 37px;
          }

          .floating-note {
            font-size: 8px;
            padding: 10px 11px;
          }

          .note-one {
            left: -8px;
          }

          .note-two {
            right: -8px;
          }

          .filter-row {
            overflow-x: auto;
            padding-bottom: 5px;
          }

          .filter-row button {
            flex: 0 0 auto;
          }

          .price-line {
            grid-template-columns: 36px 1fr 90px;
          }

          .price-line strong {
            font-size: 9px;
          }

          .economics-grid {
            grid-template-columns: 1fr;
          }

          .economics-grid > div {
            border-right: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            padding-bottom: 18px;
            margin-right: 0;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .enquiry-form-card {
            padding: 25px 20px;
          }

          .footer-inner {
            grid-template-columns: 1fr;
          }

          .floating-whatsapp {
            right: 15px;
            bottom: 15px;
          }
        }
      `}</style>
    </main>
  )
}
