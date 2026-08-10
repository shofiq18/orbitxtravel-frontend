"use client";

import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-12 max-w-4xl space-y-8 min-h-[85vh]">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Portal Home</span>
      </Link>
      
      <div className="border-b border-border-custom pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-theme-primary/10 text-theme-primary flex items-center justify-center">
          <Landmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide">Terms of Service</h1>
          <p className="text-sm text-text-light mt-1">Last Updated: August 2026</p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">1. Agreement to Terms</h2>
          <p>
            By accessing and booking properties or tour packages on OrbitX Travel, you agree to comply with our standardized vendor policies, refund codes, and localized service conditions.
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">2. Reservation Locking and Deposit Payments</h2>
          <p>
            Paying standard seat lock fees or stay deposits reserves slots with hotel partners and tour hosts. Settling the outstanding BDT package balance is required directly with the host operator 24 hours prior to departure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">3. Host Compliance</h2>
          <p>
            Hotel owners and tour organizers must maintain accurate inventory records, seat maximum occupancy counts, and check-in conditions on their active dashboards. Failure to deliver services results in immediate onboarding verification ban.
          </p>
        </section>
      </div>
    </div>
  );
}
