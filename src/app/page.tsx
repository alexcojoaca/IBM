import Link from "next/link";

export default function HomePage() {
  return (
    <div className="shell">
      <div className="container">
        <header className="nav">
          <div className="brand">
            IBM <span>●</span>
          </div>
          <div className="nav-actions">
            <Link className="btn" href="/login">
              Log in
            </Link>
            <Link className="btn btn-primary" href="/register">
              Get started
            </Link>
          </div>
        </header>

        <section className="hero">
          <div className="brand" style={{ fontSize: "2rem" }}>
            IBM
          </div>
          <h1>Trade with balance. License. Download. Connect MetaTrader.</h1>
          <p>
            Intelligent Balance Manager — automated Forex on MT5. Buy a license, download the
            desktop bot, activate once, and keep trading with a dedicated 1-year key.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/register">
              Create account
            </Link>
            <Link className="btn" href="/login">
              I already have an account
            </Link>
          </div>
        </section>

        <section className="section">
          <h2>How it works</h2>
          <p className="lead">Three steps. No Admin panel for customers — only your dashboard.</p>
          <div className="grid-3">
            <div className="feature">
              <h3>1. Create account</h3>
              <p>Sign up on this platform. Your licenses and downloads live in one place.</p>
            </div>
            <div className="feature">
              <h3>2. Get a license</h3>
              <p>Purchase unlocks a dedicated key (1 device, 1 year). Visible anytime in your dashboard.</p>
            </div>
            <div className="feature">
              <h3>3. Download &amp; trade</h3>
              <p>Install the Windows bot, enter the key once — it is remembered. Connect MT5 and start.</p>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: "4rem" }}>
          <h2>Coming next</h2>
          <p className="lead">
            Crypto checkout, affiliate / MLM (3 levels), and online license validation for every
            installed bot.
          </p>
        </section>
      </div>
    </div>
  );
}
