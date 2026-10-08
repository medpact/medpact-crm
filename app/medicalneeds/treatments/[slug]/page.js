import Link from "next/link"
import { notFound } from "next/navigation"
import { Newsreader, Public_Sans } from "next/font/google"
import { createClient } from "@supabase/supabase-js"

const displayFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
})

const bodyFont = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
})

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

function money(value, currency = "INR") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—"
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatList(items) {
  if (!Array.isArray(items)) return []

  return items.filter(
    (item) =>
      item !== null &&
      item !== undefined &&
      String(item).trim() !== ""
  )
}

export async function generateMetadata({ params }) {
  const { slug } = await params

  const supabase = getClient()

  const { data } = await supabase
    .from("medical_treatments")
    .select(
      "name,specialty,description,india_cost_min,india_cost_max"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (!data) {
    return {
      title: "Treatment | Medpact Care",
    }
  }

  return {
    title: `${data.name} | Medpact Care`,
    description:
      data.description ||
      `${data.name} treatment information, indicative India cost and care navigation from Medpact.`,
  }
}

export default async function TreatmentProfilePage({
  params,
}) {
  const { slug } = await params

  const supabase = getClient()

  const {
    data: treatment,
    error,
  } = await supabase
    .from("medical_treatments")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (error || !treatment) {
    notFound()
  }

  const includedItems = formatList(
    treatment.generally_includes
  )

  const excludedItems = formatList(
    treatment.commonly_excluded
  )

  const currency =
    treatment.currency || "INR"

  return (
    <main
      className={`${displayFont.variable} ${bodyFont.variable} page`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />

      {/* NAVIGATION */}
      <header className="nav">
        <Link
          href="/medicalneeds"
          className="brand"
        >
          <span className="brandMark">
            M
          </span>

          <span>
            Medpact <b>Care</b>
          </span>
        </Link>

        <nav>
          <Link href="/medicalneeds">
            Medical Needs
          </Link>

          <Link href="/medicalneeds/doctors">
            Doctors
          </Link>

          <Link href="/medicalneeds/hospitals">
            Hospitals
          </Link>

          <Link href="/medicalneeds/treatments">
            Treatments
          </Link>
        </nav>

        <Link
          href="/medicalneeds#review"
          className="navCta"
        >
          Medical Review <span>↗</span>
        </Link>
      </header>

      {/* BREADCRUMB */}
      <div className="crumb">
        <Link href="/medicalneeds/treatments">
          ← Treatment directory
        </Link>
      </div>

      {/* HERO */}
      <section className="hero">
        <div>
          <div className="eyebrow">
            {treatment.category ||
              "TREATMENT"}
          </div>

          <h1>{treatment.name}</h1>

          <p className="specialty">
            {treatment.specialty ||
              "Specialty information pending"}
          </p>

          {treatment.featured && (
            <div className="badges">
              <span>
                ★ Featured treatment
              </span>
            </div>
          )}

          <p className="description">
            {treatment.description ||
              "Treatment information is being curated by the Medpact team."}
          </p>

          <Link
            href="/medicalneeds#review"
            className="primary"
          >
            Discuss this treatment{" "}
            <span>↗</span>
          </Link>
        </div>

        {/* COST CARD */}
        <div className="costCard">
          <div className="eyebrow">
            INDICATIVE INDIA COST
          </div>

          <strong>
            {treatment.india_cost_min !=
              null &&
            treatment.india_cost_max !=
              null
              ? `${money(
                  treatment.india_cost_min,
                  currency
                )} – ${money(
                  treatment.india_cost_max,
                  currency
                )}`
              : "Cost on request"}
          </strong>

          <span className="costNote">
            Indicative treatment benchmark in
            India. This is not a hospital
            quotation.
          </span>

          <div className="mini">
            <div>
              <small>
                Typical hospital stay
              </small>

              <b>
                {treatment.typical_stay ||
                  "Varies"}
              </b>
            </div>

            <div>
              <small>
                Typical recovery
              </small>

              <b>
                {treatment.recovery_time ||
                  "Varies"}
              </b>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="content">
        <div className="main">
          {/* DESCRIPTION */}
          <Block title="About this treatment">
            <p>
              {treatment.description ||
                "Detailed treatment information will be added by the Medpact team after verification."}
            </p>
          </Block>

          {/* WHAT IS GENERALLY INCLUDED */}
          <Block title="What may generally be included">
            {includedItems.length > 0 ? (
              <ul>
                {includedItems.map(
                  (item, index) => (
                    <li key={`${item}-${index}`}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                Inclusion details vary by
                treatment and care plan and
                should be confirmed before
                treatment.
              </p>
            )}
          </Block>

          {/* WHAT MAY BE EXCLUDED */}
          <Block title="What may commonly be excluded">
            {excludedItems.length > 0 ? (
              <ul>
                {excludedItems.map(
                  (item, index) => (
                    <li key={`${item}-${index}`}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                Additional procedures,
                complications, medicines,
                travel and other services may
                be charged separately depending
                on the treatment plan.
              </p>
            )}
          </Block>

          {/* STAY + RECOVERY */}
          <Block title="Treatment journey">
            <div className="journeyGrid">
              <div className="journeyCard">
                <div className="journeyIcon">
                  ⌂
                </div>

                <div>
                  <small>
                    TYPICAL HOSPITAL STAY
                  </small>

                  <strong>
                    {treatment.typical_stay ||
                      "Varies by case"}
                  </strong>
                </div>
              </div>

              <div className="journeyCard">
                <div className="journeyIcon">
                  ↗
                </div>

                <div>
                  <small>
                    TYPICAL RECOVERY
                  </small>

                  <strong>
                    {treatment.recovery_time ||
                      "Varies by case"}
                  </strong>
                </div>
              </div>
            </div>
          </Block>

          {/* INTERNATIONAL NOTE */}
          <Block title="For international patients">
            <p>
              {treatment.international_note ||
                "International patients should confirm the treatment plan, expected hospital stay, documentation requirements and final estimate with the treating hospital before travelling."}
            </p>
          </Block>

          {/* COST EXPLANATION */}
          <Block title="Understanding the cost">
            <p>
              The amount shown above is an
              indicative treatment-level
              benchmark for India. Actual cost
              can vary depending on diagnosis,
              clinical complexity, implant or
              device selection, surgeon
              requirements, length of stay,
              medicines, investigations and
              complications.
            </p>

            <p>
              Medpact can help you understand
              the treatment pathway and request
              a more specific estimate for your
              case.
            </p>
          </Block>
        </div>

        {/* SIDEBAR */}
        <aside>
          <div className="sideCard primarySide">
            <div className="eyebrow">
              CARE NAVIGATION
            </div>

            <h3>
              Need help deciding where to
              start?
            </h3>

            <p>
              Share your medical reports and
              requirements with Medpact. Our
              team can help you understand the
              next steps.
            </p>

            <Link
              href="/medicalneeds#review"
              className="sideLink"
            >
              Request a medical review →
            </Link>
          </div>

          <div className="sideCard">
            <div className="eyebrow">
              IMPORTANT
            </div>

            <p>
              Costs displayed on this page are
              indicative and should not be
              considered a final treatment
              quotation.
            </p>

            <p>
              Treatment decisions should always
              be made in consultation with a
              qualified medical professional.
            </p>
          </div>

          {treatment.last_verified_at && (
            <div className="verifiedCard">
              <span>LAST VERIFIED</span>

              <strong>
                {new Date(
                  treatment.last_verified_at
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </strong>
            </div>
          )}
        </aside>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottomCta">
        <div>
          <span className="eyebrow">
            READY TO EXPLORE YOUR OPTIONS?
          </span>

          <h2>
            Let Medpact help you navigate
            treatment in India.
          </h2>
        </div>

        <Link
          href="/medicalneeds#review"
          className="primary"
        >
          Start a medical review{" "}
          <span>↗</span>
        </Link>
      </section>

      {/* FOOTER */}
      <footer>
        <Link
          href="/medicalneeds"
          className="brand"
        >
          <span className="brandMark">
            M
          </span>

          <span>
            Medpact <b>Care</b>
          </span>
        </Link>

        <span>
          Medical information for care
          navigation. Costs are indicative and
          not hospital quotations.
        </span>
      </footer>
    </main>
  )
}

function Block({ title, children }) {
  return (
    <section className="block">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

const styles = `
:root{
  --ink:#12201d;
  --muted:#687571;
  --line:#dfe7e3;
  --paper:#f6f8f5;
  --accent:#0e7569;
  --soft:#e8f2ee;
}

*{
  box-sizing:border-box;
}

body{
  margin:0;
  background:var(--paper);
  color:var(--ink);
  font-family:var(--font-body),Arial,sans-serif;
}

.nav{
  height:78px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 clamp(20px,5vw,72px);
  border-bottom:1px solid var(--line);
  background:rgba(246,248,245,.94);
  position:sticky;
  top:0;
  z-index:20;
  backdrop-filter:blur(16px);
}

.brand{
  display:flex;
  gap:10px;
  align-items:center;
  color:var(--ink);
  font-weight:700;
  text-decoration:none;
  letter-spacing:-.03em;
}

.brand b{
  font-weight:400;
  color:var(--accent);
}

.brandMark{
  width:34px;
  height:34px;
  border-radius:11px;
  background:var(--ink);
  color:#fff;
  display:grid;
  place-items:center;
  font-family:var(--font-display);
  font-size:21px;
}

.nav nav{
  display:flex;
  gap:24px;
}

.nav nav a{
  font-size:13px;
  color:#586560;
  text-decoration:none;
}

.nav nav a:hover{
  color:var(--accent);
}

.navCta,
.primary{
  background:var(--ink);
  color:#fff;
  text-decoration:none;
  padding:13px 17px;
  border-radius:12px;
  font-size:13px;
  font-weight:700;
}

.crumb{
  max-width:1200px;
  margin:auto;
  padding:30px 25px 10px;
}

.crumb a{
  color:#64716d;
  text-decoration:none;
  font-size:13px;
}

.crumb a:hover{
  color:var(--accent);
}

.hero{
  max-width:1200px;
  margin:auto;
  padding:35px 25px 65px;
  display:grid;
  grid-template-columns:1.15fr .85fr;
  gap:55px;
  align-items:center;
}

.eyebrow{
  font-size:10px;
  letter-spacing:.16em;
  color:var(--accent);
  font-weight:800;
}

.hero h1{
  font-family:var(--font-display);
  font-weight:400;
  font-size:clamp(55px,7vw,88px);
  line-height:.9;
  letter-spacing:-.05em;
  margin:14px 0;
}

.specialty{
  color:var(--accent);
  font-size:13px;
  font-weight:700;
}

.badges{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin:18px 0;
}

.badges span{
  background:var(--soft);
  color:var(--accent);
  border-radius:999px;
  padding:8px 11px;
  font-size:10px;
  font-weight:800;
}

.description{
  font-size:16px;
  color:#5f6d68;
  line-height:1.7;
  max-width:700px;
  margin:24px 0;
}

.costCard{
  background:var(--ink);
  color:#fff;
  border-radius:28px;
  padding:30px;
  box-shadow:0 20px 60px rgba(18,32,29,.12);
}

.costCard strong{
  display:block;
  font-family:var(--font-display);
  font-size:39px;
  font-weight:400;
  margin:14px 0 7px;
  line-height:1.05;
}

.costNote{
  color:#b9c9c3;
  font-size:11px;
  line-height:1.5;
  display:block;
}

.mini{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  margin-top:25px;
}

.mini div{
  background:#20332f;
  border-radius:13px;
  padding:14px;
}

.mini small,
.mini b{
  display:block;
}

.mini small{
  color:#91aaa2;
  font-size:9px;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.mini b{
  font-size:12px;
  margin-top:6px;
  line-height:1.4;
}

.content{
  max-width:1200px;
  margin:auto;
  padding:0 25px 90px;
  display:grid;
  grid-template-columns:minmax(0,1fr) 310px;
  gap:45px;
}

.block{
  padding:32px 0;
  border-top:1px solid var(--line);
}

.block:first-child{
  padding-top:0;
  border-top:0;
}

.block h2{
  font-family:var(--font-display);
  font-size:34px;
  font-weight:400;
  margin:0 0 17px;
}

.block p,
.block li{
  color:#5f6d68;
  line-height:1.75;
  font-size:14px;
}

.block p+p{
  margin-top:18px;
}

.block ul{
  padding-left:20px;
}

.block li{
  margin-bottom:8px;
}

.journeyGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}

.journeyCard{
  background:#fff;
  border:1px solid var(--line);
  border-radius:17px;
  padding:18px;
  display:flex;
  align-items:center;
  gap:13px;
}

.journeyIcon{
  width:42px;
  height:42px;
  border-radius:13px;
  background:var(--soft);
  color:var(--accent);
  display:grid;
  place-items:center;
  font-weight:700;
}

.journeyCard small,
.journeyCard strong{
  display:block;
}

.journeyCard small{
  color:#77837f;
  font-size:9px;
  letter-spacing:.08em;
  font-weight:800;
}

.journeyCard strong{
  margin-top:6px;
  font-size:12px;
  line-height:1.4;
}

.sideCard{
  background:#fff;
  border:1px solid var(--line);
  border-radius:20px;
  padding:23px;
  margin-bottom:15px;
}

.sideCard h3{
  font-family:var(--font-display);
  font-weight:400;
  font-size:28px;
  line-height:1.1;
  margin:13px 0;
}

.sideCard p{
  font-size:12px;
  line-height:1.7;
  color:#60706a;
}

.sideLink{
  display:block;
  background:var(--ink);
  color:#fff;
  text-decoration:none;
  text-align:center;
  border-radius:11px;
  padding:12px 14px;
  font-size:12px;
  font-weight:700;
  margin-top:17px;
}

.primarySide{
  background:#e3eee9;
  border-color:#d3e3dd;
}

.verifiedCard{
  border:1px solid var(--line);
  border-radius:16px;
  padding:17px;
  background:#fff;
}

.verifiedCard span,
.verifiedCard strong{
  display:block;
}

.verifiedCard span{
  color:#7a8581;
  font-size:9px;
  letter-spacing:.1em;
  font-weight:800;
}

.verifiedCard strong{
  margin-top:6px;
  font-size:13px;
  color:var(--accent);
}

.bottomCta{
  max-width:1200px;
  margin:0 auto 80px;
  padding:45px clamp(20px,5vw,60px);
  border-radius:28px;
  background:#e3eee9;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:30px;
}

.bottomCta h2{
  font-family:var(--font-display);
  font-weight:400;
  font-size:38px;
  line-height:1.05;
  margin:0;
  max-width:650px;
}

footer{
  border-top:1px solid var(--line);
  padding:25px clamp(20px,5vw,72px);
  display:flex;
  justify-content:space-between;
  gap:20px;
  align-items:center;
  color:#7b8581;
  font-size:10px;
}

footer .brand{
  color:var(--ink);
  font-size:14px;
}

@media(max-width:900px){

  .nav nav{
    display:none;
  }

  .hero{
    grid-template-columns:1fr;
  }

  .content{
    grid-template-columns:1fr;
  }
}

@media(max-width:620px){

  .nav{
    height:68px;
  }

  .navCta{
    font-size:11px;
    padding:10px 12px;
  }

  .crumb{
    padding:20px;
  }

  .hero{
    padding:20px 20px 50px;
  }

  .hero h1{
    font-size:55px;
  }

  .content{
    padding:0 20px 60px;
  }

  .mini{
    grid-template-columns:1fr;
  }

  .journeyGrid{
    grid-template-columns:1fr;
  }

  .bottomCta{
    margin-left:20px;
    margin-right:20px;
    flex-direction:column;
    align-items:flex-start;
  }

  .bottomCta h2{
    font-size:32px;
  }

  footer{
    flex-direction:column;
    align-items:flex-start;
  }
}
`
