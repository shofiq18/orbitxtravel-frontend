"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-12 max-w-4xl space-y-8 min-h-[85vh]">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Portal Home</span>
      </Link>
      
      <div className="border-b border-border-custom pb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-theme-primary/10 text-theme-primary flex items-center justify-center">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide">Privacy Policy</h1>
          <p className="text-sm text-text-light mt-1">Last Updated: August 2026</p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">1. Information We Collect</h2>
          <p>
            OrbitX Travel collects basic contact information (full name, email, billing address) during the account registration and stay lock deposit reservation flow to authenticate user profiles and match vendor coordination workflows.
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">2. Security Compliance Auditing</h2>
          <p>
            User credentials and financial transaction details are processed over encrypted channels. We hold partner listings accountable via mandatory background audits to verify safety standards on all listed properties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">3. Sharing Data with Host Organizers</h2>
          <p>
            When locking a seat deposit or stay booking reservation, your basic profile coordinates are shared directly with the hotel manager or tour constructor host to complete verification before departure or check-in.
          </p>
        </section>
      </div>
    </div>
  );
}
