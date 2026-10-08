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

function normalise(row) {
  return {
    ...row,
    hospitalType: row.hospital_type || "",
    keySpecialties: row.key_specialties || [],
    keyProcedures: row.key_procedures || [],
    internationalPatientServices:
      row.international_patient_services || "",
    featured: !!row.featured,
    verified: !!row.verified,
  }
}

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function shortText(value, maxLength = 145) {
  const text = String(value || "").trim()

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trim()}…`
}

export default function HospitalsDirectoryPage() {
  const [hospitals, setHospitals] = useState([])
  const [query, setQuery] = useState("")
  const [city, setCity] = useState("All cities")
  const [type, setType] = useState("All hospital types")
  const [sort, setSort] = useState("featured")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const hospitalsPerPage = 12

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const supabase = getSupabaseBrowserClient()

        const {
          data,
          error: dbError,
        } = await supabase
          .from("medical_hospitals")
          .select("*")
          .eq("is_published", true)
          .order("featured", { ascending: false })
          .order("name", { ascending: true })

        if (dbError) {
          throw dbError
        }

        if (active) {
          setHospitals(
            (data || []).map(normalise)
          )
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              "Unable to load the hospital directory."
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  /*
    Whenever the user searches, changes city,
    changes hospital type or sorting, return
    automatically to page 1.
  */
  useEffect(() => {
    setCurrentPage(1)
  }, [query, city, type, sort])

  const cities = useMemo(
    () => [
      "All cities",
      ...Array.from(
        new Set(
          hospitals
            .map((h) => h.city)
            .filter(Boolean)
        )
      ).sort(),
    ],
    [hospitals]
  )

  const types = useMemo(
    () => [
      "All hospital types",
      ...Array.from(
        new Set(
          hospitals
            .map((h) => h.hospitalType)
            .filter(Boolean)
        )
      ).sort(),
    ],
    [hospitals]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    const result = hospitals.filter((h) => {
      if (
        city !== "All cities" &&
        h.city !== city
      ) {
        return false
      }

      if (
        type !== "All hospital types" &&
        h.hospitalType !== type
      ) {
        return false
      }

      if (!q) {
        return true
      }

      return [
        h.name,
        h.city,
        h.state,
        h.hospitalType,
        h.address,
        ...(h.accreditations || []),
        ...(h.keySpecialties || []),
        ...(h.keyProcedures || []),
      ]
        .filter(Boolean)
        .some((v) =>
          String(v)
            .toLowerCase()
            .includes(q)
        )
    })

    return [...result].sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : Number(b.featured) -
            Number(a.featured) ||
          Number(b.verified) -
            Number(a.verified) ||
          a.name.localeCompare(b.name)
    )
  }, [
    hospitals,
    query,
    city,
    type,
    sort,
  ])

  /*
    PAGINATION
    12 hospitals per page
  */

  const totalPages = Math.ceil(
    filtered.length / hospitalsPerPage
  )

  const startIndex =
    (currentPage - 1) *
    hospitalsPerPage

  const endIndex =
    startIndex + hospitalsPerPage

  const paginatedHospitals =
    filtered.slice(
      startIndex,
      endIndex
    )

  return (
    <main
      className={`${displayFont.variable} ${bodyFont.variable} page`}
    >
      <style jsx global>
        {styles}
      </style>

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

          <a href="#directory">
            Hospitals
          </a>

          <Link href="/medicalneeds#cost-guide">
            Cost Guide
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
          HOSPITAL DIRECTORY
        </div>

        <h1>
          Find a hospital that fits your{" "}
          <em>care journey.</em>
        </h1>

        <p>
          Explore published hospital profiles
          by city, specialty, procedures and
          international-patient services.
          Hospital information is added and
          verified by the Medpact team.
        </p>

        <div className="searchBox">
          <span>⌕</span>

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search hospital, city, specialty or procedure…"
          />
        </div>
      </section>

      {/* DIRECTORY */}

      <section
        className="directory"
        id="directory"
      >
        <div className="directoryTop">
          <div>
            <div className="directoryEyebrow">
              MEDPACT HOSPITAL NETWORK
            </div>

            <h2>
              {filtered.length}{" "}
              {filtered.length === 1
                ? "hospital"
                : "hospitals"}
            </h2>
          </div>

          <div className="toolbar">
            <div className="filters">
              <select
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
              >
                {cities.map((x) => (
                  <option key={x}>
                    {x}
                  </option>
                ))}
              </select>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
              >
                {types.map((x) => (
                  <option key={x}>
                    {x}
                  </option>
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
            </select>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="state">
            <div className="spinner" />

            <h2>
              Loading hospital directory…
            </h2>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="state">
            <div className="stateIcon">
              !
            </div>

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

        {/* EMPTY */}

        {!loading &&
          !error &&
          hospitals.length === 0 && (
            <div className="state empty">
              <div className="orb">
                ✦
              </div>

              <div className="eyebrow">
                VERIFIED DIRECTORY
              </div>

              <h2>
                Our hospital directory
                is being curated.
              </h2>

              <p>
                Hospital profiles will appear
                here as your Medpact team
                verifies and publishes them
                from the internal dashboard.
                No placeholder hospitals
                are shown.
              </p>

              <Link
                href="/medicalneeds#review"
                className="primary"
              >
                Ask Medpact for hospital options{" "}
                <span>↗</span>
              </Link>
            </div>
          )}

        {/* NO MATCH */}

        {!loading &&
          !error &&
          hospitals.length > 0 &&
          filtered.length === 0 && (
            <div className="state">
              <h2>
                No matching hospitals
              </h2>

              <p>
                Try another city, hospital
                type, specialty or procedure.
              </p>

              <button
                onClick={() => {
                  setQuery("")
                  setCity("All cities")
                  setType(
                    "All hospital types"
                  )
                }}
              >
                Clear filters
              </button>
            </div>
          )}

        {/* HOSPITAL RESULTS */}

        {!loading &&
          !error &&
          filtered.length > 0 && (
            <>
              {/* RESULT COUNT */}

              <div className="resultsInfo">
                <span>
                  Showing{" "}
                  <strong>
                    {startIndex + 1}
                  </strong>
                  –
                  <strong>
                    {Math.min(
                      endIndex,
                      filtered.length
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {filtered.length}
                  </strong>{" "}
                  {filtered.length === 1
                    ? "hospital"
                    : "hospitals"}
                </span>
              </div>

              {/* GRID */}

              <div className="hospitalGrid">
                {paginatedHospitals.map(
                  (h) => {
                    const slug =
                      h.slug ||
                      toSlug(h.name)

                    const image =
                      h.images?.[0] || ""

                    const procedures =
                      h.keyProcedures || []

                    const chips = [
                      ...(h.accreditations ||
                        []),
                      ...(h.keySpecialties ||
                        []),
                    ].slice(0, 3)

                    return (
                      <article
                        className="hospitalCard"
                        key={h.id}
                      >
                        {/* PHOTO */}

                        <div className="photo">
                          <div className="photoPattern">
                            +
                          </div>

                          {image && (
                            <img
                              src={image}
                              alt={h.name}
                              loading="lazy"
                            />
                          )}

                          <div className="badges">
                            {h.verified && (
                              <span className="verified">
                                ✓ Verified
                              </span>
                            )}

                            {h.featured && (
                              <span className="featured">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CARD CONTENT */}

                        <div className="body">
                          <div className="top">
                            <span>
                              {h.hospitalType ||
                                "Hospital"}
                            </span>
                          </div>

                          <h2>
                            {h.name}
                          </h2>

                          <p className="location">
                            ⌖{" "}
                            {h.city ||
                              "India"}
                            {h.state
                              ? `, ${h.state}`
                              : ""}
                          </p>

                          {h.description && (
                            <p className="summary">
                              {shortText(
                                h.description
                              )}
                            </p>
                          )}

                          {chips.length >
                            0 && (
                            <div className="chips">
                              {chips.map(
                                (
                                  x,
                                  index
                                ) => (
                                  <span
                                    key={`${x}-${index}`}
                                  >
                                    {x}
                                  </span>
                                )
                              )}
                            </div>
                          )}

                          {procedures.length >
                            0 && (
                            <div className="procedureHint">
                              <span>
                                Procedures
                              </span>

                              <b>
                                {procedures
                                  .slice(
                                    0,
                                    2
                                  )
                                  .join(
                                    " · "
                                  )}
                              </b>
                            </div>
                          )}

                          {/* VIEW MORE */}

                          <Link
                            href={`/medicalneeds/hospitals/${slug}`}
                            className="view"
                          >
                            <span>
                              View more
                            </span>

                            <span className="arrow">
                              →
                            </span>
                          </Link>
                        </div>
                      </article>
                    )
                  }
                )}
              </div>

              {/* PAGINATION */}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(
                            1,
                            page - 1
                          )
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <div className="pageNumbers">
                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map((page) => (
                      <button
                        type="button"
                        key={page}
                        className={
                          currentPage ===
                          page
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.min(
                            totalPages,
                            page + 1
                          )
                      )
                    }
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
      </section>

      {/* BOTTOM CTA */}

      <section className="bottomCta">
        <div>
          <span className="eyebrow">
            NEED HELP CHOOSING?
          </span>

          <h2>
            Let Medpact shortlist hospitals
            for your treatment.
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
          navigation. Not a substitute for
          medical advice.
        </span>
      </footer>
    </main>
  )
}

const styles = `
:root{
  --ink:#12201d;
  --muted:#6b7773;
  --line:#dfe7e3;
  --paper:#f6f8f5;
  --card:#fff;
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
  padding:72px clamp(20px,7vw,100px) 48px;
  max-width:1250px;
  margin:auto;
}

.eyebrow{
  font-size:11px;
  letter-spacing:.17em;
  font-weight:800;
  color:var(--accent);
  margin-bottom:15px;
}

.hero h1{
  font-family:var(--font-display);
  font-size:clamp(46px,6vw,76px);
  font-weight:400;
  line-height:.94;
  letter-spacing:-.045em;
  max-width:800px;
  margin:0;
}

.hero h1 em{
  color:var(--accent);
  font-style:italic;
}

.hero>p{
  font-size:16px;
  line-height:1.65;
  color:var(--muted);
  max-width:700px;
  margin:24px 0 30px;
}

.searchBox{
  height:60px;
  max-width:760px;
  border:1px solid #cfdad5;
  background:white;
  border-radius:16px;
  display:flex;
  align-items:center;
  padding:0 18px;
  box-shadow:0 12px 40px rgba(18,32,29,.05);
}

.searchBox>span{
  font-size:24px;
  color:var(--accent);
}

.searchBox input{
  border:0;
  outline:0;
  flex:1;
  font:inherit;
  font-size:14px;
  padding:0 13px;
  background:transparent;
}

.directory{
  max-width:1250px;
  margin:auto;
  padding:10px clamp(20px,5vw,72px) 90px;
}

.directoryTop{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:25px;
  margin-bottom:20px;
}

.directoryEyebrow{
  color:#89938f;
  font-size:9px;
  font-weight:800;
  letter-spacing:.14em;
  text-transform:uppercase;
  margin-bottom:5px;
}

.directoryTop h2{
  margin:0;
  font-family:var(--font-display);
  font-size:30px;
  font-weight:400;
  letter-spacing:-.03em;
}

.toolbar{
  display:flex;
  gap:8px;
  align-items:center;
}

.filters{
  display:flex;
  gap:8px;
}

.toolbar select{
  border:1px solid var(--line);
  background:#fff;
  border-radius:10px;
  padding:10px 12px;
  color:#3f4d49;
  font:inherit;
  font-size:11px;
  outline:none;
}

.resultsInfo{
  display:flex;
  justify-content:flex-end;
  margin:0 0 12px;
  color:#7b8581;
  font-size:10px;
}

.resultsInfo strong{
  color:#3f4d49;
}

.hospitalGrid{
  display:grid;
  grid-template-columns:
    repeat(3,minmax(0,1fr));
  gap:18px;
}

.hospitalCard{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:18px;
  overflow:hidden;
  min-width:0;
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    border-color .2s ease;
}

.hospitalCard:hover{
  transform:translateY(-3px);
  border-color:#cbd9d4;
  box-shadow:
    0 16px 38px rgba(18,32,29,.08);
}

.photo{
  position:relative;
  height:190px;
  background:
    linear-gradient(
      145deg,
      #dcebe5,
      #f6f8f5
    );
  overflow:hidden;
}

.photo img{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  z-index:1;
  transition:transform .35s ease;
}

.hospitalCard:hover .photo img{
  transform:scale(1.035);
}

.photoPattern{
  position:absolute;
  inset:0;
  display:grid;
  place-items:center;
  font-size:65px;
  font-weight:200;
  color:#91aca4;
}

.badges{
  position:absolute;
  left:12px;
  bottom:12px;
  z-index:2;
  display:flex;
  gap:6px;
  flex-wrap:wrap;
}

.verified,
.featured{
  border-radius:999px;
  padding:6px 9px;
  font-size:8px;
  font-weight:800;
  backdrop-filter:blur(8px);
}

.verified{
  background:#e8f2ee;
  color:#0e7569;
}

.featured{
  background:rgba(18,32,29,.9);
  color:#fff;
}

.body{
  padding:18px 18px 16px;
}

.top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  font-size:9px;
  letter-spacing:.11em;
  text-transform:uppercase;
  color:#7c8883;
  margin-bottom:8px;
}

.body h2{
  font-family:var(--font-display);
  font-weight:400;
  font-size:25px;
  line-height:1.05;
  letter-spacing:-.025em;
  margin:0 0 7px;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
  min-height:52px;
}

.location{
  font-size:11px;
  color:#65736e;
  margin:0 0 10px;
}

.summary{
  font-size:11px;
  color:#6c7975;
  line-height:1.55;
  margin:0;
  display:-webkit-box;
  -webkit-line-clamp:3;
  -webkit-box-orient:vertical;
  overflow:hidden;
  min-height:51px;
}

.chips{
  display:flex;
  gap:5px;
  flex-wrap:wrap;
  margin:13px 0 10px;
  min-height:24px;
}

.chips span{
  background:var(--soft);
  color:#45645d;
  padding:5px 7px;
  border-radius:7px;
  font-size:8px;
  line-height:1.2;
}

.procedureHint{
  display:flex;
  flex-direction:column;
  gap:3px;
  margin-top:8px;
  min-height:32px;
}

.procedureHint span{
  color:#98a29e;
  font-size:8px;
  text-transform:uppercase;
  letter-spacing:.08em;
  font-weight:800;
}

.procedureHint b{
  color:#53615d;
  font-size:9px;
  font-weight:600;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.view{
  display:flex;
  align-items:center;
  justify-content:space-between;
  color:var(--ink);
  text-decoration:none;
  border-top:1px solid var(--line);
  padding-top:13px;
  margin-top:13px;
  font-size:11px;
  font-weight:800;
}

.view .arrow{
  color:var(--accent);
  font-size:17px;
  transition:transform .2s ease;
}

.view:hover .arrow{
  transform:translateX(4px);
}

/* PAGINATION */

.pagination{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  margin-top:32px;
}

.pagination>button{
  border:1px solid var(--line);
  background:#fff;
  color:var(--ink);
  border-radius:10px;
  padding:9px 13px;
  font:inherit;
  font-size:10px;
  font-weight:700;
  cursor:pointer;
}

.pagination>button:disabled{
  opacity:.35;
  cursor:not-allowed;
}

.pageNumbers{
  display:flex;
  gap:5px;
}

.pageNumbers button{
  width:34px;
  height:34px;
  border:1px solid var(--line);
  background:#fff;
  color:#53615d;
  border-radius:9px;
  font-size:10px;
  font-weight:700;
  cursor:pointer;
}

.pageNumbers button.active{
  background:var(--ink);
  color:#fff;
  border-color:var(--ink);
}

/* STATES */

.state{
  min-height:360px;
  background:#fff;
  border:1px solid var(--line);
  border-radius:22px;
  display:grid;
  place-items:center;
  text-align:center;
  padding:50px;
}

.state h2{
  font-family:var(--font-display);
  font-weight:400;
  font-size:36px;
  margin:8px 0;
}

.state p{
  max-width:560px;
  color:var(--muted);
  line-height:1.65;
}

.state button{
  border:0;
  background:var(--ink);
  color:#fff;
  border-radius:10px;
  padding:12px 17px;
  cursor:pointer;
}

.stateIcon{
  width:50px;
  height:50px;
  border-radius:16px;
  background:#f6e9e7;
  color:#a14f48;
  display:grid;
  place-items:center;
  font-weight:800;
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

.empty{
  display:block;
  padding-top:65px;
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

/* BOTTOM CTA */

.bottomCta{
  max-width:1250px;
  margin:0 auto 80px;
  padding:40px clamp(20px,5vw,60px);
  border-radius:25px;
  background:#e3eee9;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:30px;
}

.bottomCta h2{
  font-family:var(--font-display);
  font-weight:400;
  font-size:35px;
  line-height:1.05;
  margin:0;
  max-width:650px;
}

/* FOOTER */

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

/* TABLET */

@media(max-width:1050px){
  .hospitalGrid{
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }
}

/* MOBILE */

@media(max-width:760px){
  .nav{
    height:68px;
  }

  .nav nav{
    display:none;
  }

  .navCta{
    font-size:11px;
    padding:10px 12px;
  }

  .hero{
    padding-top:52px;
  }

  .directoryTop{
    align-items:flex-start;
    flex-direction:column;
  }

  .toolbar{
    width:100%;
    flex-direction:column;
    align-items:stretch;
  }

  .filters{
    display:grid;
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }

  .toolbar select{
    width:100%;
  }

  .hospitalGrid{
    grid-template-columns:1fr;
  }

  .photo{
    height:210px;
  }

  .body h2{
    font-size:29px;
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

/* SMALL MOBILE */

@media(max-width:480px){
  .hero{
    padding-left:18px;
    padding-right:18px;
  }

  .directory{
    padding-left:18px;
    padding-right:18px;
  }

  .hero h1{
    font-size:47px;
  }

  .filters{
    grid-template-columns:1fr;
  }

  .photo{
    height:190px;
  }

  .resultsInfo{
    justify-content:flex-start;
  }

  .pagination{
    gap:6px;
  }

  .pagination>button{
    padding:8px 9px;
  }

  .pageNumbers{
    gap:3px;
  }

  .pageNumbers button{
    width:31px;
    height:31px;
  }
}
`
