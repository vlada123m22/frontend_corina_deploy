import { Link } from "react-router-dom";
import Header from "./../components/header/Header";

const Home = () => {
  return (
    <>
      <style>{`
        .home-hero {
          position: relative;
          padding: 120px 24px 140px;
          background: radial-gradient(circle at 20% 30%, rgba(139,92,246,0.25), transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(236,72,153,0.25), transparent 50%),
                      linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          overflow: hidden;
          color: #fff;
        }
        .home-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .home-hero__inner {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }
        .home-eyebrow {
          display: inline-block;
          padding: 6px 14px;
          margin-bottom: 24px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #c4b5fd;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.35);
          border-radius: 999px;
        }
        .home-hero__title {
          font-size: clamp(2.4rem, 6vw, 4.2rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin: 0 0 24px;
        }
        .home-gradient-text {
          background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .home-hero__lead {
          font-size: 1.2rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.75);
          max-width: 640px;
          margin: 0 auto 40px;
        }
        .home-cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .home-btn {
          display: inline-block;
          padding: 14px 28px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 10px;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
        }
        .home-btn--primary {
          color: #fff;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          box-shadow: 0 8px 24px rgba(139,92,246,0.35);
        }
        .home-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(139,92,246,0.45); }
        .home-btn--ghost {
          color: #fff;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .home-btn--ghost:hover { background: rgba(255,255,255,0.15); }

        .home-features {
          padding: 100px 24px;
          background: #fafafa;
        }
        .home-features__inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .home-section-title {
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          text-align: center;
          margin: 0 0 12px;
          color: #111;
        }
        .home-section-sub {
          text-align: center;
          color: #555;
          font-size: 1.05rem;
          max-width: 560px;
          margin: 0 auto 56px;
        }
        .home-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .home-card {
          padding: 32px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #ececec;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .home-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
          border-color: transparent;
        }
        .home-card__icon {
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem;
          margin-bottom: 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          color: #fff;
        }
        .home-card h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 10px; color: #111; }
        .home-card p { color: #555; line-height: 1.6; margin: 0; }

        .home-modes {
          padding: 100px 24px;
          background: #fff;
        }
        .home-modes__grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        .home-mode {
          padding: 36px;
          border-radius: 20px;
          color: #fff;
        }
        .home-mode--a { background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); }
        .home-mode--b { background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); }
        .home-mode__tag {
          display: inline-block;
          padding: 4px 12px;
          margin-bottom: 16px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.2);
          border-radius: 999px;
        }
        .home-mode h3 { font-size: 1.6rem; font-weight: 800; margin: 0 0 12px; }
        .home-mode p { line-height: 1.6; opacity: 0.92; margin: 0; }

        .home-final {
          padding: 100px 24px;
          background: #0f0f1e;
          color: #fff;
          text-align: center;
        }
        .home-final h2 {
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
        }
        .home-final p { color: rgba(255,255,255,0.7); margin: 0 0 32px; }
      `}</style>

      <Header />

      <section className="home-hero">
        <div className="home-hero__inner">
          <span className="home-eyebrow">For organizers and participants</span>
          <h1 className="home-hero__title">
            Run hackathons<br />
            <span className="home-gradient-text">without the chaos.</span>
          </h1>
          <p className="home-hero__lead">
            One place for applications, schedules, and teams. Launch your event in minutes —
            or find the next one to apply to.
          </p>
          <div className="home-cta-row">
            <Link to="/signup" className="home-btn home-btn--primary">Get started →</Link>
            <Link to="/projects" className="home-btn home-btn--ghost">Browse events</Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-features__inner">
          <h2 className="home-section-title">Everything an event needs.</h2>
          <p className="home-section-sub">
            From the first application to the final team list — TimeSaver covers the whole arc.
          </p>

          <div className="home-cards">
            <div className="home-card">
              <div className="home-card__icon">📝</div>
              <h3>Custom application forms</h3>
              <p>Text answers, checkboxes with your own options, file uploads for CVs. Build once, publish instantly.</p>
            </div>
            <div className="home-card">
              <div className="home-card__icon">⚡</div>
              <h3>Smart team formation</h3>
              <p>Form teams around ideas, or accept pre-built teams. Auto-group, edit, finalize — your call.</p>
            </div>
            <div className="home-card">
              <div className="home-card__icon">📅</div>
              <h3>Schedules with control</h3>
              <p>Publish each day's agenda. Show it to everyone, only applicants, or only accepted participants.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-modes">
        <h2 className="home-section-title">Two ways to run it.</h2>
        <p className="home-section-sub">
          Some events form teams on the day. Others arrive in squads. TimeSaver does both.
        </p>
        <div className="home-modes__grid">
          <div className="home-mode home-mode--a">
            <span className="home-mode__tag">Type A</span>
            <h3>Idea-based</h3>
            <p>
              Participants register solo. After acceptance, they pitch ideas or join others' —
              and teams form around the strongest matches.
            </p>
          </div>
          <div className="home-mode home-mode--b">
            <span className="home-mode__tag">Type B</span>
            <h3>Team-based</h3>
            <p>
              Participants register with their team. TimeSaver checks team names against
              existing groups so no two squads share an identity by accident.
            </p>
          </div>
        </div>
      </section>

      <section className="home-final">
        <h2>Ready when you are.</h2>
        <p>Create an account and launch your first event in under five minutes.</p>
        <div className="home-cta-row">
          <Link to="/signup" className="home-btn home-btn--primary">Create account</Link>
          <Link to="/login" className="home-btn home-btn--ghost">Log in</Link>
        </div>
      </section>
    </>
  );
};

export default Home;