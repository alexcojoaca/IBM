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
          <div className="brand" style={{ fontSize: "2.4rem" }}>
            IBM
          </div>
          <p className="muted" style={{ letterSpacing: "0.04em", marginTop: "-0.35rem" }}>
            International Business Multiplier
          </p>
          <h1>License. Download. Trade on MetaTrader 5.</h1>
          <p>
            Create your account, buy a Professional license (€150 / year / 1 device), download the
            Windows bot, and activate with your personal key — always saved in your dashboard.
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
          <p className="lead">One account. Your key. Your bot.</p>
          <div className="grid-3">
            <div className="feature">
              <h3>1. Account</h3>
              <p>Register with email and password. Edit profile, language, and settings anytime.</p>
            </div>
            <div className="feature">
              <h3>2. License €150</h3>
              <p>Pay with crypto. After confirmation your key appears in Licenses — never lose it.</p>
            </div>
            <div className="feature">
              <h3>3. Download &amp; trade</h3>
              <p>Get IBM-Client.zip, enter the key once. Disconnect devices from the dashboard if you switch PC.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
