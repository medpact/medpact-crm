"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Newsreader, Public_Sans } from "next/font/google";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

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

export default function TreatmentsDirectoryPage() {
  const supabase = getSupabaseBrowserClient();

  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);

  const perPage = 12;

  useEffect(() => {
    async function loadTreatments() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("medical_treatments")
        .select("*")
        .eq("is_published", true)
        .order("featured", { ascending: false })
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        setErrorMessage(
          "We could not load treatment information right now."
        );
        setTreatments([]);
      } else {
        const normalized = (data || []).map((item) => ({
          ...item,
          generally_includes: normalizeArray(item.generally_includes),
          commonly_excluded: normalizeArray(item.commonly_excluded),
        }));

        setTreatments(normalized);
      }

      setLoading(false);
    }

    loadTreatments();
  }, [supabase]);

  const specialties = useMemo(() => {
    const values = treatments
      .map((item) => item.specialty)
      .filter(Boolean)
      .map((item) => item.trim());

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [treatments]);

  const categories = useMemo(() => {
    const values = treatments
      .map((item) => item.category)
      .filter(Boolean)
      .map((item) => item.trim());

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [treatments]);

  const filteredTreatments = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = [...treatments];

    if (specialtyFilter !== "All") {
      result = result.filter(
        (item) =>
          item.specialty?.toLowerCase() === specialtyFilter.toLowerCase()
      );
    }

    if (categoryFilter !== "All") {
      result = result.filter(
        (item) =>
          item.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (query) {
      result = result.filter((item) => {
        const searchable = [
          item.name,
          item.specialty,
          item.category,
          item.description,
          item.typical_stay,
          item.recovery_time,
          item.international_note,
          ...(item.generally_includes || []),
          ...(item.commonly_excluded || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    if (sortBy === "featured") {
      result.sort((a, b) => {
        if (Boolean(a.featured) !== Boolean(b.featured)) {
          return Boolean(b.featured) - Boolean(a.featured);
        }

        return (a.name || "").localeCompare(b.name || "");
      });
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    }

    if (sortBy === "cost-low") {
      result.sort(
        (a, b) =>
          Number(a.india_cost_min || 0) -
          Number(b.india_cost_min || 0)
      );
    }

    if (sortBy === "cost-high") {
      result.sort(
        (a, b) =>
          Number(b.india_cost_max || 0) -
          Number(a.india_cost_max || 0)
      );
    }

    return result;
  }, [
    treatments,
    search,
    specialtyFilter,
    categoryFilter,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTreatments.length / perPage)
  );

  const paginatedTreatments = filteredTreatments.slice(
    (page - 1) * perPage,
    page * perPage
  );

  useEffect(() => {
    setPage(1);
  }, [search, specialtyFilter, categoryFilter, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function resetFilters() {
    setSearch("");
    setSpecialtyFilter("All");
    setCategoryFilter("All");
    setSortBy("featured");
    setPage(1);
  }

  return (
    <main
      className={`${newsreader.variable} ${publicSans.variable} treatmentDirectory`}
    >
      <style jsx global>{`
        :root {
          --td-ink: #17211f;
          --td-muted: #66726e;
          --td-green: #164d42;
          --td-green-2: #236b5c;
          --td-gold: #b28a43;
          --td-bg: #f6f8f6;
          --td-line: #dce4df;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--td-bg);
          color: var(--td-ink);
          font-family: var(--font-public-sans), sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .td-container {
          width: min(1240px, calc(100% - 48px));
          margin: 0 auto;
        }

        .td-nav {
          position: sticky;
          top: 0;
          z-index: 30;
          border-bottom: 1px solid rgba(220, 228, 223, 0.9);
          background: rgba(246, 248, 246, 0.94);
          backdrop-filter: blur(18px);
        }

        .td-nav-inner {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .td-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 21px;
          letter-spacing: -0.5px;
        }

        .td-logo-mark {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: var(--td-green);
          color: white;
          font-size: 19px;
        }

        .td-nav-links {
          display: flex;
          align-items: center;
          gap: 26px;
          color: #4e5b56;
          font-size: 13px;
        }

        .td-nav-links a:hover {
          color: var(--td-green);
        }

        .td-nav-cta {
          border: 0;
          border-radius: 999px;
          padding: 11px 17px;
          background: var(--td-green);
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .td-hero {
          padding: 76px 0 52px;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(218, 229, 222, 0.65),
              transparent 30%
            ),
            var(--td-bg);
        }

        .td-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          color: var(--td-gold);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .td-eyebrow::before {
          content: "";
          width: 28px;
          height: 1px;
          background: var(--td-gold);
        }

        .td-hero-grid {
          display: grid;
          grid-template-columns: 1fr 0.65fr;
          gap: 70px;
          align-items: end;
        }

        .td-hero h1 {
          max-width: 800px;
          margin: 0;
          font-family: var(--font-newsreader), serif;
          font-size: clamp(48px, 6vw, 78px);
          line-height: 0.97;
          font-weight: 500;
          letter-spacing: -3px;
        }

        .td-hero h1 span {
          color: var(--td-green);
        }

        .td-hero-copy {
          max-width: 670px;
          margin: 23px 0 0;
          color: var(--td-muted);
          font-size: 16px;
          line-height: 1.7;
        }

        .td-hero-side {
          padding-left: 28px;
          border-left: 1px solid var(--td-line);
        }

        .td-hero-side strong {
          display: block;
          margin-bottom: 7px;
          font-size: 14px;
        }

        .td-hero-side p {
          margin: 0;
          color: var(--td-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .td-controls {
          position: sticky;
          top: 76px;
          z-index: 20;
          padding: 17px 0;
          border-top: 1px solid var(--td-line);
          border-bottom: 1px solid var(--td-line);
          background: rgba(246, 248, 246, 0.96);
          backdrop-filter: blur(15px);
        }

        .td-controls-grid {
          display: grid;
          grid-template-columns: 1.5fr 0.75fr 0.75fr 0.65fr;
          gap: 9px;
        }

        .td-input,
        .td-select {
          width: 100%;
          min-height: 45px;
          border: 1px solid #d5dfda;
          border-radius: 12px;
          outline: none;
          background: white;
          color: var(--td-ink);
          padding: 0 14px;
          font-size: 12px;
        }

        .td-input:focus,
        .td-select:focus {
          border-color: var(--td-green);
        }

        .td-reset {
          min-height: 45px;
          border: 1px solid var(--td-green);
          border-radius: 12px;
          background: transparent;
          color: var(--td-green);
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .td-results-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin: 28px 0 20px;
        }

        .td-results-count {
          color: var(--td-muted);
          font-size: 12px;
        }

        .td-usd-note {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--td-green);
          font-size: 11px;
          font-weight: 800;
        }

        .td-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 17px;
          padding-bottom: 50px;
        }

        .td-card {
          display: flex;
          flex-direction: column;
          min-height: 345px;
          padding: 25px;
          border: 1px solid var(--td-line);
          border-radius: 20px;
          background: white;
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease;
        }

        .td-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 22px 45px rgba(25, 57, 48, 0.08);
        }

        .td-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .td-category {
          color: var(--td-gold);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .td-featured {
          padding: 5px 8px;
          border-radius: 999px;
          background: #edf5ef;
          color: var(--td-green);
          font-size: 9px;
          font-weight: 800;
        }

        .td-card h2 {
          margin: 0 0 10px;
          font-family: var(--font-newsreader), serif;
          font-size: 28px;
          line-height: 1.04;
          font-weight: 500;
        }

        .td-specialty {
          margin-bottom: 13px;
          color: #84908b;
          font-size: 11px;
          font-weight: 700;
        }

        .td-description {
          margin: 0;
          color: var(--td-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .td-card-info {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 9px;
          margin-top: auto;
          padding-top: 23px;
        }

        .td-info-box {
          padding: 13px;
          border-radius: 12px;
          background: #f4f7f4;
        }

        .td-info-box small {
          display: block;
          margin-bottom: 5px;
          color: #87918d;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .td-info-box strong {
          font-size: 13px;
          line-height: 1.25;
        }

        .td-card-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 16px;
          color: var(--td-green);
          font-size: 12px;
          font-weight: 800;
        }

        .td-empty {
          grid-column: 1 / -1;
          padding: 70px 25px;
          border: 1px dashed #cbd7d1;
          border-radius: 20px;
          background: white;
          text-align: center;
          color: var(--td-muted);
        }

        .td-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          padding: 5px 0 90px;
        }

        .td-page-button {
          min-width: 38px;
          height: 38px;
          border: 1px solid var(--td-line);
          border-radius: 10px;
          background: white;
          color: #596560;
          cursor: pointer;
          font-size: 12px;
        }

        .td-page-button.active {
          border-color: var(--td-green);
          background: var(--td-green);
          color: white;
        }

        .td-page-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .td-footer-note {
          padding: 30px 0 100px;
          border-top: 1px solid var(--td-line);
          color: #8a9590;
          font-size: 11px;
          line-height: 1.7;
        }

        @media (max-width: 1050px) {
          .td-hero-grid {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .td-hero-side {
            padding-left: 0;
            padding-top: 20px;
            border-left: 0;
            border-top: 1px solid var(--td-line);
          }

          .td-controls-grid {
            grid-template-columns: 1fr 1fr;
          }

          .td-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .td-nav-links {
            display: none;
          }

          .td-hero {
            padding-top: 48px;
          }

          .td-controls {
            top: 66px;
          }

          .td-controls-grid {
            grid-template-columns: 1fr;
          }

          .td-grid {
            grid-template-columns: 1fr;
          }

          .td-results-bar {
            display: block;
          }

          .td-usd-note {
            margin-top: 9px;
          }
        }

        @media (max-width: 560px) {
          .td-container {
            width: min(100% - 30px, 1240px);
          }

          .td-nav-inner {
            min-height: 66px;
          }

          .td-logo {
            font-size: 19px;
          }

          .td-nav-cta {
            padding: 10px 13px;
            font-size: 11px;
          }

          .td-hero h1 {
            font-size: 49px;
            letter-spacing: -2px;
          }

          .td-hero-copy {
            font-size: 14px;
          }

          .td-card {
            min-height: 320px;
          }
        }
      `}</style>

      {/* NAV */}

      <header className="td-nav">
        <div className="td-container td-nav-inner">
          <Link href="/medicalneeds" className="td-logo">
            <span className="td-logo-mark">M</span>
            <span>Medpact</span>
          </Link>

          <nav className="td-nav-links">
            <Link href="/medicalneeds">Home</Link>
            <Link href="/medicalneeds/doctors">Doctors</Link>
            <Link href="/medicalneeds/hospitals">Hospitals</Link>
          </nav>

          <Link href="/medicalneeds" className="td-nav-cta">
            Back to Medpact
          </Link>
        </div>
      </header>

      {/* HERO */}

      <section className="td-hero">
        <div className="td-container td-hero-grid">
          <div>
            <div className="td-eyebrow">India treatment directory</div>

            <h1>
              Understand your treatment
              <span> before you travel.</span>
            </h1>

            <p className="td-hero-copy">
              Explore major medical procedures available in India, with
              indicative treatment costs, typical stay and recovery
              information for international patients.
            </p>
          </div>

          <div className="td-hero-side">
            <strong>International patient view</strong>

            <p>
              All public treatment cost ranges on this page are displayed in
              USD to make medical-travel planning easier.
            </p>
          </div>
        </div>
      </section>

      {/* FILTERS */}

      <section className="td-controls">
        <div className="td-container">
          <div className="td-controls-grid">
            <input
              className="td-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search treatment, specialty or procedure..."
            />

            <select
              className="td-select"
              value={specialtyFilter}
              onChange={(event) => setSpecialtyFilter(event.target.value)}
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty === "All"
                    ? "All specialties"
                    : specialty}
                </option>
              ))}
            </select>

            <select
              className="td-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All"
                    ? "All categories"
                    : category}
                </option>
              ))}
            </select>

            <select
              className="td-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="name">Name</option>
              <option value="cost-low">Cost: Low to High</option>
              <option value="cost-high">Cost: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* DIRECTORY */}

      <section>
        <div className="td-container">
          <div className="td-results-bar">
            <div className="td-results-count">
              {loading
                ? "Loading treatments..."
                : `${filteredTreatments.length} treatment${
                    filteredTreatments.length === 1 ? "" : "s"
                  } found`}
            </div>

            <div className="td-usd-note">
              $ USD · INDICATIVE INDIA COST
            </div>
          </div>

          {loading ? (
            <div className="td-grid">
              <div className="td-empty">
                Loading treatment information...
              </div>
            </div>
          ) : errorMessage ? (
            <div className="td-grid">
              <div className="td-empty">{errorMessage}</div>
            </div>
          ) : (
            <>
              <div className="td-grid">
                {paginatedTreatments.length === 0 ? (
                  <div className="td-empty">
                    No treatments matched your search.
                    <br />
                    <button
                      type="button"
                      onClick={resetFilters}
                      style={{
                        marginTop: 16,
                        border: "1px solid #164d42",
                        borderRadius: 999,
                        padding: "10px 16px",
                        background: "white",
                        color: "#164d42",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  paginatedTreatments.map((treatment) => (
                    <Link
                      key={treatment.id}
                      href={`/medicalneeds/treatments/${treatment.slug}`}
                      className="td-card"
                    >
                      <div className="td-card-top">
                        <span className="td-category">
                          {treatment.category ||
                            treatment.specialty ||
                            "Treatment"}
                        </span>

                        {treatment.featured && (
                          <span className="td-featured">
                            FEATURED
                          </span>
                        )}
                      </div>

                      <h2>{treatment.name}</h2>

                      {treatment.specialty && (
                        <div className="td-specialty">
                          {treatment.specialty}
                        </div>
                      )}

                      <p className="td-description">
                        {treatment.description ||
                          "Explore treatment information, recovery and indicative costs in India."}
                      </p>

                      <div className="td-card-info">
                        <div className="td-info-box">
                          <small>Estimated cost</small>

                          <strong>
                            {formatUSDRange(
                              treatment.india_cost_min,
                              treatment.india_cost_max
                            )}
                          </strong>
                        </div>

                        <div className="td-info-box">
                          <small>Typical stay</small>

                          <strong>
                            {treatment.typical_stay || "Varies"}
                          </strong>
                        </div>
                      </div>

                      <div className="td-card-link">
                        View treatment <span>→</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="td-pagination">
                  <button
                    className="td-page-button"
                    disabled={page === 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    ←
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <button
                        key={pageNumber}
                        className={`td-page-button ${
                          page === pageNumber ? "active" : ""
                        }`}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    className="td-page-button"
                    disabled={page === totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}

          <div className="td-footer-note">
            <strong>Important:</strong> Treatment costs shown on Medpact are
            indicative ranges for medical-travel planning only. They are not
            quotations or guarantees. Actual treatment costs can vary based on
            diagnosis, procedure complexity, doctor, hospital, medicines,
            implants, investigations, length of stay and individual clinical
            requirements.
          </div>
        </div>
      </section>
    </main>
  );
}
