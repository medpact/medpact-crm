"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Newsreader, Public_Sans } from "next/font/google"
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser"

const displayFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
})

const bodyFont = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
})

function money(value, currency = "INR") {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatArray(items) {
  if (!Array.isArray(items)) return ""
  return items.join(" ")
}

export default function TreatmentsDirectoryPage() {
  const supabase = getSupabaseBrowserClient()

  const [treatments, setTreatments] = useState([])

  const [query, setQuery] = useState("")
  const [specialty, setSpecialty] = useState("All specialties")
  const [category, setCategory] = useState("All categories")
  const [sort, setSort] = useState("featured")

  const [page, setPage] = useState(1)
  const pageSize = 12

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadTreatments() {
      try {
        setLoading(true)
        setError("")

        const { data, error: dbError } = await supabase
          .from("medical_treatments")
          .select("*")
          .eq("is_published", true)
          .order("display_order", { ascending: true })
          .order("featured", { ascending: false })
          .order("name", { ascending: true })

        if (dbError) {
          throw dbError
        }

        if (active) {
          setTreatments(data || [])
        }
      } catch (err) {
        if (active) {
          setError(
            err?.message ||
              "Unable to load the treatment directory."
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadTreatments()

    return () => {
      active = false
    }
  }, [])

  const specialties = useMemo(() => {
    const values = Array.from(
      new Set(
        treatments
          .map((treatment) => treatment.specialty)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))

    return ["All specialties", ...values]
  }, [treatments])

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(
        treatments
          .map((treatment) => treatment.category)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))

    return ["All categories", ...values]
  }, [treatments])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    const result = treatments.filter((treatment) => {
      if (
        specialty !== "All specialties" &&
        treatment.specialty !== specialty
      ) {
        return false
      }

      if (
        category !== "All categories" &&
        treatment.category !== category
      ) {
        return false
      }

      if (!q) {
        return true
      }

      const searchableText = [
        treatment.name,
        treatment.specialty,
        treatment.category,
        treatment.description,
        treatment.typical_stay,
        treatment.recovery_time,
        treatment.international_note,
        formatArray(treatment.generally_includes),
        formatArray(treatment.commonly_excluded),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchableText.includes(q)
    })

    result.sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name)
      }

      if (sort === "cost-low") {
        return (
          Number(a.india_cost_min || 0) -
          Number(b.india_cost_min || 0)
        )
      }

      if (sort === "cost-high") {
        return (
          Number(b.india_cost_min || 0) -
          Number(a.india_cost_min || 0)
        )
      }

      return (
        Number(b.featured) - Number(a.featured) ||
        Number(a.display_order || 0) -
          Number(b.display_order || 0) ||
        a.name.localeCompare(b.name)
      )
    })

    return result
  }, [
    treatments,
    query,
    specialty,
    category,
    sort,
  ])

  useEffect(() => {
    setPage(1)
  }, [query, specialty, category, sort])

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  )

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedTreatments = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  function clearFilters() {
    setQuery("")
    setSpecialty("All specialties")
    setCategory("All categories")
    setSort("featured")
    setPage(1)
  }

  return (
    <main
      className={`${displayFont.variable} ${bodyFont.variable} page`}
    >
      <style jsx global>{styles}</style>

      {/* NAVIGATION */}
      <header className="nav">
        <Link href="/medicalneeds" className="brand">
          <span className="brandMark">M</span>
          <span>
            Medpact <b>Care</b>
          </span>
        </Link>

        <nav>
          <Link href="/medicalneeds">Medical Needs</Link>
          <Link href="/medicalneeds/doctors">Doctors</Link>
          <Link href="/medicalneeds/hospitals">Hospitals</Link>
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

      {/* HERO */}
      <section className="hero">
        <div className="eyebrow">
          TREATMENT & COST GUIDE
        </div>

        <h1>
          Understand the treatment before you{" "}
          <em>choose care.</em>
        </h1>

        <p>
          Explore medical procedures, specialties, typical
          hospital stays and indicative treatment costs in
          India.
        </p>

        <div className="searchBox">
          <span>⌕</span>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search treatment, specialty or procedure…"
          />

          {query && (
            <button
              className="clearSearch"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* DIRECTORY */}
      <section
        className="directory"
        id="directory"
      >
        {/* TOOLBAR */}
        <div className="toolbar">
          <div className="filters">
            <select
              value={specialty}
              onChange={(e) =>
                setSpecialty(e.target.value)
              }
            >
              {specialties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >
            <option value="featured">
              Recommended
            </option>

            <option value="name">
              Name A–Z
            </option>

            <option value="cost-low">
              Cost: Low to High
            </option>

            <option value="cost-high">
              Cost: High to Low
            </option>
          </select>
        </div>

        {/* RESULT COUNT */}
        {!loading && !error && treatments.length > 0 && (
          <div className="resultBar">
            <span>
              Showing{" "}
              <strong>
                {filtered.length}
              </strong>{" "}
              treatment
              {filtered.length === 1 ? "" : "s"}
            </span>

            {(query ||
              specialty !== "All specialties" ||
              category !== "All categories") && (
              <button onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="state">
            <div className="spinner" />
            <h2>
              Loading treatment directory…
            </h2>
            <p>
              Please wait while we load the latest
              published treatment information.
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="state">
            <div className="stateIcon">!</div>

            <h2>
              Directory temporarily unavailable
            </h2>

            <p>{error}</p>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Try again
            </button>
          </div>
        )}

        {/* EMPTY DATABASE */}
        {!loading &&
          !error &&
          treatments.length === 0 && (
            <div className="state empty">
              <div className="orb">✦</div>

              <div className="eyebrow">
                TREATMENT DIRECTORY
              </div>

              <h2>
                Our treatment directory is being
                curated.
              </h2>

              <p>
                Treatment profiles will appear here
                as the Medpact team publishes them.
              </p>

              <Link
                href="/medicalneeds#review"
                className="primary"
              >
                Ask Medpact about a treatment{" "}
                <span>↗</span>
              </Link>
            </div>
          )}

        {/* NO SEARCH RESULTS */}
        {!loading &&
          !error &&
          treatments.length > 0 &&
          filtered.length === 0 && (
            <div className="state">
              <div className="stateIcon">
                ⌕
              </div>

              <h2>
                No matching treatments
              </h2>

              <p>
                Try another treatment name,
                specialty or category.
              </p>

              <button onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}

        {/* CARDS */}
        {!loading &&
          !error &&
          paginatedTreatments.length > 0 && (
            <div className="grid">
              {paginatedTreatments.map(
                (treatment) => (
                  <article
                    className="card"
                    key={treatment.id}
                  >
                    <div className="cardTop">
                      <span>
                        {treatment.category ||
                          "Treatment"}
                      </span>

                      {treatment.featured && (
                        <b>
                          ★ Featured
                        </b>
                      )}
                    </div>

                    <h2>
                      {treatment.name}
                    </h2>

                    <p className="specialty">
                      {treatment.specialty ||
                        "Specialty information pending"}
                    </p>

                    <p className="summary">
                      {treatment.description ||
                        "Treatment information is being curated by the Medpact team."}
                    </p>

                    <div className="metrics">
                      <div>
                        <small>
                          Indicative India
                          cost
                        </small>

                        <strong>
                          {treatment.india_cost_min !=
                            null &&
                          treatment.india_cost_max !=
                            null
                            ? `${money(
                                treatment.india_cost_min,
                                treatment.currency ||
                                  "INR"
                              )} – ${money(
                                treatment.india_cost_max,
                                treatment.currency ||
                                  "INR"
                              )}`
                            : "On request"}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Typical stay
                        </small>

                        <strong>
                          {treatment.typical_stay ||
                            "Varies"}
                        </strong>
                      </div>
                    </div>

                    <div className="cardFooter">
                      <span>
                        {treatment.recovery_time
                          ? `Recovery: ${treatment.recovery_time}`
                          : "Treatment details"}
                      </span>

                      <Link
                        href={`/medicalneeds/treatments/${treatment.slug}`}
                        className="view"
                      >
                        View treatment{" "}
                        <span>→</span>
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          )}

        {/* PAGINATION */}
        {!loading &&
          !error &&
          filtered.length > pageSize && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
              >
                ← Previous
              </button>

              <div className="pageNumbers">
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((number) => (
                  <button
                    key={number}
                    className={
                      number === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPage(number)
                    }
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                  )
                }
              >
                Next →
              </button>
            </div>
          )}
      </section>

      {/* CTA */}
      <section className="bottomCta">
        <div>
          <span className="eyebrow">
            NEED A PERSONAL ESTIMATE?
          </span>

          <h2>
            Let Medpact help you understand the
            right treatment pathway for your case.
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
          Costs shown are indicative treatment
          benchmarks in India and are not hospital
          quotations.
        </span>
      </footer>
    </main>
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
  color:white;
  display:grid;
  place-items:center;
  font-family:var(--font-display);
  font-size:21px;
}

.nav nav{
  display:flex;
  gap:30px;
}

.nav nav a{
  color:#53615d;
  text-decoration:none;
  font-size:13px;
}

.nav nav a:hover{
  color:var(--accent);
}

.navCta,
.primary{
  background:var(--ink);
  color:white;
  text-decoration:none;
  padding:13px 17px;
  border-radius:13px;
  font-size:13px;
  font-weight:700;
}

.hero{
  padding:86px clamp(20px,7vw,100px) 55px;
  max-width:1250px;
  margin:auto;
}

.eyebrow{
  font-size:11px;
  letter-spacing:.17em;
  font-weight:800;
  color:var(--accent);
  margin-bottom:18px;
}

.hero h1{
  font-family:var(--font-display);
  font-size:clamp(46px,7vw,84px);
  font-weight:400;
  line-height:.92;
  letter-spacing:-.045em;
  max-width:850px;
  margin:0;
}

.hero h1 em{
  color:var(--accent);
  font-style:italic;
}

.hero>p{
  font-size:17px;
  line-height:1.65;
  color:var(--muted);
  max-width:720px;
  margin:28px 0 35px;
}

.searchBox{
  height:64px;
  max-width:780px;
  border:1px solid #cfdad5;
  background:white;
  border-radius:18px;
  display:flex;
  align-items:center;
  padding:0 18px;
  box-shadow:0 15px 50px rgba(18,32,29,.06);
}

.searchBox>span{
  font-size:25px;
  color:var(--accent);
}

.searchBox input{
  border:0;
  outline:0;
  flex:1;
  font:inherit;
  font-size:15px;
  padding:0 13px;
  background:transparent;
}

.clearSearch{
  border:0;
  background:var(--soft);
  color:var(--accent);
  width:30px;
  height:30px;
  border-radius:50%;
  cursor:pointer;
  font-size:20px;
  line-height:1;
}

.directory{
  max-width:1250px;
  margin:auto;
  padding:15px clamp(20px,5vw,72px) 90px;
}

.toolbar{
  display:flex;
  gap:20px;
  align-items:center;
  justify-content:space-between;
  margin-bottom:18px;
}

.filters{
  display:flex;
  gap:10px;
  overflow:auto;
}

.toolbar select{
  border:1px solid var(--line);
  background:#fff;
  border-radius:11px;
  padding:11px 13px;
  color:#3f4d49;
  font:inherit;
  font-size:12px;
  cursor:pointer;
}

.resultBar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
  color:#78847f;
  font-size:12px;
}

.resultBar strong{
  color:var(--ink);
}

.resultBar button{
  border:0;
  background:transparent;
  color:var(--accent);
  cursor:pointer;
  font:inherit;
  font-weight:700;
}

.grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:18px;
}

.card{
  background:#fff;
  border:1px solid var(--line);
  border-radius:22px;
  padding:25px;
  min-height:345px;
  display:flex;
  flex-direction:column;
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    border-color .2s ease;
}

.card:hover{
  transform:translateY(-3px);
  border-color:#c5d6d0;
  box-shadow:0 18px 45px rgba(18,32,29,.07);
}

.cardTop{
  display:flex;
  justify-content:space-between;
  gap:15px;
  font-size:10px;
  letter-spacing:.1em;
  text-transform:uppercase;
  color:#74807c;
}

.cardTop b{
  color:var(--accent);
  white-space:nowrap;
}

.card h2{
  font-family:var(--font-display);
  font-weight:400;
  font-size:34px;
  line-height:1.02;
  margin:16px 0 6px;
}

.specialty{
  font-size:12px;
  color:var(--accent);
  font-weight:700;
  margin:0;
}

.summary{
  font-size:13px;
  color:#687571;
  line-height:1.6;
  min-height:62px;
  margin:13px 0 0;
}

.metrics{
  display:grid;
  grid-template-columns:1.4fr .8fr;
  gap:10px;
  margin:20px 0;
}

.metrics>div{
  background:var(--soft);
  border-radius:12px;
  padding:12px;
}

.metrics small,
.metrics strong{
  display:block;
}

.metrics small{
  font-size:9px;
  color:#73817c;
  text-transform:uppercase;
  letter-spacing:.06em;
}

.metrics strong{
  font-size:12px;
  margin-top:5px;
  line-height:1.35;
}

.cardFooter{
  margin-top:auto;
  padding-top:15px;
  border-top:1px solid var(--line);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
}

.cardFooter>span{
  font-size:10px;
  color:#7b8782;
}

.view{
  display:flex;
  align-items:center;
  gap:8px;
  color:var(--ink);
  text-decoration:none;
  font-size:12px;
  font-weight:700;
  white-space:nowrap;
}

.view span{
  color:var(--accent);
  font-size:17px;
}

.state{
  min-height:360px;
  background:#fff;
  border:1px solid var(--line);
  border-radius:24px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:50px;
}

.state h2{
  font-family:var(--font-display);
  font-weight:400;
  font-size:38px;
  margin:15px 0 8px;
}

.state p{
  max-width:560px;
  color:var(--muted);
  line-height:1.65;
  font-size:14px;
}

.state button{
  border:0;
  background:var(--ink);
  color:#fff;
  border-radius:10px;
  padding:12px 17px;
  cursor:pointer;
  font:inherit;
  font-size:12px;
  font-weight:700;
}

.stateIcon{
  width:54px;
  height:54px;
  border-radius:17px;
  background:var(--soft);
  color:var(--accent);
  display:grid;
  place-items:center;
  font-size:22px;
  font-weight:800;
}

.empty{
  display:block;
  padding-top:65px;
}

.orb{
  width:62px;
  height:62px;
  border-radius:20px;
  background:var(--soft);
  color:var(--accent);
  display:grid;
  place-items:center;
  margin:0 auto 25px;
  font-size:26px;
}

.empty .eyebrow{
  margin-bottom:0;
}

.empty .primary{
  display:inline-block;
  margin-top:18px;
}

.spinner{
  width:34px;
  height:34px;
  border:3px solid #dce6e2;
  border-top-color:var(--accent);
  border-radius:50%;
  animation:spin .8s linear infinite;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

.pagination{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:12px;
  margin-top:35px;
}

.pagination>button{
  border:1px solid var(--line);
  background:white;
  color:var(--ink);
  border-radius:10px;
  padding:10px 14px;
  font:inherit;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
}

.pagination>button:disabled{
  opacity:.4;
  cursor:not-allowed;
}

.pageNumbers{
  display:flex;
  gap:5px;
}

.pageNumbers button{
  width:36px;
  height:36px;
  border:1px solid var(--line);
  background:white;
  border-radius:9px;
  cursor:pointer;
  color:var(--ink);
}

.pageNumbers button.active{
  background:var(--ink);
  color:white;
  border-color:var(--ink);
}

.bottomCta{
  max-width:1250px;
  margin:0 auto 80px;
  padding:45px clamp(20px,5vw,72px);
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

  .grid{
    grid-template-columns:1fr;
  }

  .bottomCta{
    margin-left:20px;
    margin-right:20px;
    flex-direction:column;
    align-items:flex-start;
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

  .hero{
    padding-top:55px;
  }

  .toolbar{
    align-items:stretch;
    flex-direction:column;
  }

  .filters{
    width:100%;
  }

  .filters select{
    flex:1;
    min-width:0;
  }

  .card{
    min-height:0;
  }

  .card h2{
    font-size:29px;
  }

  .metrics{
    grid-template-columns:1fr;
  }

  .cardFooter{
    align-items:flex-start;
    flex-direction:column;
  }

  .bottomCta h2{
    font-size:32px;
  }

  .pagination{
    gap:7px;
  }

  .pagination>button{
    padding:9px 10px;
  }

  .pageNumbers button{
    width:32px;
    height:32px;
  }

  footer{
    flex-direction:column;
    align-items:flex-start;
  }
}
`
