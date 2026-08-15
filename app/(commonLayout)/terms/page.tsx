"use client";

import Link from "next/link";
import { ArrowLeft, Landmark, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-12 max-w-4xl space-y-8 min-h-[85vh]">
      
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Portal Home</span>
      </Link>
      
      {/* Header Banner */}
      <div className="border-b border-border-custom pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-theme-primary/10 text-theme-primary flex items-center justify-center">
          <Landmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide">Terms & Conditions</h1>
          <p className="text-sm text-text-light mt-1">Effective Date: August 2026</p>
        </div>
      </div>

      {/* Terms Body */}
      <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">1. Agreement to Terms</h2>
          <p>
            By creating an account, browsing listings, or reserving seat locks on OrbitX Travel, you agree to bound by these terms, standardized vendor guidelines, and localized travel regulations.
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">2. Reservation Locking and Payment Terms</h2>
          <p>
            Paying minimum seat lock fees or stay deposits reserves slots with verified hotel partners and tour hosts. Settling the outstanding package balance is required directly with the host operator 24 hours prior to departure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">3. Host & Vendor Responsibilities</h2>
          <p>
            Hotel owners and tour organizers must maintain accurate inventory counts, room availability calendars, and departure schedules. Hosts are prohibited from cancelling confirmed bookings without administrative notification and full refund processing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">4. PDF Travel Vouchers</h2>
          <p>
            Issued PDF Travel Vouchers serve as proof of reservation lock. Travelers must present their voucher along with a valid photo ID during check-in or tour departure assembly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">5. User Conduct & Account Integrity</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their login credentials. Fraudulent bookings, false host reviews, or unauthorized API automated scrapers will result in immediate permanent account suspension.
          </p>
        </section>

      </div>

    </div>
  );
}
