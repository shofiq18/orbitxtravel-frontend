"use client";

import React from "react";
import Link from "next/link";
import { 
  Globe, 
  ShieldCheck, 
  Award, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  HeartHandshake, 
  Compass, 
  Hotel, 
  Bus, 
  FileText, 
  ArrowRight,
  MapPin,
  Clock,
  Star
} from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="w-full bg-white text-[#111111] pb-20">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-[#0B0F19] text-white py-24 sm:py-32 px-6 sm:px-12 lg:px-20 overflow-hidden border-b border-gray-800/80">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0061AA]/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#0061AA]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-xs sm:text-sm font-semibold text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>The OrbitX Travel Story</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight font-title">
            Redefining How The World Explores &amp; Stays
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed font-normal">
            OrbitX Travel is a premier multi-vendor booking portal connecting verified hotel owners and professional tour hosts directly with travelers. Built on security, escrow protection, and direct host pricing.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. OUR MISSION & VISION (2-COLUMN CARDS) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Mission Card */}
          <div className="bg-[#f8fafc] border border-neutral-200/80 p-8 sm:p-12 rounded-3xl space-y-5 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#0061AA]/10 border border-[#0061AA]/20 flex items-center justify-center text-[#0061AA] group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight font-title">
              Our Mission
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
              To eliminate unfair middleman markups and bring total transparency to travel booking. We empower local hosts, hotel owners, and tour guides with direct traveler connections while guaranteeing 100% escrow protection for guests.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-[#f8fafc] border border-neutral-200/80 p-8 sm:p-12 rounded-3xl space-y-5 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#0061AA]/10 border border-[#0061AA]/20 flex items-center justify-center text-[#0061AA] group-hover:scale-110 transition-transform">
              <Globe className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight font-title">
              Our Vision
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
              To become the global standard for verified travel bookings, where every tour package and stay comes with instant PDF vouchers, automated pre-trip alerts, and seamless digital host verification.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE 4 PLATFORM PILLARS */}
      {/* ========================================================================= */}
      <section className="bg-[#0B0F19] text-white py-20 px-6 sm:px-12 lg:px-20 my-10">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-title">
              Why Travelers Choose OrbitX
            </h2>
            <p className="text-sm text-neutral-400 font-normal">
              Designed from the ground up to ensure safety, instant verification, and direct partner pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4 hover:border-[#0061AA] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0061AA]/20 border border-[#0061AA]/40 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Verified Escrow</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                Funds remain safely locked in escrow and are released to hosts only after successful check-in or tour departure.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4 hover:border-[#0061AA] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0061AA]/20 border border-[#0061AA]/40 flex items-center justify-center text-blue-400">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Direct Host Pricing</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                Book tour packages and hotel stays directly from verified property owners with zero hidden agency fees.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4 hover:border-[#0061AA] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0061AA]/20 border border-[#0061AA]/40 flex items-center justify-center text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Instant PDF Vouchers</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                Automated instant PDF confirmation vouchers with UUID reference codes, QR check-in, and emergency contacts.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4 hover:border-[#0061AA] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0061AA]/20 border border-[#0061AA]/40 flex items-center justify-center text-blue-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">24/7 Departure Alerts</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                Pre-trip email &amp; SMS reminders dispatched 24 hours prior to departure so you never miss a schedule.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TRUST & SCALE NUMBERS */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#051C2C] py-20 px-6 sm:px-12 lg:px-20 text-white my-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-title">
              Trusted Across Bangladesh &amp; Beyond
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal">
              Empowering travelers and host partners every single day.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center pt-8 border-t border-white/10">
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">10,000<span className="text-[#38bdf8]">+</span></p>
              <p className="text-xs text-neutral-300 font-medium tracking-wide mt-2">happy travelers</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">500<span className="text-[#38bdf8]">+</span></p>
              <p className="text-xs text-neutral-300 font-medium tracking-wide mt-2">verified stays &amp; tours</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">99.8<span className="text-[#38bdf8]">%</span></p>
              <p className="text-xs text-neutral-300 font-medium tracking-wide mt-2">on-time guarantee</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">4.9<span className="text-xl font-normal text-neutral-400"> / 5.0</span></p>
              <p className="text-xs text-neutral-300 font-medium tracking-wide mt-2">satisfaction rating</p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CALL TO ACTION FOR TRAVELERS & HOSTS */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CTA Card 1: Travelers */}
          <div className="bg-gradient-to-br from-[#0061AA] to-[#004b85] text-white p-10 sm:p-12 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight font-title">
                Ready to Explore Verified Destinations?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
                Discover verified hotel stays, luxury resorts, and curated tour packages with instant PDF confirmation.
              </p>
            </div>
            <div>
              <Link 
                href="/tours" 
                className="inline-flex items-center space-x-2 bg-white text-[#0061AA] hover:bg-neutral-100 font-extrabold text-xs px-6 py-3.5 rounded-full uppercase tracking-wider shadow-lg transition-all"
              >
                <span>Browse Tour Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* CTA Card 2: Partners & Hosts */}
          <div className="bg-[#0B0F19] text-white p-10 sm:p-12 rounded-3xl space-y-6 shadow-xl border border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                <Hotel className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight font-title">
                Are You a Hotel Owner or Tour Host?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Join OrbitX to list your property or assemble tour packages. Access direct guest bookings and guaranteed payouts.
              </p>
            </div>
            <div>
              <Link 
                href="/become-host" 
                className="inline-flex items-center space-x-2 bg-[#0061AA] hover:bg-[#004b85] text-white font-extrabold text-xs px-6 py-3.5 rounded-full uppercase tracking-wider shadow-lg transition-all"
              >
                <span>Become a Verified Host</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
