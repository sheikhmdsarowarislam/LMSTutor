"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, ArrowRight, CheckCircle, Sparkles, Users, Wrench, Headphones, Star, BarChart2, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// ── Animated Counter Hook ──────────────────────────────────────────
function useCountUp(target: number, duration: number = 2000, suffix: string = "") {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return { count, ref }
}

// ── Stat Card with animated counter ───────────────────────────────
function StatCard({ value, suffix, label, color, icon: Icon }: {
  value: number
  suffix: string
  label: string
  color: string
  icon: React.ElementType
}) {
  const { count, ref } = useCountUp(value, 2200)
  return (
    <div ref={ref} className="relative bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-all duration-300 group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="w-full h-full bg-[#0a0d14] rounded-[11px] flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
      <p className={`text-3xl sm:text-4xl font-extrabold ${color} tabular-nums`}>
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-gray-400 text-sm mt-2 font-medium">{label}</p>
    </div>
  )
}

// ── Feature data ───────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: "Smart User Dashboard",
    desc: "Access your SEO tools instantly through our fast, secure, cloud-based dashboard. Easy to use with direct login and live chat support.",
  },
  {
    icon: Zap,
    title: "Affordable SEO Plans",
    desc: "Get the best value for money with our budget-friendly plans. Access the most popular tools & AI services without breaking the bank.",
  },
  {
    icon: Wrench,
    title: "Flexible Tool Packages",
    desc: "Choose from single or group access plans designed for marketers, agencies, writers, designers, and freelancers.",
  },
  {
    icon: Star,
    title: "3+ Years of Proven Experience",
    desc: "For over 3 years, we've consistently delivered high-quality SEO solutions with a strong commitment to client satisfaction and measurable results.",
  },
  {
    icon: Shield,
    title: "Risk-Free Guarantee",
    desc: "Enjoy peace of mind with our 2-day money-back policy. If you're not satisfied, we'll refund you—no questions asked.",
  },
  {
    icon: Headphones,
    title: "24/7 Premium Support",
    desc: "Get expert help via Live Chat, WhatsApp, or Email anytime. We're here for you whenever you need assistance.",
  },
]

const WHY_CHOOSE = [
  { label: "Uptime Reliability",         sub: "99.99% guaranteed uptime so you never lose access" },
  { label: "100% Satisfaction",           sub: "Committed to delivering results or your money back" },
  { label: "Instant Access",             sub: "Get started in seconds after payment" },
  { label: "Smooth & Secure Platform",   sub: "Encrypted sessions and private access for every user" },
]

// ── Page ──────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#03050a] pt-28 pb-16 lg:pt-36 lg:pb-24">

        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-cyan-600/8 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT */}
            <div className="space-y-7">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/8 border border-blue-500/20 rounded-full px-3.5 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                </span>
                <span className="text-[11px] font-semibold text-cyan-400 tracking-widest uppercase">
                  Trusted across UK & Bangladesh
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <h1 className="text-[2.4rem] sm:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-extrabold leading-[1.1] tracking-tight">
                  <span className="text-white">Agency Of Best</span>
                </h1>
                <h1 className="text-[2.4rem] sm:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-extrabold leading-[1.1] tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                    Group Buy SEO Tools
                  </span>
                </h1>
                <h1 className="text-[1.6rem] sm:text-3xl lg:text-[2rem] font-extrabold leading-[1.2] tracking-tight">
                  <span className="text-gray-300">& Digital Marketing AI Solutions</span>
                </h1>
              </div>

              {/* Sub */}
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-md">
                We are a passionate digital team delivering over{" "}
                <span className="text-white font-medium">100+ top-tier shared SEO tools</span> and expert-level digital marketing AI solutions — trusted across both the{" "}
                <span className="text-cyan-400 font-medium">UK and Bangladesh</span>.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/tools">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-blue-500/20 transition-all duration-200 group text-sm px-6">
                    Explore Our Tools
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-700 bg-gray-800/40 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 text-sm px-6">
                    Contact Us
                  </Button>
                </Link>
              </div>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-2">
                {["100+ SEO Tools", "UK & Bangladesh", "3+ Years Experience", "24/7 Support"].map(b => (
                  <span key={b} className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-800/50 border border-gray-700/50 rounded-full px-3 py-1">
                    <CheckCircle className="h-3 w-3 text-cyan-400 flex-shrink-0" />{b}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT — feature cards */}
            <div className="hidden lg:flex flex-col gap-3">

              {/* Top row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: BarChart2, label: "100+ Tools",        sub: "Top-tier shared SEO tools",    color: "from-blue-500 to-cyan-500",    text: "text-blue-400" },
                  { icon: Sparkles,  label: "90% Savings",       sub: "vs retail pricing",             color: "from-violet-500 to-purple-500", text: "text-violet-400" },
                ].map(c => (
                  <div key={c.label} className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700 transition-all duration-300 group">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} p-0.5 mb-3 shadow-lg`}>
                      <div className="w-full h-full bg-[#0a0d14] rounded-[7px] flex items-center justify-center">
                        <c.icon className={`w-4 h-4 ${c.text}`} />
                      </div>
                    </div>
                    <p className="text-white font-semibold text-sm">{c.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* Big card — Who We Are */}
              <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white font-semibold text-sm">Who We Are</p>
                  <span className="text-[10px] text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2 py-0.5">Since 2021</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  We are a passionate digital team delivering over 100+ top-tier shared SEO tools and expert-level digital marketing AI solutions. Our journey began as a professional service agency, now trusted across both the UK and Bangladesh.
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Affordability & Performance",  color: "from-blue-500 to-cyan-500" },
                    { label: "Group-buy Premium Access",     color: "from-violet-500 to-purple-500" },
                    { label: "Business Growth Focus",        color: "from-emerald-500 to-teal-500" },
                  ].map(t => (
                    <div key={t.label} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/30">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${t.color} flex-shrink-0`} />
                      <span className="text-gray-300 text-xs font-medium">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield,    label: "Risk-Free",        sub: "2-day money back",         color: "from-emerald-500 to-green-500", text: "text-emerald-400" },
                  { icon: Headphones, label: "24/7 Support",    sub: "Chat, WhatsApp & Email",   color: "from-yellow-500 to-orange-500", text: "text-yellow-400" },
                ].map(c => (
                  <div key={c.label} className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700 transition-all duration-300">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} p-0.5 mb-3 shadow-lg`}>
                      <div className="w-full h-full bg-[#0a0d14] rounded-[7px] flex items-center justify-center">
                        <c.icon className={`w-4 h-4 ${c.text}`} />
                      </div>
                    </div>
                    <p className="text-white font-semibold text-sm">{c.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{c.sub}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#0a0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs sm:text-sm font-bold text-blue-400 uppercase tracking-wider">Our Numbers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Proven Results,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Real Impact</span>
            </h2>
            <p className="text-gray-400">Numbers that reflect our commitment to quality and client satisfaction.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <StatCard value={12400}  suffix="+"   label="Active Subscribers"     color="text-blue-400"    icon={Users} />
            <StatCard value={40}     suffix="+"   label="Premium SEO Tools"      color="text-cyan-400"    icon={Wrench} />
            <StatCard value={99}     suffix=".8%" label="Platform Uptime"        color="text-violet-400"  icon={BarChart2} />
            <StatCard value={90}     suffix="%"   label="Savings vs Retail"      color="text-emerald-400" icon={TrendingUp} />
          </div>

          {/* Extra satisfaction stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
            {[
              { label: "User Satisfaction",   value: "100%",   color: "text-blue-400" },
              { label: "Uptime Guarantee",    value: "99.99%", color: "text-cyan-400" },
              { label: "Customer Support",    value: "100%",   color: "text-violet-400" },
            ].map(s => (
              <div key={s.label} className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-5 text-center hover:border-blue-500/20 transition-all duration-300">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#0a0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Who We Are</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                A Passionate Digital Team{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Built for Growth</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                We are a passionate digital team delivering over 100+ top-tier shared SEO tools and expert-level digital marketing AI solutions. Our journey began as a professional service agency, now trusted across both the UK and Bangladesh.
              </p>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                With a strong focus on <span className="text-white font-medium">affordability and performance</span>, we aim to make powerful SEO tools accessible for everyone. Our mission is to help websites rank better on search engines using group-buy access to premium SEO software and services tailored for business growth and online success.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "100+ top-tier shared SEO & AI tools",
                  "Trusted across UK and Bangladesh",
                  "Affordable group-buy pricing for all",
                  "Helping websites rank better on search engines",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/tools">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-blue-500/20 group text-sm px-6">
                  Explore Our Tools
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right: mission card */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-bold text-lg">Our Mission</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  To make powerful SEO tools accessible for everyone — helping websites rank better on search engines using group-buy access to premium SEO software and services tailored for business growth and online success.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "UK & Bangladesh",   sub: "Trusted markets",           color: "from-blue-500 to-cyan-500" },
                  { label: "Since 2021",         sub: "3+ years of experience",    color: "from-violet-500 to-purple-500" },
                  { label: "Group Buy Access",   sub: "Premium at low cost",       color: "from-emerald-500 to-teal-500" },
                  { label: "AI Solutions",       sub: "Digital marketing tools",   color: "from-orange-500 to-amber-500" },
                ].map(c => (
                  <div key={c.label} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${c.color} mb-2`} />
                    <p className="text-white font-semibold text-sm">{c.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{c.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#0a0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">All in One Place</span>
            </h2>
            <p className="text-gray-400">Powerful features designed for digital marketers, agencies, and freelancers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map(f => (
              <Card key={f.title} className="group relative overflow-hidden bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 border-gray-800/50 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 space-y-4 p-5 sm:p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full bg-[#0a0d14] rounded-[11px] flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white font-bold">{f.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-400">{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#0a0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Why Choose Us?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                The Best Choice for{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Digital Service Seekers</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                We provide a smooth and secure platform with top-tier support. Our uptime reliability, 100% satisfaction commitment, and instant access make us the best choice for digital service seekers.
              </p>
              <div className="space-y-3">
                {WHY_CHOOSE.map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-4 bg-gray-900/50 border border-gray-800/50 rounded-xl hover:border-blue-500/30 transition-all duration-300">
                    <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold text-sm">{item.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: big stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "100%",   label: "User Satisfaction",  color: "text-blue-400",    bg: "from-blue-900/30 to-blue-900/10",    border: "border-blue-500/30" },
                { val: "99.99%", label: "Uptime Guarantee",   color: "text-cyan-400",    bg: "from-cyan-900/30 to-cyan-900/10",    border: "border-cyan-500/30" },
                { val: "100%",   label: "Customer Support",   color: "text-violet-400",  bg: "from-violet-900/30 to-violet-900/10", border: "border-violet-500/30" },
                { val: "2-Day",  label: "Money-Back Policy",  color: "text-emerald-400", bg: "from-emerald-900/30 to-emerald-900/10","border": "border-emerald-500/30" },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300`}>
                  <p className={`text-3xl font-extrabold ${s.color}`}>{s.val}</p>
                  <p className="text-gray-400 text-sm mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0a0d14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 border border-gray-800 rounded-2xl p-12 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Rank Higher Today?</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join 12,400+ subscribers saving thousands per year with our group-buy SEO tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 group">
                  Explore All Tools
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                  Contact Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}