import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck, FileSearch, Brain, BarChart3,
  CheckCircle, ArrowRight, Globe, Database,
  Zap, Lock, Star, ChevronDown
} from "lucide-react";

// ── Animation Variants ──────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

// ── Animated Section Wrapper ─────────────────────────────────
const AnimatedSection = ({ children, className = "" }) => {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Feature Card ─────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100
               hover:shadow-2xl hover:border-blue-100 transition-all duration-300
               group cursor-default"
  >
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                 group-hover:scale-110 transition-transform duration-300"
      style={{ background: color + "15" }}
    >
      <Icon size={28} style={{ color }} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

// ── Step Card ────────────────────────────────────────────────
const StepCard = ({ number, title, description, icon: Icon }) => (
  <motion.div
    variants={fadeUp}
    className="flex flex-col items-center text-center group"
  >
    <div className="relative mb-6">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center
                   bg-gradient-to-br from-blue-500 to-violet-600
                   shadow-lg shadow-blue-200 group-hover:shadow-blue-300
                   group-hover:scale-110 transition-all duration-300"
      >
        <Icon size={32} className="text-white" />
      </div>
      <div
        className="absolute -top-2 -right-2 w-8 h-8 rounded-full
                   bg-slate-800 text-white text-xs font-bold
                   flex items-center justify-center border-2 border-white"
      >
        {number}
      </div>
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{description}</p>
  </motion.div>
);

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({ value, label, icon: Icon }) => (
  <motion.div
    variants={fadeUp}
    className="text-center"
  >
    <div className="text-4xl font-black text-white mb-1">{value}</div>
    <div className="text-blue-200 text-sm font-medium">{label}</div>
  </motion.div>
);

// ── Main Landing Page ────────────────────────────────────────
const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated) return "/register";
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "lecturer") return "/lecturer/dashboard";
    return "/student/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500
                            to-violet-600 flex items-center justify-center
                            shadow-lg shadow-blue-200">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-800">Plagia</span>
              <span className="text-xl font-black text-blue-500">Guard</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it Works", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-slate-600 hover:text-blue-600 font-medium
                           transition-colors duration-200 text-sm"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500
                           to-violet-600 text-white px-5 py-2.5 rounded-xl
                           font-semibold text-sm hover:shadow-lg hover:shadow-blue-200
                           transition-all duration-300 hover:scale-105"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-blue-600 font-semibold
                             text-sm transition-colors duration-200 px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500
                             to-violet-600 text-white px-5 py-2.5 rounded-xl
                             font-semibold text-sm hover:shadow-lg hover:shadow-blue-200
                             transition-all duration-300 hover:scale-105"
                >
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative min-h-screen gradient-bg-animated flex items-center
                          justify-center overflow-hidden pt-20">

        {/* Background decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full
                          bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full
                          bg-violet-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl" />
        </div>

        {/* Floating dots grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-blue-500/20 border
                           border-blue-400/30 text-blue-300 px-4 py-2 rounded-full
                           text-sm font-medium mb-8 backdrop-blur-sm"
              >
                <Zap size={14} className="text-yellow-400" />
                AI-Powered Academic Integrity Tool
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6"
              >
                Protect
                <span className="block">Academic</span>
                <span className="block bg-gradient-to-r from-blue-400 to-violet-400
                                 bg-clip-text text-transparent">
                  Integrity
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-blue-100 text-lg leading-relaxed mb-10 max-w-lg"
              >
                PlagiaGuard uses advanced AI and NLP to detect plagiarism in
                academic documents — including paraphrased content that other
                tools miss. Fast, accurate, and completely free.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-500
                             to-violet-600 text-white px-8 py-4 rounded-2xl font-bold
                             text-lg hover:shadow-2xl hover:shadow-blue-500/40
                             transition-all duration-300 hover:scale-105
                             hover:-translate-y-1"
                >
                  Start Checking Free
                  <ArrowRight size={20} />
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-3 bg-white/10 border border-white/20
                             text-white px-8 py-4 rounded-2xl font-bold text-lg
                             hover:bg-white/20 transition-all duration-300
                             backdrop-blur-sm"
                >
                  See How It Works
                  <ChevronDown size={20} />
                </a>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6 mt-10"
              >
                {[
                  { icon: Lock, text: "Secure & Private" },
                  { icon: Zap, text: "Results in seconds" },
                  { icon: Star, text: "98% Accuracy" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-blue-200 text-sm">
                    <Icon size={14} className="text-blue-400" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Floating Card UI */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20
                             rounded-3xl p-8 shadow-2xl"
                >
                  {/* Doc header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex
                                    items-center justify-center">
                      <FileSearch size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">
                        research_paper.pdf
                      </div>
                      <div className="text-blue-300 text-xs">3,420 words • Analyzing...</div>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-yellow-400/20 text-yellow-300 text-xs
                                       font-medium px-3 py-1 rounded-full border
                                       border-yellow-400/30">
                        Processing
                      </span>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-4 mb-6">
                    {[
                      { label: "Web Sources Check", progress: 85, color: "#3b82f6" },
                      { label: "AI Semantic Analysis", progress: 62, color: "#8b5cf6" },
                      { label: "Internal Database", progress: 100, color: "#10b981" },
                    ].map(({ label, progress, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-blue-200 mb-1">
                          <span>{label}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Result preview */}
                  <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-300 text-sm font-semibold">
                        Similarity Score
                      </span>
                      <span className="text-red-300 text-xs">High Risk</span>
                    </div>
                    <div className="text-5xl font-black text-white">67%</div>
                    <div className="text-red-200 text-xs mt-1">
                      5 sources matched
                    </div>
                  </div>
                </motion.div>

                {/* Floating badge 1 */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-6 -left-6 bg-emerald-500 text-white
                             px-4 py-2 rounded-2xl shadow-lg shadow-emerald-500/40
                             text-sm font-bold flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  AI Powered
                </motion.div>

                {/* Floating badge 2 */}
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-6 -right-6 bg-violet-600 text-white
                             px-4 py-2 rounded-2xl shadow-lg shadow-violet-500/40
                             text-sm font-bold flex items-center gap-2"
                >
                  <Globe size={16} />
                  Web Matched
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-blue-300
                     flex flex-col items-center gap-2"
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 to-violet-700 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Detection Accuracy" },
              { value: "3+", label: "Detection Algorithms" },
              { value: "<60s", label: "Average Check Time" },
              { value: "100%", label: "Free to Use" },
            ].map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── FEATURES SECTION ───────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase
                               tracking-widest">
                Why PlagiaGuard
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 mt-3 mb-4">
                Intelligent Detection
                <span className="block gradient-text">Beyond Simple Matching</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Our system combines multiple AI algorithms to catch every form
                of plagiarism — including content that has been paraphrased.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI Semantic Analysis",
                  description: "BERT-powered deep learning detects paraphrased content by understanding the meaning behind words, not just matching them.",
                  color: "#8b5cf6",
                },
                {
                  icon: Globe,
                  title: "Web Source Matching",
                  description: "Searches millions of web pages in real-time to find matching content from blogs, journals, Wikipedia, and research sites.",
                  color: "#3b82f6",
                },
                {
                  icon: Database,
                  title: "Internal Database",
                  description: "Compares submissions against your institution's historical document database to catch self-plagiarism and repeated work.",
                  color: "#10b981",
                },
                {
                  icon: BarChart3,
                  title: "Detailed Reports",
                  description: "Get comprehensive reports with color-highlighted text, source lists, similarity scores, and downloadable PDF reports.",
                  color: "#f59e0b",
                },
                {
                  icon: Zap,
                  title: "Fast Processing",
                  description: "Advanced parallel processing completes full document analysis in under 60 seconds, even for lengthy research papers.",
                  color: "#ef4444",
                },
                {
                  icon: Lock,
                  title: "Secure & Private",
                  description: "All documents are encrypted and stored securely. Your academic work is never shared or used for any other purpose.",
                  color: "#6366f1",
                },
              ].map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">
                Simple Process
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 mt-3 mb-4">
                How It Works
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Get your plagiarism report in three simple steps.
                No complex setup required.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-10 left-1/4 right-1/4
                              h-0.5 bg-gradient-to-r from-blue-200 to-violet-200" />

              {[
                {
                  number: "1",
                  icon: FileSearch,
                  title: "Upload Document",
                  description: "Upload your academic document in PDF, DOCX, or TXT format. Our system accepts files up to 10MB.",
                },
                {
                  number: "2",
                  icon: Brain,
                  title: "AI Analysis",
                  description: "Our intelligent engine checks your document against web sources, databases, and uses BERT for semantic analysis.",
                },
                {
                  number: "3",
                  icon: BarChart3,
                  title: "Get Your Report",
                  description: "Receive a detailed report with highlighted text, similarity scores, matched sources, and a downloadable PDF.",
                },
              ].map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────────────── */}
      <section className="py-24 gradient-bg-animated">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
                Ready to Check
                <span className="block text-blue-300">Your Document?</span>
              </h2>
              <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of students and lecturers who trust PlagiaGuard
                for academic integrity. Free forever.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/register"
                  className="flex items-center gap-3 bg-white text-blue-700 px-10 py-4
                             rounded-2xl font-bold text-lg hover:shadow-2xl
                             hover:shadow-white/20 transition-all duration-300
                             hover:scale-105 hover:-translate-y-1"
                >
                  Create Free Account
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-3 bg-white/10 border border-white/30
                             text-white px-10 py-4 rounded-2xl font-bold text-lg
                             hover:bg-white/20 transition-all duration-300
                             backdrop-blur-sm"
                >
                  Already have account? Login
                </Link>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500
                              to-violet-600 flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span className="text-white font-bold">PlagiaGuard</span>
            </div>
            <p className="text-slate-400 text-sm text-center">
              © 2025 PlagiaGuard — HND Final Year Project |
              Intelligent Plagiarism Detection System
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Lock size={14} />
              Secure & Encrypted
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;