"use client";

import Link from "next/link";
import { ArrowLeft, BellRing } from "lucide-react";

export default function CancellationPage() {
  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-12 max-w-4xl space-y-8 min-h-[85vh]">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Portal Home</span>
      </Link>
      
      <div className="border-b border-border-custom pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-theme-primary/10 text-theme-primary flex items-center justify-center">
          <BellRing className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide">Cancellation & Refund Policy</h1>
          <p className="text-sm text-text-light mt-1">Last Updated: August 2026</p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">1. Hotel Booking Cancellations</h2>
          <p>
            Reservations cancelled 48 hours prior to check-in qualify for a full refund of deposit lock fees. Cancellations inside 48 hours are subject to a single night BDT deduction.
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">2. Tour Seat Booking Cancellations</h2>
          <p>
            Tour package deposits can be cancelled up to 72 hours prior to flight/coach departure for a full refund. Late cancellations inside 72 hours are subject to full forfeiture of the seat lock deposit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">3. Host Cancellation Indemnity</h2>
          <p>
            If a host cancels an onboarding event or accommodation stay, the guest will receive an automatic full deposit reversal within 48 business hours.
          </p>
        </section>
      </div>
    </div>
  );
}
