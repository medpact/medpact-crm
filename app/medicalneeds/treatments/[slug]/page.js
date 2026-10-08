import Link from "next/link";
import { notFound } from "next/navigation";
import { Newsreader, Public_Sans } from "next/font/google";
import { createClient } from "@supabase/supabase-js";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const USD_RATE = 97;

function formatUSD(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `$${Math.round(Number(value) / USD_RATE).toLocaleString("en-US")}`;
}

function formatUSDRange(min, max) {
  if (
    min === null ||
    min === undefined ||
    max === null ||
    max === undefined
  ) {
    return "Cost on request";
  }

  return `${formatUSD(min)} – ${formatUSD(max)}`;
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;

  if (!value) return [];

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function generateMetadata({ params }) {
  const supabase = getServerSupabase();

  const { data } = await supabase
    .from("medical_treatments")
    .select("name, description, specialty")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) {
    return {
      title: "Treatment | Medpact",
      description:
        "Explore medical treatments and procedures in India for international patients.",
    };
  }

  return {
    title: `${data.name} in India | Medpact`,
    description:
      data.description ||
      `Explore ${data.name}, indicative treatment costs, recovery and medical travel information in India.`,
  };
}

export default async function TreatmentDetailPage({ params }) {
  const supabase = getServerSupabase();

  const { data: treatment, error } = await supabase
    .from("medical_treatments")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !treatment) {
    notFound();
  }

  const includes = normalizeArray(treatment.generally_includes);
  const excludes = normalizeArray(treatment.commonly_excluded);

  return (
    <main
      className={`${newsreader.variable} ${publicSans.variable} treatmentDetail`}
    >
      <style jsx global>{`
        :root {
          --t-ink: #17211f;
          --t-muted: #66726e;
          --t-green: #164d42;
          --t-green-2: #236b5c;
          --t-gold: #b28a43;
          --t-bg: #f6f8f6;
          --t-line: #dce4df;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: var(--t-bg);
          color: var(--t-ink);
          font-family: var(--font-public-sans), sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .t-container {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* NAV */

        .t-nav {
          position: sticky;
          top: 0;
          z-index: 30;
          border-bottom: 1px solid rgba(220, 228, 223, 0.9);
          background: rgba(246, 248, 246, 0.94);
          backdrop-filter: blur(18px);
        }

        .t-nav-inner {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .t-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 21px;
          font-weight: 800;
        }

        .t-logo-mark {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: var(--t-green);
          color: white;
          font-size: 19px;
        }

        .t-nav-links {
          display: flex;
          align-items: center;
          gap: 25px;
          color: #53605b;
          font-size: 13px;
        }

        .t-nav-links a:hover {
          color: var(--t-green);
        }

        .t-nav-cta {
          border-radius: 999px;
          padding: 11px 17px;
          background: var(--t-green);
          color: white;
          font-size: 12px;
          font-weight: 800;
        }

        /* HERO */

        .t-hero {
          padding: 70px 0 65px;
          background:
            radial-gradient(
              circle at 78% 0%,
              rgba(218, 229, 222, 0.72),
              transparent 30%
            ),
            var(--t-bg);
        }

        .t-breadcrumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 30px;
          color: #84908b;
          font-size: 11px;
        }

        .t-breadcrumbs a:hover {
          color: var(--t-green);
        }

        .t-hero-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 70px;
          align-items: end;
        }

        .t-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          color: var(--t-gold);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .t-eyebrow::before {
          content: "";
          width: 27px;
          height: 1px;
          background: var(--t-gold);
        }

        .t-title {
          max-width: 850px;
          margin: 0;
          font-family: var(--font-newsreader), serif;
          font-size: clamp(50px, 6vw, 82px);
          line-height: 0.94;
          font-weight: 500;
          letter-spacing: -3px;
        }

        .t-specialty {
          margin-top: 18px;
          color: var(--t-muted);
          font-size: 13px;
          font-weight: 700;
        }

        .t-hero-description {
          max-width: 760px;
          margin: 24px 0 0;
          color: #5d6965;
          font-size: 16px;
          line-height: 1.7;
        }

        .t-cost-card {
          padding: 25px;
          border-radius: 22px;
          background: var(--t-green);
          color: white;
          box-shadow: 0 22px 55px rgba(22, 77, 66, 0.16);
        }

        .t-cost-label {
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.62);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .t-cost-value {
          font-family: var(--font-newsreader), serif;
          font-size: 34px;
          line-height: 1.05;
          font-weight: 500;
        }

        .t-cost-sub {
          margin-top: 12px;
          color: rgba(255, 255, 255, 0.62);
          font-size: 10px;
          line-height: 1.55;
        }

        .t-usd {
          display: inline-flex;
          margin-top: 16px;
          padding: 7px 9px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.78);
          font-size: 9px;
          font-weight: 800;
        }

        /* MAIN */

        .t-main {
          padding: 70px 0 100px;
        }

        .t-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 70px;
          align-items: start;
        }

        .t-section {
          padding-bottom: 52px;
          margin-bottom: 52px;
          border-bottom: 1px solid var(--t-line);
        }

        .t-section:last-child {
          margin-bottom: 0;
        }

        .t-kicker {
          margin-bottom: 11px;
          color: var(--t-gold);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .t-section h2 {
          margin: 0 0 17px;
          font-family: var(--font-newsreader), serif;
          font-size: 39px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -1px;
        }

        .t-section p {
          margin: 0;
          color: var(--t-muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .t-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 24px;
        }

        .t-list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          border: 1px solid var(--t-line);
          border-radius: 12px;
          background: white;
          color: #58645f;
          font-size: 12px;
          line-height: 1.5;
        }

        .t-list-check {
          width: 21px;
          height: 21px;
          flex: 0 0 21px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eaf2ec;
          color: var(--t-green);
          font-size: 11px;
          font-weight: 900;
        }

        .t-excluded .t-list-check {
          background: #f2eeee;
          color: #876c67;
        }

        .t-journey {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 24px;
        }

        .t-journey-card {
          padding: 18px;
          border-radius: 14px;
          background: white;
          border: 1px solid var(--t-line);
        }

        .t-journey-number {
          margin-bottom: 25px;
          color: var(--t-gold);
          font-size: 10px;
          font-weight: 800;
        }

        .t-journey-card strong {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .t-journey-card span {
          color: var(--t-muted);
          font-size: 11px;
          line-height: 1.5;
        }

        /* SIDEBAR */

        .t-sidebar {
          position: sticky;
          top: 100px;
        }

        .t-side-card {
          margin-bottom: 15px;
          padding: 23px;
          border: 1px solid var(--t-line);
          border-radius: 18px;
          background: white;
        }

        .t-side-card h3 {
          margin: 0 0 16px;
          font-size: 13px;
        }

        .t-side-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 11px 0;
          border-bottom: 1px solid #edf0ee;
          font-size: 11px;
        }

        .t-side-row:last-child {
          border-bottom: 0;
        }

        .t-side-row span:first-child {
          color: #89938f;
        }

        .t-side-row span:last-child {
          text-align: right;
          font-weight: 700;
        }

        .t-side-important {
          padding: 23px;
          border-radius: 18px;
          background: #edf3ee;
        }

        .t-side-important strong {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .t-side-important p {
          margin: 0;
          color: var(--t-muted);
          font-size: 11px;
          line-height: 1.65;
        }

        /* CTA */

        .t-cta {
          margin-top: 65px;
          padding: 55px;
          border-radius: 25px;
          background: var(--t-green);
          color: white;
        }

        .t-cta h2 {
          max-width: 650px;
          margin: 0;
          font-family: var(--font-newsreader), serif;
          font-size: 47px;
          line-height: 1;
          font-weight: 500;
        }

        .t-cta p {
          max-width: 600px;
          margin: 16px 0 25px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 13px;
          line-height: 1.65;
        }

        .t-cta-link {
          display: inline-flex;
          border-radius: 999px;
          padding: 13px 18px;
          background: white;
          color: var(--t-green);
          font-size: 12px;
          font-weight: 800;
        }

        .t-disclaimer {
          margin-top: 30px;
          color: #8b9691;
          font-size: 10px;
          line-height: 1.7;
        }

        @media (max-width: 950px) {
          .t-hero-grid,
          .t-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .t-sidebar {
            position: static;
          }

          .t-cost-card {
            max-width: 500px;
          }
        }

        @media (max-width: 700px) {
          .t-nav-links {
            display: none;
          }

          .t-title {
            font-size: 50px;
            letter-spacing: -2px;
          }

          .t-list,
          .t-journey {
            grid-template-columns: 1fr;
          }

          .t-section h2 {
            font-size: 34px;
          }

          .t-cta {
            padding: 32px 25px;
          }

          .t-cta h2 {
            font-size: 39px;
          }
        }

        @media (max-width: 560px) {
          .t-container {
            width: min(100% - 30px, 1160px);
          }

          .t-nav-inner {
            min-height: 66px;
          }

          .t-logo {
            font-size: 19px;
          }

          .t-nav-cta {
            padding: 10px 13px;
            font-size: 11px;
          }

          .t-hero {
            padding: 48px 0 45px;
          }

          .t-title {
            font-size: 47px;
          }

          .t-cost-value {
            font-size: 29px;
          }

          .t-main {
            padding-top: 50px;
          }
        }
      `}</style>

      {/* NAV */}

      <header className="t-nav">
        <div className="t-container t-nav-inner">
          <Link href="/medicalneeds" className="t-logo">
            <span className="t-logo-mark">M</span>
            <span>Medpact</span>
          </Link>

          <nav className="t-nav-links">
            <Link href="/medicalneeds">Home</Link>
            <Link href="/medicalneeds/doctors">Doctors</Link>
            <Link href="/medicalneeds/hospitals">Hospitals</Link>
            <Link href="/medicalneeds/treatments">Treatments</Link>
          </nav>

          <Link href="/medicalneeds/treatments" className="t-nav-cta">
            All treatments
          </Link>
        </div>
      </header>

      {/* HERO */}

      <section className="t-hero">
        <div className="t-container">
          <div className="t-breadcrumbs">
            <Link href="/medicalneeds">Medpact</Link>
            <span>›</span>
            <Link href="/medicalneeds/treatments">Treatments</Link>
            <span>›</span>
            <span>{treatment.name}</span>
          </div>

          <div className="t-hero-grid">
            <div>
              <div className="t-eyebrow">
                {treatment.category || "Medical treatment"}
              </div>

              <h1 className="t-title">{treatment.name}</h1>

              {treatment.specialty && (
                <div className="t-specialty">
                  Specialty: {treatment.specialty}
                </div>
              )}

              <p className="t-hero-description">
                {treatment.description ||
                  `Learn more about ${treatment.name}, including typical stay, recovery and indicative treatment costs in India.`}
              </p>
            </div>

            <div className="t-cost-card">
              <div className="t-cost-label">
                Estimated treatment cost in India
              </div>

              <div className="t-cost-value">
                {formatUSDRange(
                  treatment.india_cost_min,
                  treatment.india_cost_max
                )}
              </div>

              <div className="t-usd">USD · INTERNATIONAL PATIENT VIEW</div>

              <div className="t-cost-sub">
                Indicative range only. Actual costs depend on diagnosis,
                treatment complexity and individual clinical requirements.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}

      <section className="t-main">
        <div className="t-container t-layout">
          <div>
            {/* ABOUT */}

            <section className="t-section">
              <div className="t-kicker">01 · Overview</div>

              <h2>About this treatment</h2>

              <p>
                {treatment.description ||
                  `This page provides general information about ${treatment.name}. The appropriate treatment approach depends on the patient's diagnosis, medical history and clinical assessment.`}
              </p>
            </section>

            {/* INCLUDED */}

            {includes.length > 0 && (
              <section className="t-section">
                <div className="t-kicker">02 · Planning</div>

                <h2>What may generally be included</h2>

                <p>
                  The following items may commonly form part of a treatment
                  journey. The exact package or clinical plan varies by patient
                  and provider.
                </p>

                <div className="t-list">
                  {includes.map((item, index) => (
                    <div className="t-list-item" key={`${item}-${index}`}>
                      <span className="t-list-check">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* EXCLUDED */}

            {excludes.length > 0 && (
              <section className="t-section">
                <div className="t-kicker">03 · Cost clarity</div>

                <h2>What may commonly be excluded</h2>

                <p>
                  These items may be outside an indicative treatment estimate
                  and can vary depending on the patient's circumstances.
                </p>

                <div className="t-list t-excluded">
                  {excludes.map((item, index) => (
                    <div className="t-list-item" key={`${item}-${index}`}>
                      <span className="t-list-check">!</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* JOURNEY */}

            <section className="t-section">
              <div className="t-kicker">04 · Journey</div>

              <h2>What the treatment journey may look like</h2>

              <div className="t-journey">
                <div className="t-journey-card">
                  <div className="t-journey-number">01</div>

                  <strong>Clinical assessment</strong>

                  <span>
                    Diagnosis, medical history and reports are reviewed to
                    determine the appropriate treatment pathway.
                  </span>
                </div>

                <div className="t-journey-card">
                  <div className="t-journey-number">02</div>

                  <strong>Treatment planning</strong>

                  <span>
                    The medical team determines the procedure, investigations
                    and preparation required for the individual case.
                  </span>
                </div>

                <div className="t-journey-card">
                  <div className="t-journey-number">03</div>

                  <strong>Procedure & recovery</strong>

                  <span>
                    Treatment is followed by monitoring, recovery and
                    appropriate follow-up.
                  </span>
                </div>
              </div>
            </section>

            {/* INTERNATIONAL */}

            <section className="t-section">
              <div className="t-kicker">05 · Medical travel</div>

              <h2>For international patients</h2>

              <p>
                {treatment.international_note ||
                  "International patients should plan for clinical consultation, treatment, recovery and follow-up according to the treating doctor's advice. Travel duration and accommodation requirements can vary significantly by case."}
              </p>
            </section>

            {/* COST */}

            <section className="t-section">
              <div className="t-kicker">06 · Cost guide</div>

              <h2>Understanding the cost</h2>

              <p>
                The indicative treatment range for this procedure in India is:
              </p>

              <div
                style={{
                  marginTop: 22,
                  padding: "25px",
                  borderRadius: 17,
                  background: "#edf3ee",
                  color: "#164d42",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Estimated cost in India
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-newsreader), serif",
                    fontSize: 38,
                    lineHeight: 1,
                    fontWeight: 500,
                  }}
                >
                  {formatUSDRange(
                    treatment.india_cost_min,
                    treatment.india_cost_max
                  )}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    color: "#66726e",
                    fontSize: 11,
                    lineHeight: 1.6,
                  }}
                >
                  Displayed in USD for international patients. This is an
                  indicative range, not a quotation.
                </div>
              </div>
            </section>

            {/* CTA */}

            <div className="t-cta">
              <h2>Need help understanding your treatment options?</h2>

              <p>
                If you are considering treatment in India, you can start a
                conversation with Medpact about your requirement and next
                steps.
              </p>

              <a
                href={`https://wa.me/919000000000?text=${encodeURIComponent(
                  `Hello Medpact, I am interested in ${treatment.name} and would like to understand treatment options in India.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="t-cta-link"
              >
                Talk to Medpact →
              </a>
            </div>

            <div className="t-disclaimer">
              <strong>Medical information:</strong> This page is intended for
              general informational purposes and medical-travel planning. It
              does not replace consultation with a qualified medical
              professional. Treatment suitability, procedure choice, recovery
              and final cost must be determined by the treating medical team.
            </div>
          </div>

          {/* SIDEBAR */}

          <aside className="t-sidebar">
            <div className="t-side-card">
              <h3>Treatment snapshot</h3>

              <div className="t-side-row">
                <span>Specialty</span>
                <span>
                  {treatment.specialty || "Not specified"}
                </span>
              </div>

              <div className="t-side-row">
                <span>Category</span>
                <span>
                  {treatment.category || "Not specified"}
                </span>
              </div>

              <div className="t-side-row">
                <span>Typical stay</span>
                <span>
                  {treatment.typical_stay || "Varies"}
                </span>
              </div>

              <div className="t-side-row">
                <span>Recovery</span>
                <span>
                  {treatment.recovery_time || "Varies"}
                </span>
              </div>

              <div className="t-side-row">
                <span>Cost currency</span>
                <span>USD</span>
              </div>
            </div>

            <div className="t-side-important">
              <strong>Planning treatment in India?</strong>

              <p>
                Use the information on this page as a starting point. A
                patient's diagnosis and clinical requirements can significantly
                affect treatment planning and cost.
              </p>
            </div>

            <div
              className="t-side-card"
              style={{
                marginTop: 15,
                background: "#164d42",
                color: "white",
                borderColor: "#164d42",
              }}
            >
              <h3
                style={{
                  color: "white",
                  marginBottom: 10,
                }}
              >
                Explore more
              </h3>

              <Link
                href="/medicalneeds/treatments"
                style={{
                  display: "block",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 12,
                  padding: "8px 0",
                }}
              >
                All treatments →
              </Link>

              <Link
                href="/medicalneeds/doctors"
                style={{
                  display: "block",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 12,
                  padding: "8px 0",
                }}
              >
                Find doctors →
              </Link>

              <Link
                href="/medicalneeds/hospitals"
                style={{
                  display: "block",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 12,
                  padding: "8px 0",
                }}
              >
                Explore hospitals →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
