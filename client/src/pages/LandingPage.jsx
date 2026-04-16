import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ── Animated Counter Hook ──────────────────────────────────────────────────────
function useCounter(end, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, started]);
  return count;
}

// ── Intersection Observer Hook ─────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ end, suffix = '', label, icon, started }) {
  const count = useCounter(end, 2200, started);
  return (
    <div className="civic-stat-card">
      <div className="civic-stat-icon">{icon}</div>
      <div className="civic-stat-number">{count.toLocaleString()}{suffix}</div>
      <div className="civic-stat-label">{label}</div>
    </div>
  );
}

// ── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, delay }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div
      ref={ref}
      className="civic-feature-card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div className="civic-feature-icon">{icon}</div>
      <h3 className="civic-feature-title">{title}</h3>
      <p className="civic-feature-desc">{description}</p>
    </div>
  );
}

// ── Step Card ─────────────────────────────────────────────────────────────────
function StepCard({ number, icon, title, description, delay }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div
      ref={ref}
      className="civic-step-card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div className="civic-step-number">{number}</div>
      <div className="civic-step-icon">{icon}</div>
      <h3 className="civic-step-title">{title}</h3>
      <p className="civic-step-desc">{description}</p>
    </div>
  );
}

// ── Testimonial Card ──────────────────────────────────────────────────────────
function TestimonialCard({ name, role, text, avatar, delay }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div
      ref={ref}
      className="civic-testimonial-card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div className="civic-testimonial-quote">❝</div>
      <p className="civic-testimonial-text">{text}</p>
      <div className="civic-testimonial-author">
        <div className="civic-avatar">{avatar}</div>
        <div>
          <div className="civic-author-name">{name}</div>
          <div className="civic-author-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsRef, statsInView] = useInView(0.3);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI Duplicate Detection',
      description: 'Automatically detects repeated complaints using AI image and text matching, eliminating redundant reports and saving processing time.',
    },
    {
      icon: '🏷️',
      title: 'Smart Categorization',
      description: 'AI assigns the right department automatically based on complaint content — no manual tagging required.',
    },
    {
      icon: '📡',
      title: 'Real-Time Status Tracking',
      description: 'Track your complaint progress step-by-step with live updates and transparent timelines.',
    },
    {
      icon: '📍',
      title: 'Geo-tagged Complaints',
      description: 'Attach precise GPS location to complaints so authorities can respond faster and with full context.',
    },
    {
      icon: '📊',
      title: 'Authority Dashboard',
      description: 'Government officials get a powerful analytics dashboard to efficiently manage, prioritize, and resolve complaints.',
    },
    {
      icon: '🔔',
      title: 'Citizen Notifications',
      description: 'Stay informed with instant push and email notifications every time your complaint status changes.',
    },
  ];

  const steps = [
    { number: '01', icon: '📸', title: 'Upload Complaint', description: 'Add a photo and description of the civic issue from anywhere, on any device.' },
    { number: '02', icon: '🤖', title: 'AI Processing', description: 'Our AI engine checks for duplicates and auto-categorizes the complaint to the right department.' },
    { number: '03', icon: '🏛️', title: 'Authority Review', description: 'The assigned department verifies and acknowledges the reported issue immediately.' },
    { number: '04', icon: '✅', title: 'Resolution Tracking', description: 'Citizens track real-time progress until the issue is fully resolved and closed.' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Citizen, Bangalore',
      text: 'Submitting complaints has never been easier. I reported a broken streetlight and it was fixed within 3 days. Incredible!',
      avatar: '👩',
    },
    {
      name: 'Raj Kumar',
      role: 'Municipal Officer, Delhi',
      text: 'The AI duplicate detection saves us hours of manual work every day. Our team can focus on actually solving problems now.',
      avatar: '👨‍💼',
    },
    {
      name: 'Anita Desai',
      role: 'Ward Councilor, Mumbai',
      text: 'The analytics dashboard gives us a clear picture of city-wide issues. CivicAI has transformed how we serve our community.',
      avatar: '👩‍💼',
    },
  ];

  return (
    <div className="landing-root">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
        <div className="landing-nav__inner">
          <a href="#hero" className="landing-nav__logo" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
            <span className="landing-nav__logo-icon">🏙️</span>
            <span className="landing-nav__logo-text">CivicAI</span>
          </a>

          {/* Desktop links */}
          <div className="landing-nav__links">
            {['features', 'how-it-works', 'stats', 'about', 'contact'].map((id) => (
              <button key={id} className="landing-nav__link" onClick={() => scrollTo(id)}>
                {id === 'how-it-works' ? 'How It Works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          <div className="landing-nav__actions">
            <Link to="/login/citizen" className="landing-nav__login-btn">Login</Link>
          </div>

          {/* Hamburger */}
          <button className="landing-nav__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={`hamburger-line ${menuOpen ? 'open-1' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open-2' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open-3' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="landing-nav__mobile">
            {['features', 'how-it-works', 'stats', 'about', 'contact'].map((id) => (
              <button key={id} className="landing-nav__mobile-link" onClick={() => scrollTo(id)}>
                {id === 'how-it-works' ? 'How It Works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <Link to="/login/citizen" className="landing-nav__mobile-cta">Login</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section id="hero" className="landing-hero">
        <div className="landing-hero__bg-shapes">
          <div className="hero-shape hero-shape--1" />
          <div className="hero-shape hero-shape--2" />
          <div className="hero-shape hero-shape--3" />
        </div>
        <div className="landing-hero__content">
          <div className="landing-hero__text">
            <div className="landing-hero__badge">
              <span>🤖</span> Powered by Artificial Intelligence
            </div>
            <h1 className="landing-hero__headline">
              Report Issues <span className="landing-hero__highlight">Smarter.</span>
              <br />Resolve Them <span className="landing-hero__highlight">Faster</span> with AI.
            </h1>
            <p className="landing-hero__subheadline">
              Upload complaints, detect duplicates automatically, and track resolutions in real time. CivicAI connects citizens with authorities for a smarter, more responsive city.
            </p>
            <div className="landing-hero__actions">
              <Link to="/report" className="landing-btn landing-btn--primary">
                <span>🚀</span> Report a Complaint
              </Link>
              <Link to="/login/citizen" className="landing-btn landing-btn--secondary">
                <span>🔑</span> Login
              </Link>
            </div>
            <div className="landing-hero__trust">
              <div className="landing-hero__trust-item">
                <span className="landing-hero__trust-icon">✅</span>
                <span>Free to use</span>
              </div>
              <div className="landing-hero__trust-item">
                <span className="landing-hero__trust-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="landing-hero__trust-item">
                <span className="landing-hero__trust-icon">⚡</span>
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
          <div className="landing-hero__visual">
            <img
              src="/images/hero-illustration.png"
              alt="Citizens reporting issues processed by AI and reviewed by authorities"
              className="landing-hero__img"
            />
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="landing-section__inner">
          <div className="landing-section__header">
            <div className="landing-section__label">Features</div>
            <h2 className="landing-section__title">Everything You Need to Make Cities Better</h2>
            <p className="landing-section__subtitle">
              From AI-powered processing to real-time dashboards — CivicAI gives citizens and authorities all the tools they need.
            </p>
          </div>
          <div className="civic-features-grid">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="landing-section landing-section--alt">
        <div className="landing-section__inner">
          <div className="landing-section__header">
            <div className="landing-section__label">Process</div>
            <h2 className="landing-section__title">How CivicAI Works</h2>
            <p className="landing-section__subtitle">
              A seamless, AI-driven process from submission to resolution — transparent every step of the way.
            </p>
          </div>
          <div className="civic-steps-container">
            <div className="civic-steps-line" />
            <div className="civic-steps-grid">
              {steps.map((s, i) => (
                <StepCard key={s.number} {...s} delay={i * 100} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistics ──────────────────────────────────────────────────────── */}
      <section id="stats" className="landing-section landing-section--dark" ref={statsRef}>
        <div className="landing-section__inner">
          <div className="landing-section__header landing-section__header--light">
            <div className="landing-section__label landing-section__label--light">Impact</div>
            <h2 className="landing-section__title landing-section__title--light">Making a Real Difference</h2>
            <p className="landing-section__subtitle landing-section__subtitle--light">
              Numbers that show how CivicAI is transforming urban governance across India.
            </p>
          </div>
          <div className="civic-stats-grid">
            <StatCard end={12480} label="Complaints Resolved" icon="✅" started={statsInView} />
            <StatCard end={320} label="Active Authorities" icon="🏛️" started={statsInView} />
            <StatCard end={48} label="Cities Covered" icon="🌆" started={statsInView} />
            <StatCard end={94} suffix="%" label="Citizen Satisfaction" icon="⭐" started={statsInView} />
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section id="about" className="landing-section">
        <div className="landing-section__inner">
          <div className="landing-section__header">
            <div className="landing-section__label">Testimonials</div>
            <h2 className="landing-section__title">Heard from Our Community</h2>
            <p className="landing-section__subtitle">
              Citizens and government officials share how CivicAI changed their experience.
            </p>
          </div>
          <div className="civic-testimonials-grid">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} {...t} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Strip ───────────────────────────────────────────────────────── */}
      <section className="landing-cta">
        <div className="landing-cta__inner">
          <div className="landing-cta__shapes">
            <div className="cta-shape cta-shape--1" />
            <div className="cta-shape cta-shape--2" />
          </div>
          <div className="landing-cta__content">
            <h2 className="landing-cta__title">Make Your City Smarter Today</h2>
            <p className="landing-cta__subtitle">Join thousands of citizens and authorities already using CivicAI.</p>
            <div className="landing-cta__actions">
              <Link to="/report" className="landing-btn landing-btn--cta-primary">🚀 Get Started</Link>
              <Link to="/login/authority" className="landing-btn landing-btn--cta-secondary">🏛️ Authority Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer id="contact" className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-footer__logo">
              <span>🏙️</span> CivicAI
            </div>
            <p className="landing-footer__tagline">
              Smart Complaint Management System — Bridging citizens and authorities with the power of AI.
            </p>
            <div className="landing-footer__socials">
              <a href="#" className="landing-footer__social" aria-label="Twitter">𝕏</a>
              <a href="#" className="landing-footer__social" aria-label="LinkedIn">in</a>
              <a href="#" className="landing-footer__social" aria-label="GitHub">⌥</a>
            </div>
          </div>

          <div className="landing-footer__links">
            <div className="landing-footer__col">
              <h4 className="landing-footer__col-title">Quick Links</h4>
              <button className="landing-footer__link" onClick={() => scrollTo('features')}>Features</button>
              <button className="landing-footer__link" onClick={() => scrollTo('how-it-works')}>How It Works</button>
              <button className="landing-footer__link" onClick={() => scrollTo('stats')}>Impact</button>
              <button className="landing-footer__link" onClick={() => scrollTo('about')}>About</button>
            </div>
            <div className="landing-footer__col">
              <h4 className="landing-footer__col-title">Platform</h4>
              <Link to="/report" className="landing-footer__link">Report Issue</Link>
              <Link to="/map" className="landing-footer__link">Map View</Link>
              <Link to="/login/citizen" className="landing-footer__link">Citizen Login</Link>
              <Link to="/login/authority" className="landing-footer__link">Authority Login</Link>
            </div>
            <div className="landing-footer__col">
              <h4 className="landing-footer__col-title">Contact</h4>
              <span className="landing-footer__info">📧 support@civicai.in</span>
              <span className="landing-footer__info">📞 1800-CIVIC-AI</span>
              <span className="landing-footer__info">🏢 New Delhi, India</span>
            </div>
          </div>
        </div>
        <div className="landing-footer__bottom">
          <span>© 2026 CivicAI. All rights reserved.</span>
          <span>Built with ❤️ for smarter cities</span>
        </div>
      </footer>
    </div>
  );
}
