"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function CancellationPage() {
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
          <RefreshCw className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide">Cancellation & Refund Policy</h1>
          <p className="text-sm text-text-light mt-1">Standardized Rules for Seat Locks and Hotel Stays</p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">1. Tour Package Seat Lock Cancellations</h2>
          <p>
            Seat lock fees are non-refundable within 48 hours of scheduled tour departure. If a traveler cancels a tour booking more than 48 hours prior to departure, a 100% refund of the seat lock deposit will be issued to the original payment method.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">2. Hotel & Room Stay Cancellations</h2>
          <p>
            Hotel stay cancellations requested at least 24 hours prior to standard check-in time (14:00 local time) are eligible for a full refund. Cancellations made on the day of check-in are subject to 1 night stay fee retention.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">3. Host-Initiated Cancellations</h2>
          <p>
            In the rare event that a verified Tour Host or Hotel Partner cancels a confirmed reservation due to emergency circumstances, the traveler will receive an immediate 100% full refund plus priority rebooking options.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">4. Refund Processing Timelines</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>bKash / Nagad / MFS Refunds: 24 - 48 Hours</li>
            <li>Credit / Debit Card Refunds: 3 - 5 Business Days</li>
          </ul>
        </section>

      </div>

    </div>
  );
}
