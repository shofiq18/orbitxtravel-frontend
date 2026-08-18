"use client";

import React from "react";
import Link from "next/link";
import { 
  Globe, 
  Sparkles, 
  Compass,
  ShieldCheck,
  HeartHandshake,
  FileText
} from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="w-full bg-white text-[#111111]">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-[#0B0F19] text-white py-20 sm:py-32 px-4 sm:px-12 lg:px-20 overflow-hidden">
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
      {/* 2. OUR PLATFORM STORY (WHY & WHEN WE STARTED) */}
      {/* ========================================================================= */}
      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
          
          {/* Tag Badge with Margin Bottom */}
          <div className="mb-6">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#0061AA] bg-[#0061AA]/10 border border-[#0061AA]/20 px-4 py-2 rounded-full shadow-sm">
              Our Origin &amp; Journey
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-black tracking-tight font-title leading-[1.15] max-w-3xl mx-auto">
            Born Out of a Need for Safe, Transparent &amp; Direct Travel
          </h2>

          <div className="text-neutral-600 text-base sm:text-lg leading-relaxed space-y-4 font-normal max-w-3xl mx-auto text-center pt-6">
            <p>
              Founded in 2026, <strong className="text-black font-semibold">OrbitX Travel</strong> was created to solve a persistent issue in traditional travel booking: inflated middleman commissions, unverified property listings, and lack of guest payment security.
            </p>
            <p>
              We realized that travelers deserved total peace of mind when booking hotel stays and tour packages. By creating a direct multi-vendor ecosystem powered by <strong className="text-black font-semibold">100% Escrow protection</strong>, <strong className="text-black font-semibold">Instant PDF Confirmation Vouchers</strong>, and <strong className="text-black font-semibold">Verified Host Digital Identity Check</strong>, OrbitX bridges the gap between passionate travelers and trusted local hosts.
            </p>
          </div>

          {/* 3 Core Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-12 max-w-5xl mx-auto w-full">
            
            <div className="w-full bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl space-y-4 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0061AA] text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-black text-lg tracking-tight font-sans">
                <span className="text-[#0061AA] font-black font-sans mr-1">100%</span>Escrow Security
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                Funds released only after host check-in confirmation.
              </p>
            </div>

            <div className="w-full bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl space-y-4 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0061AA] text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-black text-lg tracking-tight font-sans">
                Zero Agency Markups
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                Direct transparent pricing from verified property hosts.
              </p>
            </div>

            <div className="w-full bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl space-y-4 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0061AA] text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-black text-lg tracking-tight font-sans">
                Instant PDF Vouchers
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                Automated instant booking confirmation with QR check-in.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. OUR MISSION (LEFT SIDE IMAGE, RIGHT SIDE TEXT) */}
      {/* ========================================================================= */}
      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Side: Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 group">
                <img
                  src="/hotel-2.jpg"
                  alt="OrbitX Mission Stays"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/40 shadow-lg">
                  <p className="text-xs font-bold text-black uppercase tracking-wider">Direct Host Connection</p>
                  <p className="text-xs text-neutral-600 mt-0.5">Empowering hotel owners &amp; tour hosts directly.</p>
                </div>
              </div>
            </div>

            {/* Right Side: Mission Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0061AA]/10 border border-[#0061AA]/20 flex items-center justify-center text-[#0061AA]">
                <Compass className="w-6 h-6" />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0061AA]">
                  01. OUR PURPOSE
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold text-black tracking-tight font-title leading-tight">
                  Our Mission
                </h2>
              </div>

              <div className="bg-[#f8fafc] border border-neutral-200/80 p-8 rounded-3xl space-y-4 shadow-sm">
                <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal">
                  To eliminate unfair middleman markups and bring total transparency to travel booking. We empower local hosts, hotel owners, and tour guides with direct traveler connections while guaranteeing 100% escrow protection for guests.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. OUR VISION (LEFT SIDE TEXT, RIGHT SIDE IMAGE) */}
      {/* ========================================================================= */}
      <section className="w-full py-16 sm:py-20 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Side: Vision Text */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div className="w-12 h-12 rounded-2xl bg-[#0061AA]/10 border border-[#0061AA]/20 flex items-center justify-center text-[#0061AA]">
                <Globe className="w-6 h-6" />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0061AA]">
                  02. OUR DESTINATION
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold text-black tracking-tight font-title leading-tight">
                  Our Vision
                </h2>
              </div>

              <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl space-y-4 shadow-sm">
                <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal">
                  To become the global standard for verified travel bookings, where every tour package and stay comes with instant PDF vouchers, automated pre-trip alerts, and seamless digital host verification.
                </p>
              </div>
            </div>

            {/* Right Side: Image */}
            <div className="lg:col-span-5 relative order-1 lg:order-2">
              <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 group">
                <img
                  src="/become-tour-image.jpg"
                  alt="OrbitX Global Vision"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/40 shadow-lg">
                  <p className="text-xs font-bold text-black uppercase tracking-wider">Global Standards</p>
                  <p className="text-xs text-neutral-600 mt-0.5">Seamless digital vouchers &amp; automated pre-trip alerts.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CALL TO ACTION FOR TRAVELERS & HOSTS (100% EDGE-TO-EDGE ZERO GAP) */}
      {/* ========================================================================= */}
      <section className="w-full mt-0 px-0 mx-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
          
          {/* Card 1: Travelers */}
          <div className="relative w-full h-[550px] sm:h-[680px] overflow-hidden group cursor-pointer">
            <img
              src="/tour-become.avif"
              alt="Ready to Explore"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent z-10"></div>

            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-14 z-20 space-y-4 text-left">
              <span className="text-xs font-bold tracking-wider text-white/90 block">
                OrbitX Travelers
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight max-w-xl">
                Ready to Explore Verified Destinations?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal max-w-lg">
                Discover verified hotel stays, luxury resorts, and curated tour packages with instant PDF confirmation.
              </p>
              <div className="pt-2">
                <Link
                  href="/tours"
                  className="inline-flex items-center px-6 py-3.5 bg-white text-black hover:bg-neutral-200 font-extrabold text-xs rounded-full transition shadow-lg tracking-wide uppercase"
                >
                  <span>Browse Tour Packages</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Partners & Hosts */}
          <div className="relative w-full h-[550px] sm:h-[680px] bg-black overflow-hidden group cursor-pointer">
            <img
              src="/hotel-1.jpg"
              alt="Become Host"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent z-10"></div>

            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-14 z-20 space-y-4 text-left">
              <span className="text-xs font-bold tracking-wider text-white/90 block">
                OrbitX Partners & Hosts
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight max-w-xl">
                Are You a Hotel Owner or Tour Host?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal max-w-lg">
                Join OrbitX to list your property or assemble tour packages. Access direct guest bookings and guaranteed payouts.
              </p>
              <div className="pt-2">
                <Link
                  href="/become-host"
                  className="inline-flex items-center px-6 py-3.5 bg-white text-black hover:bg-neutral-200 font-extrabold text-xs rounded-full transition shadow-lg tracking-wide uppercase"
                >
                  <span>Become a Verified Host</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
