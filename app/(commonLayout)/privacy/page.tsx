"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Database } from "lucide-react";

export default function PrivacyPage() {
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
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide">Privacy & Data Protection Policy</h1>
          <p className="text-sm text-text-light mt-1">Last Revised: August 2026</p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary flex items-center space-x-2">
            <span>1. Information We Collect</span>
          </h2>
          <p>
            At OrbitX Travel, we collect personal information necessary to facilitate tour seat locks, hotel reservations, and host onboarding. This includes your full name, email address, phone number, payment transaction references, and host verification documents (NID, Passport, or Business Licenses).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary flex items-center space-x-2">
            <span>2. How We Use Your Information</span>
          </h2>
          <p>
            Your information is used strictly for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
            <li>Processing reservation seat locks and issuing downloadable PDF Travel Vouchers.</li>
            <li>Sending automated email notifications, pre-trip departure alerts, and booking updates via Nodemailer.</li>
            <li>Verifying the identity of Tour Organizers and Hotel Owners to ensure platform security.</li>
            <li>Calculating commission retention and disbursing automated payouts to host partners.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary flex items-center space-x-2">
            <span>3. Data Security & Storage</span>
          </h2>
          <p>
            We implement industry-standard AES encryption protocols, secure tokenized JWT authentication, and isolated PostgreSQL databases. Your password is stored securely as a bcrypt hash (12 rounds) and is never accessible in plaintext.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary flex items-center space-x-2">
            <span>4. Third-Party Service Providers</span>
          </h2>
          <p>
            We do not sell or rent user data to third parties. Data is shared strictly with authorized partners (e.g. payment gateway providers for transaction verification and Nodemailer SMTP servers for email delivery).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary flex items-center space-x-2">
            <span>5. Your Data Rights & Control</span>
          </h2>
          <p>
            You have the right to inspect, update, or request the deletion of your personal account data at any time through your Traveler Dashboard or by contacting our Support Team at <span className="font-bold text-text-primary">support@orbitxtravel.com</span>.
          </p>
        </section>

      </div>

    </div>
  );
}
