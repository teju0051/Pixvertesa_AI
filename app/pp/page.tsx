"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
  const [currentYear, setCurrentYear] = useState<string>("2026");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          --paper: #000000;
          --white: #0B0B0D;
          --surface-2: #141418;
          --ink: #FFFFFF;
          --muted: #A1A1AA;
          --subtle: #71717A;
          --border: #242429;
          --border-strong: #3F3F46;

          --blue: #2563EB;
          --blue-dark: #1D4ED8;
          --blue-soft: #101E38;
          --blue-ink: #93C5FD;

          --yellow: #FACC15;
          --yellow-soft: #262008;
          --yellow-ink: #FDE047;

          --mint: #10B981;
          --mint-soft: #07241B;
          --mint-ink: #6EE7B7;

          --violet: #7C3AED;
          --violet-soft: #1C1233;
          --violet-ink: #C4B5FD;

          --rose: #E11D48;
          --rose-soft: #2B0D16;
          --rose-ink: #FDA4AF;

          --font-sans: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          scroll-behavior: smooth;
        }

        .zt-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--paper);
        }

        .zt-wrap {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* HEADER */
        .zt-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #000000;
          border-bottom: 1.5px solid var(--border);
        }
        .zt-header-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .zt-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .zt-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          padding: 9px 16px;
          border-radius: 10px;
          border: 1.5px solid var(--border-strong);
          background: var(--surface-2);
          color: var(--ink);
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .zt-btn:hover {
          background: #1E1E24;
          border-color: var(--ink);
          transform: translateY(-1px);
        }

        /* HERO */
        .zt-pp-hero {
          padding: 56px 0 36px;
        }
        .zt-pill {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 999px;
          display: inline-block;
          margin-bottom: 16px;
        }
        .zt-pp-hero h1 {
          margin: 0 0 14px;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--ink);
        }
        .zt-highlight {
          background: var(--yellow);
          color: #000000;
          padding: 0 10px;
          border-radius: 10px;
          display: inline-block;
        }
        .zt-pp-hero p {
          margin: 0;
          max-width: 640px;
          font-size: 16px;
          line-height: 1.65;
          color: var(--muted);
        }

        /* SUMMARY HIGHLIGHTS */
        .zt-highlights {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 40px;
        }
        .zt-hl-card {
          border-radius: 16px;
          padding: 18px 16px;
          border: 1.5px solid;
        }
        .zt-hl-title {
          font-size: 14px;
          font-weight: 800;
          margin: 0 0 6px;
        }
        .zt-hl-desc {
          font-size: 12px;
          line-height: 1.5;
          color: var(--muted);
          margin: 0;
        }

        /* POLICY BODY */
        .zt-policy-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 72px;
        }
        .zt-policy-card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 18px;
          padding: 28px 30px;
        }
        .zt-policy-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .zt-sec-num {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .zt-policy-card h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.015em;
          color: var(--ink);
        }
        .zt-policy-card p {
          margin: 0 0 12px;
          font-size: 14px;
          line-height: 1.7;
          color: var(--muted);
        }
        .zt-policy-card p:last-child {
          margin-bottom: 0;
        }
        .zt-policy-list {
          margin: 10px 0 0;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .zt-policy-list li {
          font-size: 14px;
          line-height: 1.65;
          color: var(--muted);
        }
        .zt-policy-list strong {
          color: var(--ink);
        }

        .zt-contact-box {
          margin-top: 14px;
          background: var(--surface-2);
          border: 1.5px solid var(--border-strong);
          border-radius: 12px;
          padding: 18px 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .zt-contact-label {
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--subtle);
          margin-bottom: 4px;
        }
        .zt-contact-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
          word-break: break-word;
        }
        .zt-contact-val a {
          color: var(--blue-ink);
          text-decoration: none;
        }
        .zt-contact-val a:hover {
          text-decoration: underline;
        }

        /* FOOTER */
        .zt-footer {
          border-top: 1.5px solid var(--border);
          background: #000000;
          padding: 28px 0;
          margin-top: auto;
        }
        .zt-footer-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: var(--muted);
        }

        @media (max-width: 820px) {
          .zt-highlights { grid-template-columns: repeat(2, 1fr); }
          .zt-contact-box { grid-template-columns: 1fr; }
          .zt-policy-card { padding: 22px 20px; }
        }
      `,
        }}
      />

      <div className="zt-page">
        {/* HEADER */}
        <header className="zt-header">
          <div className="zt-header-inner">
            <Link href="/" className="zt-brand">
              <img
                src="/pixvertesa.png"
                style={{
                  display: "block",
                  height: "58px",
                  width: "auto",
                  border: 0,
                }}
                alt="Znxios International"
              />
            </Link>

            <Link href="/" className="zt-btn">
              ← Back to Scanner
            </Link>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="zt-wrap">
          <div className="zt-pp-hero">
            <span
              className="zt-pill"
              style={{
                background: "var(--blue-soft)",
                color: "var(--blue-ink)",
              }}
            >
              EFFECTIVE: NOVEMBER 2026
            </span>
            <h1>
              Privacy <span className="zt-highlight">Policy</span>
            </h1>
            <p>
              Your images and personal data belong to you. This policy explains
              exactly how Znxios International handles uploads, browser storage,
              and Razorpay payments.
            </p>
          </div>

          {/* AT-A-GLANCE PRIVACY GUARANTEES */}
          <div className="zt-highlights">
            <div
              className="zt-hl-card"
              style={{
                background: "var(--mint-soft)",
                borderColor: "var(--mint)",
              }}
            >
              <div className="zt-hl-title" style={{ color: "var(--mint-ink)" }}>
                0 Bytes Stored
              </div>
              <p className="zt-hl-desc">
                Uploaded images are purged from memory immediately after
                scanning.
              </p>
            </div>
            <div
              className="zt-hl-card"
              style={{
                background: "var(--blue-soft)",
                borderColor: "var(--blue)",
              }}
            >
              <div className="zt-hl-title" style={{ color: "var(--blue-ink)" }}>
                No Account Login
              </div>
              <p className="zt-hl-desc">
                We do not build user profiles, passwords, or tracking accounts.
              </p>
            </div>
            <div
              className="zt-hl-card"
              style={{
                background: "var(--yellow-soft)",
                borderColor: "var(--yellow)",
              }}
            >
              <div
                className="zt-hl-title"
                style={{ color: "var(--yellow-ink)" }}
              >
                Local EXIF Parsing
              </div>
              <p className="zt-hl-desc">
                Image EXIF metadata is read directly inside your browser.
              </p>
            </div>
            <div
              className="zt-hl-card"
              style={{
                background: "var(--violet-soft)",
                borderColor: "var(--violet)",
              }}
            >
              <div
                className="zt-hl-title"
                style={{ color: "var(--violet-ink)" }}
              >
                No AI Training
              </div>
              <p className="zt-hl-desc">
                We never retain, sell, or train AI models on your pictures.
              </p>
            </div>
          </div>

          {/* POLICY SECTIONS */}
          <div className="zt-policy-stack">
            <section className="zt-policy-card">
              <div className="zt-policy-head">
                <span
                  className="zt-sec-num"
                  style={{
                    background: "var(--mint-soft)",
                    color: "var(--mint-ink)",
                  }}
                >
                  01
                </span>
                <h2>Zero Image Retention Policy</h2>
              </div>
              <p>
                When you upload an image for AI detection, the file is
                transmitted over HTTPS, processed strictly in volatile server
                memory (RAM) to compute the authenticity score, and immediately
                discarded once the result is returned to your browser.
              </p>
              <ul className="zt-policy-list">
                <li>
                  <strong>No disk storage:</strong> We never write your uploaded
                  images to databases, cloud buckets, or log files.
                </li>
                <li>
                  <strong>No model training:</strong> Your photos are never used
                  to train, fine-tune, or benchmark third-party or internal AI
                  models.
                </li>
                <li>
                  <strong>Client-side EXIF:</strong> Camera hardware, software
                  tags, and resolution metadata are extracted locally in your
                  browser using client-side code.
                </li>
              </ul>
            </section>

            <section className="zt-policy-card">
              <div className="zt-policy-head">
                <span
                  className="zt-sec-num"
                  style={{
                    background: "var(--blue-soft)",
                    color: "var(--blue-ink)",
                  }}
                >
                  02
                </span>
                <h2>Browser Storage (No-Login Architecture)</h2>
              </div>
              <p>
                Because our platform operates without user accounts or
                passwords, we use your browser&apos;s{" "}
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink)",
                  }}
                >
                  localStorage
                </code>{" "}
                strictly for core functionality:
              </p>
              <ul className="zt-policy-list">
                <li>
                  <strong>Daily Free Quota:</strong> Tracks your daily count of
                  free scans (up to 10 per day) locally on your device.
                </li>
                <li>
                  <strong>Subscription Access Key:</strong> Saves your verified
                  Razorpay Order ID locally so your Professional or Enterprise
                  features stay unlocked across sessions.
                </li>
              </ul>
              <p style={{ marginTop: 12 }}>
                We do not use invasive cross-site advertising cookies or sell
                behavioral tracking data.
              </p>
            </section>

            <section className="zt-policy-card">
              <div className="zt-policy-head">
                <span
                  className="zt-sec-num"
                  style={{
                    background: "var(--yellow-soft)",
                    color: "var(--yellow-ink)",
                  }}
                >
                  03
                </span>
                <h2>Payments, Billing &amp; Access Key Delivery</h2>
              </div>
              <p>
                When you upgrade to a Professional or Enterprise plan, we
                collect your <strong>name</strong>,{" "}
                <strong>email address</strong>, and{" "}
                <strong>phone number</strong> solely to:
              </p>
              <ul className="zt-policy-list">
                <li>
                  Initialize and verify your transaction securely through{" "}
                  <strong>Razorpay</strong> (supporting UPI and international
                  cards).
                </li>
                <li>
                  Email your unique <strong>Access Key (Order ID)</strong> and
                  payment confirmation receipt from our automated mailer (
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--ink)",
                    }}
                  >
                    support.znxios@gmail.com
                  </code>
                  ).
                </li>
                <li>
                  Verify your Order ID if you choose to restore your license on
                  another browser or device.
                </li>
              </ul>
              <p style={{ marginTop: 12 }}>
                We never see, process, or store your UPI PIN, bank credentials,
                or credit/debit card numbers. All payment credentials are
                handled directly by Razorpay under PCI-DSS compliance.
              </p>
            </section>

            <section className="zt-policy-card">
              <div className="zt-policy-head">
                <span
                  className="zt-sec-num"
                  style={{
                    background: "var(--violet-soft)",
                    color: "var(--violet-ink)",
                  }}
                >
                  04
                </span>
                <h2>CSV Forensic Reports &amp; Batch Scans</h2>
              </div>
              <p>
                Enterprise CSV forensic reports are generated entirely inside
                your browser from your active session results and downloaded
                directly to your device. No copies of your batch queues or
                exported CSV reports are saved on our servers.
              </p>
            </section>

            <section className="zt-policy-card">
              <div className="zt-policy-head">
                <span
                  className="zt-sec-num"
                  style={{
                    background: "var(--rose-soft)",
                    color: "var(--rose-ink)",
                  }}
                >
                  05
                </span>
                <h2>Third-Party Services &amp; External Portals</h2>
              </div>
              <p>
                Our website integrates with Razorpay for payment processing and
                provides an informational link to the{" "}
                <strong>Sanchar Saathi</strong> portal for reporting deepfake
                cybercrime. Once you navigate to an external portal, your
                interactions are governed by that third party&apos;s privacy
                policy.
              </p>
            </section>

            <section className="zt-policy-card">
              <div className="zt-policy-head">
                <span
                  className="zt-sec-num"
                  style={{
                    background: "var(--blue-soft)",
                    color: "var(--blue-ink)",
                  }}
                >
                  06
                </span>
                <h2>Data Rights &amp; Contact Information</h2>
              </div>
              <p>
                You may clear your locally stored Access Key or scan counter at
                any time from your browser settings or via the{" "}
                <strong>Access Key</strong> menu on our homepage. For billing
                inquiries, privacy requests, or enterprise compliance
                documentation, contact us directly:
              </p>

              <div className="zt-contact-box">
                <div>
                  <div className="zt-contact-label">Operator</div>
                  <div className="zt-contact-val">Znxios International</div>
                </div>
                <div>
                  <div className="zt-contact-label">Support Email</div>
                  <div className="zt-contact-val">
                    <a href="mailto:support.znxios@gmail.com">
                      support.znxios@gmail.com
                    </a>
                  </div>
                </div>
                <div>
                  <div className="zt-contact-label">Jurisdiction</div>
                  <div className="zt-contact-val">International</div>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="zt-footer">
          <div className="zt-footer-inner">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <strong style={{ color: "var(--ink)", fontSize: 15 }}>
                Znxios International
              </strong>
              <span>© {currentYear} All rights reserved</span>
            </div>
            <Link
              href="/"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--blue-ink)",
                textDecoration: "none",
              }}
            >
              Return to AI Image Detector
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
