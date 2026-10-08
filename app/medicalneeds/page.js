"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Newsreader, Public_Sans } from "next/font/google";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const USD_RATE = 97;

const WHATSAPP_NUMBER = "919505417890";
const EMAIL = "info@medpact.in";
const PHONE = "+91 95054 17890";

function formatUSD(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  const usd = Math.round(Number(value) / USD_RATE);

  return `$${usd.toLocaleString("en-US")}`;
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

export default function MedicalNeedsPage() {
  const supabase = getSupabaseBrowserClient();

  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function loadTreatments() {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("medical_treatments")
        .select("*")
        .eq("is_published", true)
        .order("featured", { ascending: false })
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        setLoadError("Treatment information is temporarily unavailable.");
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

  const categories = useMemo(() => {
    const values = treatments
      .map((item) => item.category)
      .filter(Boolean)
      .map((item) => item.trim());

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [treatments]);

  const filteredTreatments = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = treatments;

    if (activeCategory !== "All") {
      result = result.filter(
        (item) => item.category?.toLowerCase() === activeCategory.toLowerCase()
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

    return result;
  }, [treatments, search, activeCategory]);

  const featuredTreatments = filteredTreatments.slice(0, 6);

  const costTreatments = useMemo(() => {
    return treatments
      .filter(
        (item) =>
          item.india_cost_min !== null &&
          item.india_cost_min !== undefined &&
          item.india_cost_max !== null &&
          item.india_cost_max !== undefined
      )
      .slice(0, 4);
  }, [treatments]);

  function openWhatsApp(message) {
    const encoded = encodeURIComponent(message);

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (!search.trim()) {
      document
        .getElementById("treatments")
        ?.scrollIntoView({ behavior: "smooth" });

      return;
    }

    document
      .getElementById("treatments")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main
      className={`${newsreader.variable} ${publicSans.variable} medicalNeedsPage`}
    >
      <style jsx global>{`
        :root {
          --mn-ink: #17211f;
          --mn-muted: #65716d;
          --mn-soft: #f5f7f4;
          --mn-soft-2: #eef3ef;
          --mn-line: #dce4df;
          --mn-green: #164d42;
          --mn-green-2: #236b5c;
          --mn-gold: #b28a43;
          --mn-white: #ffffff;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f8faf8;
          color: var(--mn-ink);
          font-family: var(--font-public-sans), sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input {
          font: inherit;
        }

        .medicalNeedsPage {
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(218, 229, 222, 0.65),
              transparent 28%
            ),
            #f8faf8;
        }

        .mn-container {
          width: min(1240px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* NAVIGATION */

        .mn-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(220, 228, 223, 0.9);
          background: rgba(248, 250, 248, 0.92);
          backdrop-filter: blur(18px);
        }

        .mn-nav-inner {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .mn-logo {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .mn-logo-mark {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: var(--mn-green);
          color: white;
          font-size: 21px;
          font-weight: 700;
        }

        .mn-logo-text {
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .mn-nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
          font-size: 14px;
          color: #43504c;
        }

        .mn-nav-links a {
          transition: color 0.2s ease;
        }

        .mn-nav-links a:hover {
          color: var(--mn-green);
        }

        .mn-nav-button {
          border: 0;
          border-radius: 999px;
          padding: 12px 20px;
          background: var(--mn-green);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .mn-nav-button:hover {
          background: var(--mn-green-2);
          transform: translateY(-1px);
        }

        /* HERO */

        .mn-hero {
          padding: 76px 0 58px;
        }

        .mn-hero-grid {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 70px;
          align-items: center;
        }

        .mn-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 22px;
          color: var(--mn-gold);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.7px;
          text-transform: uppercase;
        }

        .mn-eyebrow::before {
          content: "";
          width: 28px;
          height: 1px;
          background: var(--mn-gold);
        }

        .mn-hero h1 {
          max-width: 720px;
          margin: 0;
          font-family: var(--font-newsreader), serif;
          font-size: clamp(48px, 6vw, 82px);
          line-height: 0.97;
          font-weight: 500;
          letter-spacing: -3.5px;
        }

        .mn-hero h1 span {
          color: var(--mn-green);
        }

        .mn-hero-copy {
          max-width: 650px;
          margin: 26px 0 30px;
          color: #5c6965;
          font-size: 18px;
          line-height: 1.65;
        }

        .mn-search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 650px;
          padding: 8px;
          border: 1px solid #d6dfda;
          border-radius: 18px;
          background: white;
          box-shadow: 0 18px 50px rgba(30, 60, 50, 0.08);
        }

        .mn-search-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          color: var(--mn-green);
          font-size: 21px;
        }

        .mn-search-box input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--mn-ink);
          font-size: 15px;
        }

        .mn-search-box input::placeholder {
          color: #9aa49f;
        }

        .mn-search-submit {
          border: 0;
          border-radius: 13px;
          padding: 14px 20px;
          background: var(--mn-green);
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .mn-popular {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin-top: 15px;
          color: #7b8581;
          font-size: 12px;
        }

        .mn-popular button {
          border: 1px solid #dfe5e1;
          border-radius: 999px;
          padding: 7px 11px;
          background: white;
          color: #52605b;
          cursor: pointer;
        }

        .mn-hero-panel {
          position: relative;
          min-height: 470px;
          overflow: hidden;
          border-radius: 32px;
          padding: 34px;
          background:
            linear-gradient(
              145deg,
              rgba(17, 68, 57, 0.96),
              rgba(29, 92, 77, 0.93)
            );
          color: white;
          box-shadow: 0 30px 70px rgba(21, 63, 54, 0.2);
        }

        .mn-hero-panel::before {
          content: "";
          position: absolute;
          width: 310px;
          height: 310px;
          right: -100px;
          top: -100px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .mn-hero-panel::after {
          content: "";
          position: absolute;
          width: 210px;
          height: 210px;
          right: -35px;
          bottom: -70px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .mn-panel-label {
          position: relative;
          z-index: 2;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.7px;
          opacity: 0.72;
        }

        .mn-panel-title {
          position: relative;
          z-index: 2;
          max-width: 420px;
          margin: 24px 0 34px;
          font-family: var(--font-newsreader), serif;
          font-size: 42px;
          line-height: 1.05;
          font-weight: 500;
        }

        .mn-panel-list {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 12px;
        }

        .mn-panel-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px 17px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.07);
        }

        .mn-panel-number {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.13);
          font-size: 12px;
          font-weight: 800;
        }

        .mn-panel-item strong {
          display: block;
          font-size: 14px;
        }

        .mn-panel-item span {
          display: block;
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.66);
          font-size: 12px;
        }

        .mn-panel-bottom {
          position: absolute;
          left: 34px;
          right: 34px;
          bottom: 28px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          color: rgba(255, 255, 255, 0.66);
          font-size: 12px;
        }

        /* EXPLORE SECTION */

        .mn-explore {
          padding: 12px 0 84px;
        }

        .mn-explore-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 22px;
        }

        .mn-section-kicker {
          margin-bottom: 10px;
          color: var(--mn-gold);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .mn-section-title {
          margin: 0;
          font-family: var(--font-newsreader), serif;
          font-size: clamp(34px, 4vw, 48px);
          line-height: 1;
          font-weight: 500;
          letter-spacing: -1.5px;
        }

        .mn-section-intro {
          max-width: 430px;
          margin: 0;
          color: var(--mn-muted);
          line-height: 1.6;
          font-size: 14px;
        }

        .mn-explore-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--mn-line);
          border-bottom: 1px solid var(--mn-line);
        }

        .mn-explore-card {
          position: relative;
          min-height: 255px;
          padding: 28px 26px 24px;
          border-right: 1px solid var(--mn-line);
          background: rgba(255, 255, 255, 0.58);
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .mn-explore-card:last-child {
          border-right: 0;
        }

        .mn-explore-card:hover {
          transform: translateY(-5px);
          background: white;
          z-index: 2;
        }

        .mn-card-number {
          margin-bottom: 38px;
          color: var(--mn-gold);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .mn-card-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin-bottom: 21px;
          border-radius: 14px;
          background: var(--mn-soft-2);
          color: var(--mn-green);
          font-size: 22px;
        }

        .mn-explore-card h3 {
          margin: 0 0 9px;
          font-size: 21px;
          letter-spacing: -0.5px;
        }

        .mn-explore-card p {
          max-width: 235px;
          margin: 0;
          color: var(--mn-muted);
          font-size: 13px;
          line-height: 1.55;
        }

        .mn-card-arrow {
          position: absolute;
          right: 24px;
          bottom: 24px;
          font-size: 20px;
          color: var(--mn-green);
          transition: transform 0.2s ease;
        }

        .mn-explore-card:hover .mn-card-arrow {
          transform: translate(4px, -4px);
        }

        /* INTRO */

        .mn-intro {
          padding: 95px 0;
          background: white;
        }

        .mn-intro-grid {
          display: grid;
          grid-template-columns: 0.75fr 1.25fr;
          gap: 90px;
          align-items: start;
        }

        .mn-intro-title {
          margin: 0;
          font-family: var(--font-newsreader), serif;
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1;
          font-weight: 500;
          letter-spacing: -2px;
        }

        .mn-intro-copy {
          color: #5f6b67;
          font-size: 17px;
          line-height: 1.75;
        }

        .mn-intro-copy p {
          margin: 0 0 18px;
        }

        .mn-intro-points {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 30px;
        }

        .mn-intro-point {
          padding: 18px;
          border: 1px solid var(--mn-line);
          border-radius: 15px;
          background: #fbfcfb;
        }

        .mn-intro-point strong {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .mn-intro-point span {
          color: var(--mn-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        /* TREATMENTS */

        .mn-treatments {
          padding: 96px 0;
          background: #f4f7f4;
        }

        .mn-section-heading-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 30px;
        }

        .mn-section-heading-row > div:first-child {
          max-width: 680px;
        }

        .mn-category-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 7px;
          margin-bottom: 28px;
          scrollbar-width: none;
        }

        .mn-category-row::-webkit-scrollbar {
          display: none;
        }

        .mn-category {
          flex: 0 0 auto;
          border: 1px solid #d9e2dd;
          border-radius: 999px;
          padding: 9px 15px;
          background: white;
          color: #596661;
          font-size: 12px;
          cursor: pointer;
        }

        .mn-category.active {
          border-color: var(--mn-green);
          background: var(--mn-green);
          color: white;
        }

        .mn-treatment-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .mn-treatment-card {
          display: flex;
          flex-direction: column;
          min-height: 285px;
          padding: 24px;
          border: 1px solid #dde5e0;
          border-radius: 20px;
          background: white;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .mn-treatment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(24, 55, 46, 0.08);
        }

        .mn-treatment-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 20px;
        }

        .mn-treatment-category {
          color: var(--mn-gold);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .mn-featured {
          padding: 5px 8px;
          border-radius: 999px;
          background: #edf5ef;
          color: var(--mn-green);
          font-size: 9px;
          font-weight: 800;
        }

        .mn-treatment-card h3 {
          margin: 0 0 9px;
          font-family: var(--font-newsreader), serif;
          font-size: 27px;
          line-height: 1.05;
          font-weight: 500;
        }

        .mn-treatment-card p {
          margin: 0;
          color: var(--mn-muted);
          font-size: 13px;
          line-height: 1.55;
        }

        .mn-treatment-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: auto;
          padding-top: 22px;
        }

        .mn-treatment-info-box {
          padding: 12px;
          border-radius: 12px;
          background: #f5f7f5;
        }

        .mn-treatment-info-box small {
          display: block;
          margin-bottom: 5px;
          color: #87918d;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .mn-treatment-info-box strong {
          font-size: 13px;
        }

        .mn-treatment-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 17px;
          color: var(--mn-green);
          font-size: 12px;
          font-weight: 800;
        }

        .mn-empty {
          grid-column: 1 / -1;
          padding: 60px 20px;
          border: 1px dashed #ccd7d1;
          border-radius: 20px;
          background: white;
          text-align: center;
          color: var(--mn-muted);
        }

        .mn-directory-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-top: 32px;
          border: 1px solid var(--mn-green);
          border-radius: 999px;
          padding: 12px 19px;
          color: var(--mn-green);
          font-size: 13px;
          font-weight: 800;
        }

        /* COST GUIDE */

        .mn-costs {
          padding: 100px 0;
          background: white;
        }

        .mn-cost-layout {
          display: grid;
          grid-template-columns: 0.72fr 1.28fr;
          gap: 75px;
          align-items: start;
        }

        .mn-cost-title {
          margin: 0;
          font-family: var(--font-newsreader), serif;
          font-size: clamp(42px, 5vw, 66px);
          line-height: 0.98;
          font-weight: 500;
          letter-spacing: -2px;
        }

        .mn-cost-copy {
          margin: 20px 0 0;
          color: var(--mn-muted);
          line-height: 1.7;
          font-size: 14px;
        }

        .mn-usd-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 25px;
          padding: 9px 12px;
          border-radius: 999px;
          background: var(--mn-soft-2);
          color: var(--mn-green);
          font-size: 11px;
          font-weight: 800;
        }

        .mn-cost-list {
          border-top: 1px solid var(--mn-line);
        }

        .mn-cost-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 25px;
          align-items: center;
          padding: 22px 0;
          border-bottom: 1px solid var(--mn-line);
        }

        .mn-cost-row h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .mn-cost-row p {
          margin: 0;
          color: #87918d;
          font-size: 11px;
        }

        .mn-cost-value {
          color: var(--mn-green);
          font-size: 18px;
          font-weight: 800;
          white-space: nowrap;
        }

        .mn-cost-note {
          margin-top: 24px;
          color: #8a9490;
          font-size: 11px;
          line-height: 1.6;
        }

        /* DIRECTORIES */

        .mn-directories {
          padding: 96px 0;
          background: #f4f7f4;
        }

        .mn-directory-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 35px;
        }

        .mn-directory-card {
          position: relative;
          overflow: hidden;
          min-height: 350px;
          padding: 35px;
          border-radius: 25px;
          background: var(--mn-green);
          color: white;
        }

        .mn-directory-card:nth-child(2) {
          background: #e9efeb;
          color: var(--mn-ink);
        }

        .mn-directory-card::after {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          right: -90px;
          bottom: -90px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 50%;
        }

        .mn-directory-card:nth-child(2)::after {
          border-color: rgba(22, 77, 66, 0.12);
        }

        .mn-directory-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          opacity: 0.65;
          text-transform: uppercase;
        }

        .mn-directory-card h3 {
          max-width: 440px;
          margin: 35px 0 13px;
          font-family: var(--font-newsreader), serif;
          font-size: 42px;
          line-height: 1;
          font-weight: 500;
        }

        .mn-directory-card p {
          max-width: 430px;
          margin: 0;
          opacity: 0.72;
          line-height: 1.65;
          font-size: 14px;
        }

        .mn-directory-link {
          position: absolute;
          left: 35px;
          bottom: 30px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
        }

        /* JOURNEY */

        .mn-journey {
          padding: 100px 0;
          background: white;
        }

        .mn-journey-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          margin-top: 45px;
          background: var(--mn-line);
          border: 1px solid var(--mn-line);
        }

        .mn-step {
          min-height: 190px;
          padding: 23px;
          background: white;
        }

        .mn-step-number {
          margin-bottom: 35px;
          color: var(--mn-gold);
          font-size: 11px;
          font-weight: 800;
        }

        .mn-step h3 {
          margin: 0 0 8px;
          font-size: 15px;
        }

        .mn-step p {
          margin: 0;
          color: var(--mn-muted);
          font-size: 12px;
          line-height: 1.55;
        }

        /* PARTNER */

        .mn-partner {
          padding: 95px 0;
          background: #edf3ee;
        }

        .mn-partner-inner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 50px;
          align-items: center;
        }

        .mn-partner h2 {
          margin: 0;
          max-width: 720px;
          font-family: var(--font-newsreader), serif;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1;
          font-weight: 500;
          letter-spacing: -1.5px;
        }

        .mn-partner p {
          max-width: 680px;
          margin: 18px 0 0;
          color: var(--mn-muted);
          line-height: 1.65;
        }

        .mn-partner-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 170px;
          border-radius: 999px;
          padding: 15px 22px;
          background: var(--mn-green);
          color: white;
          font-size: 13px;
          font-weight: 800;
        }

        /* FAQ */

        .mn-faq {
          padding: 100px 0;
          background: white;
        }

        .mn-faq-list {
          max-width: 850px;
          margin: 40px auto 0;
          border-top: 1px solid var(--mn-line);
        }

        .mn-faq-item {
          padding: 24px 0;
          border-bottom: 1px solid var(--mn-line);
        }

        .mn-faq-item h3 {
          margin: 0 0 9px;
          font-size: 16px;
        }

        .mn-faq-item p {
          max-width: 760px;
          margin: 0;
          color: var(--mn-muted);
          font-size: 13px;
          line-height: 1.7;
        }

        /* CTA */

        .mn-final-cta {
          padding: 85px 0 110px;
          background: var(--mn-green);
          color: white;
        }

        .mn-final-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 50px;
          align-items: center;
        }

        .mn-final-cta h2 {
          max-width: 700px;
          margin: 0;
          font-family: var(--font-newsreader), serif;
          font-size: clamp(42px, 5vw, 68px);
          line-height: 0.98;
          font-weight: 500;
        }

        .mn-final-cta p {
          max-width: 650px;
          margin: 20px 0 0;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .mn-final-button {
          border: 0;
          border-radius: 999px;
          padding: 16px 23px;
          background: white;
          color: var(--mn-green);
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        /* FOOTER */

        .mn-footer {
          padding: 45px 0 95px;
          background: #102f29;
          color: white;
        }

        .mn-footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 40px;
        }

        .mn-footer-brand p {
          max-width: 330px;
          margin: 15px 0 0;
          color: rgba(255, 255, 255, 0.55);
          font-size: 12px;
          line-height: 1.6;
        }

        .mn-footer h4 {
          margin: 0 0 14px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 10px;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .mn-footer-links {
          display: grid;
          gap: 9px;
          font-size: 12px;
        }

        .mn-footer-links a {
          color: rgba(255, 255, 255, 0.76);
        }

        .mn-footer-bottom {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-top: 45px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.4);
          font-size: 10px;
        }

        /* FLOATING */

        .mn-floating {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 40;
          border: 0;
          border-radius: 999px;
          padding: 14px 19px;
          background: var(--mn-green);
          color: white;
          box-shadow: 0 14px 35px rgba(20, 58, 49, 0.25);
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .mn-mobile-review {
          display: none;
        }

        @media (max-width: 1050px) {
          .mn-hero-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .mn-hero-panel {
            min-height: 390px;
          }

          .mn-explore-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .mn-explore-card:nth-child(2) {
            border-right: 0;
          }

          .mn-explore-card:nth-child(-n + 2) {
            border-bottom: 1px solid var(--mn-line);
          }

          .mn-treatment-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .mn-intro-grid,
          .mn-cost-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .mn-journey-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .mn-footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 820px) {
          .mn-nav-links {
            display: none;
          }

          .mn-hero {
            padding-top: 50px;
          }

          .mn-hero h1 {
            letter-spacing: -2px;
          }

          .mn-directory-grid {
            grid-template-columns: 1fr;
          }

          .mn-partner-inner,
          .mn-final-grid {
            grid-template-columns: 1fr;
          }

          .mn-partner-button {
            width: fit-content;
          }
        }

        @media (max-width: 560px) {
          .mn-container {
            width: min(100% - 30px, 1240px);
          }

          .mn-nav-inner {
            min-height: 66px;
          }

          .mn-logo-text {
            font-size: 19px;
          }

          .mn-nav-button {
            padding: 10px 14px;
            font-size: 12px;
          }

          .mn-hero {
            padding: 42px 0 40px;
          }

          .mn-hero h1 {
            font-size: 48px;
          }

          .mn-hero-copy {
            font-size: 15px;
          }

          .mn-search-box {
            padding: 6px;
          }

          .mn-search-icon {
            width: 38px;
            height: 42px;
          }

          .mn-search-submit {
            padding: 12px 14px;
          }

          .mn-search-box input {
            font-size: 13px;
          }

          .mn-hero-panel {
            min-height: 430px;
            padding: 25px;
            border-radius: 24px;
          }

          .mn-panel-title {
            font-size: 36px;
          }

          .mn-panel-bottom {
            left: 25px;
            right: 25px;
          }

          .mn-explore {
            padding-bottom: 65px;
          }

          .mn-explore-header,
          .mn-section-heading-row {
            display: block;
          }

          .mn-section-intro {
            margin-top: 15px;
          }

          .mn-explore-grid {
            grid-template-columns: 1fr;
          }

          .mn-explore-card {
            min-height: 220px;
            border-right: 0;
            border-bottom: 1px solid var(--mn-line);
          }

          .mn-explore-card:last-child {
            border-bottom: 0;
          }

          .mn-card-number {
            margin-bottom: 25px;
          }

          .mn-intro,
          .mn-treatments,
          .mn-costs,
          .mn-directories,
          .mn-journey,
          .mn-partner,
          .mn-faq {
            padding: 70px 0;
          }

          .mn-intro-points {
            grid-template-columns: 1fr;
          }

          .mn-treatment-grid {
            grid-template-columns: 1fr;
          }

          .mn-treatment-card {
            min-height: 270px;
          }

          .mn-cost-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .mn-cost-value {
            font-size: 17px;
          }

          .mn-directory-card {
            min-height: 315px;
            padding: 28px;
          }

          .mn-directory-card h3 {
            margin-top: 28px;
            font-size: 37px;
          }

          .mn-directory-link {
            left: 28px;
          }

          .mn-journey-grid {
            grid-template-columns: 1fr;
          }

          .mn-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 30px 20px;
          }

          .mn-footer-brand {
            grid-column: 1 / -1;
          }

          .mn-footer-bottom {
            display: block;
          }

          .mn-footer-bottom div + div {
            margin-top: 8px;
          }

          .mn-floating {
            display: none;
          }

          .mn-mobile-review {
            position: fixed;
            left: 12px;
            right: 12px;
            bottom: 12px;
            z-index: 60;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 11px 12px 11px 16px;
            border-radius: 17px;
            background: var(--mn-green);
            color: white;
            box-shadow: 0 12px 35px rgba(17, 55, 46, 0.3);
          }

          .mn-mobile-review span {
            font-size: 11px;
            font-weight: 700;
          }

          .mn-mobile-review button {
            border: 0;
            border-radius: 999px;
            padding: 9px 13px;
            background: white;
            color: var(--mn-green);
            font-size: 11px;
            font-weight: 800;
          }
        }
      `}</style>

      {/* NAVIGATION */}

      <header className="mn-nav">
        <div className="mn-container mn-nav-inner">
          <Link href="/medicalneeds" className="mn-logo">
            <div className="mn-logo-mark">M</div>
            <div className="mn-logo-text">Medpact</div>
          </Link>

          <nav className="mn-nav-links">
            <Link href="#treatments">Treatments</Link>
            <Link href="/medicalneeds/doctors">Doctors</Link>
            <Link href="/medicalneeds/hospitals">Hospitals</Link>
            <Link href="/medicalneeds/treatments">Cost Guide</Link>
          </nav>

          <button
            className="mn-nav-button"
            onClick={() =>
              openWhatsApp(
                "Hello Medpact, I would like help planning medical treatment in India."
              )
            }
          >
            Talk to Medpact
          </button>
        </div>
      </header>

      {/* HERO */}

      <section className="mn-hero">
        <div className="mn-container mn-hero-grid">
          <div>
            <div className="mn-eyebrow">Medical care in India</div>

            <h1>
              Better care.
              <br />
              <span>Better clarity.</span>
            </h1>

            <p className="mn-hero-copy">
              Explore doctors, hospitals and treatment options in India with
              clear information on procedures, recovery and indicative costs —
              designed for international patients.
            </p>

            <form className="mn-search-box" onSubmit={handleSearchSubmit}>
              <div className="mn-search-icon">⌕</div>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search a treatment, specialty or procedure..."
              />

              <button className="mn-search-submit" type="submit">
                Search
              </button>
            </form>

            <div className="mn-popular">
              <span>Popular:</span>

              {["Knee Replacement", "Heart Surgery", "Dental Implant"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearch(item);
                      document
                        .getElementById("treatments")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mn-hero-panel">
            <div className="mn-panel-label">YOUR INDIA CARE JOURNEY</div>

            <div className="mn-panel-title">
              One place to understand your treatment journey.
            </div>

            <div className="mn-panel-list">
              <div className="mn-panel-item">
                <div className="mn-panel-number">01</div>
                <div>
                  <strong>Understand your treatment</strong>
                  <span>Procedure, recovery and expectations</span>
                </div>
              </div>

              <div className="mn-panel-item">
                <div className="mn-panel-number">02</div>
                <div>
                  <strong>Explore doctors & hospitals</strong>
                  <span>Discover care options in India</span>
                </div>
              </div>

              <div className="mn-panel-item">
                <div className="mn-panel-number">03</div>
                <div>
                  <strong>Understand indicative costs</strong>
                  <span>All public cost information shown in USD</span>
                </div>
              </div>
            </div>

            <div className="mn-panel-bottom">
              <span>International patient support</span>
              <span>India · USD</span>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE */}

      <section className="mn-explore">
        <div className="mn-container">
          <div className="mn-explore-header">
            <div>
              <div className="mn-section-kicker">Explore Medpact</div>
              <h2 className="mn-section-title">Start with what you need.</h2>
            </div>

            <p className="mn-section-intro">
              Everything you need to begin researching medical care in India,
              organised in one simple place.
            </p>
          </div>

          <div className="mn-explore-grid">
            <Link href="/medicalneeds/doctors" className="mn-explore-card">
              <div className="mn-card-number">01</div>

              <div className="mn-card-icon">♙</div>

              <h3>Doctors</h3>

              <p>
                Explore specialists by expertise, procedure and location.
              </p>

              <div className="mn-card-arrow">↗</div>
            </Link>

            <Link href="/medicalneeds/hospitals" className="mn-explore-card">
              <div className="mn-card-number">02</div>

              <div className="mn-card-icon">＋</div>

              <h3>Hospitals</h3>

              <p>
                Discover hospitals and services available for international
                patients.
              </p>

              <div className="mn-card-arrow">↗</div>
            </Link>

            <Link href="/medicalneeds/treatments" className="mn-explore-card">
              <div className="mn-card-number">03</div>

              <div className="mn-card-icon">✚</div>

              <h3>Treatments</h3>

              <p>
                Explore procedures, recovery, typical stay and treatment
                information.
              </p>

              <div className="mn-card-arrow">↗</div>
            </Link>

            <Link href="/medicalneeds/treatments" className="mn-explore-card">
              <div className="mn-card-number">04</div>

              <div className="mn-card-icon">$</div>

              <h3>Cost Guide</h3>

              <p>
                Understand indicative treatment costs in India, shown in USD.
              </p>

              <div className="mn-card-arrow">↗</div>
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}

      <section className="mn-intro">
        <div className="mn-container mn-intro-grid">
          <div>
            <div className="mn-section-kicker">Why Medpact</div>

            <h2 className="mn-intro-title">
              India, made easier to understand.
            </h2>
          </div>

          <div className="mn-intro-copy">
            <p>
              Choosing treatment in another country involves more than finding
              a hospital. Patients need to understand the procedure, identify
              the right specialists, compare options and plan the journey.
            </p>

            <p>
              Medpact brings these pieces together so international patients
              can begin their research with greater clarity.
            </p>

            <div className="mn-intro-points">
              <div className="mn-intro-point">
                <strong>Information first</strong>
                <span>
                  Understand procedures before making travel decisions.
                </span>
              </div>

              <div className="mn-intro-point">
                <strong>USD cost visibility</strong>
                <span>
                  Public indicative treatment ranges are presented in USD.
                </span>
              </div>

              <div className="mn-intro-point">
                <strong>India-focused</strong>
                <span>
                  Built around the needs of patients considering India.
                </span>
              </div>

              <div className="mn-intro-point">
                <strong>Human assistance</strong>
                <span>
                  Speak with Medpact when you are ready to explore your options.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TREATMENTS */}

      <section className="mn-treatments" id="treatments">
        <div className="mn-container">
          <div className="mn-section-heading-row">
            <div>
              <div className="mn-section-kicker">Treatment directory</div>

              <h2 className="mn-section-title">
                Explore treatments and procedures.
              </h2>
            </div>

            <p className="mn-section-intro">
              Browse major procedures with indicative costs, typical stay and
              recovery information.
            </p>
          </div>

          <div className="mn-category-row">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`mn-category ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mn-empty">Loading treatment information...</div>
          ) : loadError ? (
            <div className="mn-empty">{loadError}</div>
          ) : featuredTreatments.length === 0 ? (
            <div className="mn-empty">
              No treatments matched your search.
            </div>
          ) : (
            <div className="mn-treatment-grid">
              {featuredTreatments.map((treatment) => (
                <Link
                  key={treatment.id}
                  href={`/medicalneeds/treatments/${treatment.slug}`}
                  className="mn-treatment-card"
                >
                  <div className="mn-treatment-meta">
                    <span className="mn-treatment-category">
                      {treatment.category || treatment.specialty || "Treatment"}
                    </span>

                    {treatment.featured && (
                      <span className="mn-featured">FEATURED</span>
                    )}
                  </div>

                  <h3>{treatment.name}</h3>

                  <p>
                    {treatment.description ||
                      "Explore treatment information, recovery and indicative costs in India."}
                  </p>

                  <div className="mn-treatment-info">
                    <div className="mn-treatment-info-box">
                      <small>Estimated cost</small>
                      <strong>
                        {formatUSDRange(
                          treatment.india_cost_min,
                          treatment.india_cost_max
                        )}
                      </strong>
                    </div>

                    <div className="mn-treatment-info-box">
                      <small>Typical stay</small>
                      <strong>{treatment.typical_stay || "Varies"}</strong>
                    </div>
                  </div>

                  <div className="mn-treatment-link">
                    View treatment <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/medicalneeds/treatments"
            className="mn-directory-button"
          >
            View complete treatment directory →
          </Link>
        </div>
      </section>

      {/* COST GUIDE */}

      <section className="mn-costs">
        <div className="mn-container mn-cost-layout">
          <div>
            <div className="mn-section-kicker">Cost intelligence</div>

            <h2 className="mn-cost-title">
              Understand the cost before you travel.
            </h2>

            <p className="mn-cost-copy">
              Explore indicative treatment costs in India so you can begin
              planning your medical journey with a realistic budget.
            </p>

            <div className="mn-usd-badge">
              $ USD · INTERNATIONAL PATIENT VIEW
            </div>
          </div>

          <div>
            <div className="mn-cost-list">
              {costTreatments.length === 0 ? (
                <div className="mn-empty">
                  Cost information will appear here as treatment data becomes
                  available.
                </div>
              ) : (
                costTreatments.map((treatment) => (
                  <Link
                    href={`/medicalneeds/treatments/${treatment.slug}`}
                    key={treatment.id}
                    className="mn-cost-row"
                  >
                    <div>
                      <h3>{treatment.name}</h3>

                      <p>
                        {treatment.specialty ||
                          treatment.category ||
                          "Medical treatment"}
                      </p>
                    </div>

                    <div className="mn-cost-value">
                      {formatUSDRange(
                        treatment.india_cost_min,
                        treatment.india_cost_max
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="mn-cost-note">
              Indicative ranges only. These figures are not quotations and may
              vary depending on diagnosis, treatment complexity, doctor,
              hospital, length of stay and individual clinical requirements.
            </div>

            <Link
              href="/medicalneeds/treatments"
              className="mn-directory-button"
            >
              Explore full cost guide →
            </Link>
          </div>
        </div>
      </section>

      {/* DOCTORS & HOSPITALS */}

      <section className="mn-directories">
        <div className="mn-container">
          <div className="mn-section-kicker">Care network</div>

          <h2 className="mn-section-title">
            Find the people and places behind your care.
          </h2>

          <div className="mn-directory-grid">
            <Link
              href="/medicalneeds/doctors"
              className="mn-directory-card"
            >
              <div className="mn-directory-label">Doctor directory</div>

              <h3>Find the right specialist.</h3>

              <p>
                Explore medical specialists and understand their areas of
                expertise before beginning your treatment journey.
              </p>

              <div className="mn-directory-link">Explore doctors →</div>
            </Link>

            <Link
              href="/medicalneeds/hospitals"
              className="mn-directory-card"
            >
              <div className="mn-directory-label">Hospital directory</div>

              <h3>Discover hospitals in India.</h3>

              <p>
                Explore hospitals, locations and available care information
                for international patients.
              </p>

              <div className="mn-directory-link">Explore hospitals →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* JOURNEY */}

      <section className="mn-journey">
        <div className="mn-container">
          <div className="mn-section-kicker">Your journey</div>

          <h2 className="mn-section-title">
            From first question to treatment.
          </h2>

          <div className="mn-journey-grid">
            <div className="mn-step">
              <div className="mn-step-number">01</div>
              <h3>Share your requirement</h3>
              <p>
                Tell us what treatment or medical specialty you are exploring.
              </p>
            </div>

            <div className="mn-step">
              <div className="mn-step-number">02</div>
              <h3>Understand your options</h3>
              <p>
                Review procedures, specialists, hospitals and indicative costs.
              </p>
            </div>

            <div className="mn-step">
              <div className="mn-step-number">03</div>
              <h3>Share medical records</h3>
              <p>
                Relevant reports can help the care team understand your case.
              </p>
            </div>

            <div className="mn-step">
              <div className="mn-step-number">04</div>
              <h3>Clinical review</h3>
              <p>
                Your case can be taken forward for appropriate medical
                evaluation.
              </p>
            </div>

            <div className="mn-step">
              <div className="mn-step-number">05</div>
              <h3>Receive treatment options</h3>
              <p>
                Explore suitable treatment and care pathways based on your
                case.
              </p>
            </div>

            <div className="mn-step">
              <div className="mn-step-number">06</div>
              <h3>Plan your travel</h3>
              <p>
                Coordinate the practical aspects of travelling for treatment.
              </p>
            </div>

            <div className="mn-step">
              <div className="mn-step-number">07</div>
              <h3>Receive care in India</h3>
              <p>
                Proceed with the selected medical treatment and care journey.
              </p>
            </div>

            <div className="mn-step">
              <div className="mn-step-number">08</div>
              <h3>Continue your recovery</h3>
              <p>
                Plan follow-up and recovery requirements after treatment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER */}

      <section className="mn-partner">
        <div className="mn-container mn-partner-inner">
          <div>
            <div className="mn-section-kicker">International patients</div>

            <h2>
              Planning treatment in India? Start with a conversation.
            </h2>

            <p>
              If you already know the treatment you need, or simply have a
              medical question, Medpact can help you understand the next step.
            </p>
          </div>

          <button
            className="mn-partner-button"
            onClick={() =>
              openWhatsApp(
                "Hello Medpact, I am an international patient exploring medical treatment in India."
              )
            }
          >
            Talk to Medpact →
          </button>
        </div>
      </section>

      {/* FAQ */}

      <section className="mn-faq">
        <div className="mn-container">
          <div className="mn-section-kicker">Questions</div>

          <h2 className="mn-section-title">
            Before you plan your treatment.
          </h2>

          <div className="mn-faq-list">
            <div className="mn-faq-item">
              <h3>Are the treatment costs final?</h3>

              <p>
                No. The costs shown on Medpact are indicative ranges intended
                to help international patients understand the approximate
                treatment budget. Actual costs depend on the individual case.
              </p>
            </div>

            <div className="mn-faq-item">
              <h3>Why are costs shown in USD?</h3>

              <p>
                Medpact is designed for international patients considering
                treatment in India. Showing indicative ranges in USD makes the
                information easier to understand when planning an overseas
                medical journey.
              </p>
            </div>

            <div className="mn-faq-item">
              <h3>Can Medpact help me find a doctor?</h3>

              <p>
                Yes. You can explore the doctor directory or contact Medpact
                directly if you need help understanding which specialty may be
                relevant to your requirement.
              </p>
            </div>

            <div className="mn-faq-item">
              <h3>Can I share my medical reports?</h3>

              <p>
                If you would like Medpact to help you with the next step, you
                can contact the team and discuss how your medical information
                can be shared securely for the appropriate process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="mn-final-cta">
        <div className="mn-container mn-final-grid">
          <div>
            <h2>
              Your treatment journey can start with one simple conversation.
            </h2>

            <p>
              Tell Medpact what you are looking for and we can help you
              understand the next step.
            </p>
          </div>

          <button
            className="mn-final-button"
            onClick={() =>
              openWhatsApp(
                "Hello Medpact, I would like to discuss medical treatment in India."
              )
            }
          >
            Start a conversation
          </button>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="mn-footer">
        <div className="mn-container">
          <div className="mn-footer-grid">
            <div className="mn-footer-brand">
              <div className="mn-logo">
                <div className="mn-logo-mark">M</div>

                <div className="mn-logo-text">Medpact</div>
              </div>

              <p>
                Medical treatment discovery and international patient support
                focused on care in India.
              </p>
            </div>

            <div>
              <h4>Explore</h4>

              <div className="mn-footer-links">
                <Link href="/medicalneeds/treatments">Treatments</Link>
                <Link href="/medicalneeds/doctors">Doctors</Link>
                <Link href="/medicalneeds/hospitals">Hospitals</Link>
              </div>
            </div>

            <div>
              <h4>Support</h4>

              <div className="mn-footer-links">
                <button
                  style={{
                    border: 0,
                    padding: 0,
                    background: "transparent",
                    color: "rgba(255,255,255,0.76)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    openWhatsApp(
                      "Hello Medpact, I would like help with medical treatment in India."
                    )
                  }
                >
                  Contact Medpact
                </button>

                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>

                <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
              </div>
            </div>

            <div>
              <h4>Patient focus</h4>

              <div className="mn-footer-links">
                <span>International patients</span>
                <span>India treatment</span>
                <span>USD cost guide</span>
              </div>
            </div>
          </div>

          <div className="mn-footer-bottom">
            <div>© {new Date().getFullYear()} Medpact</div>

            <div>
              Treatment costs are indicative and should not be considered a
              medical quotation.
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING DESKTOP CTA */}

      <button
        className="mn-floating"
        onClick={() =>
          openWhatsApp(
            "Hello Medpact, I would like help planning medical treatment in India."
          )
        }
      >
        Ask Medpact
      </button>

      {/* MOBILE CTA */}

      <div className="mn-mobile-review">
        <span>Planning treatment in India?</span>

        <button
          onClick={() =>
            openWhatsApp(
              "Hello Medpact, I would like help planning medical treatment in India."
            )
          }
        >
          Talk to us →
        </button>
      </div>
    </main>
  );
}
