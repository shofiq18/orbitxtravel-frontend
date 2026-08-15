"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Search, ChevronDown, BookOpen, ShieldCheck, CreditCard, Clock, MessageSquare, PhoneCall } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "booking" | "payments" | "vendors" | "pretrip";
}

const faqs: FAQItem[] = [
  {
    category: "booking",
    question: "How does the Seat Lock Fee work for Tour Packages?",
    answer: "The seat lock fee is a minimal deposit required to reserve your seat on a scheduled tour package. Paying this fee immediately reserves your seat and locks in the package rate. The remaining balance is paid directly to your tour host before departure."
  },
  {
    category: "booking",
    question: "How do I download my official PDF Travel Voucher?",
    answer: "Once your payment is confirmed, an official PDF Travel Voucher is generated automatically. You can download it directly from your Traveler Dashboard under 'My Bookings', or access it via the confirmation email sent to you."
  },
  {
    category: "payments",
    question: "What payment methods are supported on OrbitX Travel?",
    answer: "We support instant online payments via bKash, Nagad, Mobile Financial Services (MFS), local and international Debit/Credit Cards, and Internet Banking via automated secure payment gateways."
  },
  {
    category: "payments",
    question: "Are there any hidden service charges or platform commissions for travelers?",
    answer: "No! OrbitX Travel maintains 100% price transparency. The price listed on the package or hotel listing is the final price you pay, with zero hidden booking or platform fees for travelers."
  },
  {
    category: "vendors",
    question: "How do Hotel Owners and Tour Organizers become Verified Vendors?",
    answer: "Vendors can apply through the 'Become a Host' portal by submitting business registration details and valid verification documents (NID/Passport/Trade License). Our admin team inspects every document before granting verified status."
  },
  {
    category: "vendors",
    question: "What is B2B Wholesale Pricing for Rooms?",
    answer: "Verified Tour Organizers can access special B2B wholesale rates offered directly by Hotel Owners to assemble cost-effective group tour packages."
  },
  {
    category: "pretrip",
    question: "When will I receive my pre-trip departure reminder?",
    answer: "OrbitX Travel automatically dispatches automated HTML email reminders 24 hours prior to package departure, including host guide contact info, meeting locations, and travel tips."
  },
  {
    category: "pretrip",
    question: "What should I do if I need to contact my Tour Host Guide directly?",
    answer: "Host guide contact details (email and phone) are included on your PDF Travel Voucher and in your pre-trip departure email alert."
  }
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-12 max-w-5xl space-y-10 min-h-[85vh]">
      
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Portal Home</span>
      </Link>

      {/* Header Banner */}
      <div className="border border-border-custom bg-bg-secondary p-8 text-center space-y-4 rounded-none">
        <div className="w-14 h-14 bg-theme-primary/10 text-theme-primary flex items-center justify-center mx-auto">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary tracking-wide">Help Center & FAQ</h1>
        <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
          Have questions about booking seat locks, hotel stays, or host verification? Search our knowledge base or browse frequently asked questions below.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto pt-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-light pt-2">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. seat lock, PDF voucher, bKash)..."
            className="w-full py-3.5 pl-12 pr-4 text-sm text-text-primary bg-bg-primary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-border-custom pb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
            activeCategory === "all"
              ? "bg-theme-primary text-text-white border-theme-primary"
              : "bg-bg-primary text-text-secondary border-border-custom hover:bg-bg-secondary"
          }`}
        >
          All Topics ({faqs.length})
        </button>
        <button
          onClick={() => setActiveCategory("booking")}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
            activeCategory === "booking"
              ? "bg-theme-primary text-text-white border-theme-primary"
              : "bg-bg-primary text-text-secondary border-border-custom hover:bg-bg-secondary"
          }`}
        >
          Booking & Seat Locks
        </button>
        <button
          onClick={() => setActiveCategory("payments")}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
            activeCategory === "payments"
              ? "bg-theme-primary text-text-white border-theme-primary"
              : "bg-bg-primary text-text-secondary border-border-custom hover:bg-bg-secondary"
          }`}
        >
          Payments & Refunds
        </button>
        <button
          onClick={() => setActiveCategory("vendors")}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
            activeCategory === "vendors"
              ? "bg-theme-primary text-text-white border-theme-primary"
              : "bg-bg-primary text-text-secondary border-border-custom hover:bg-bg-secondary"
          }`}
        >
          Vendor & Verification
        </button>
        <button
          onClick={() => setActiveCategory("pretrip")}
          className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
            activeCategory === "pretrip"
              ? "bg-theme-primary text-text-white border-theme-primary"
              : "bg-bg-primary text-text-secondary border-border-custom hover:bg-bg-secondary"
          }`}
        >
          Pre-Trip Reminders
        </button>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-custom p-8 text-text-secondary">
            <p className="text-base font-semibold">No questions found matching your query.</p>
            <p className="text-xs text-text-light mt-1">Try searching with different keywords or browse all topics.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border border-border-custom bg-bg-primary transition-colors">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left font-bold text-base text-text-primary flex justify-between items-center space-x-4 cursor-pointer hover:bg-bg-secondary/50 transition-colors"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-theme-primary shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border-custom/50 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Need More Assistance Banner */}
      <div className="border border-border-custom bg-bg-secondary p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-none">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-text-primary">Still need help with a reservation?</h3>
          <p className="text-xs text-text-secondary">Our dedicated traveler support team is available 24/7 to assist you.</p>
        </div>
        <Link
          href="/contact"
          className="bg-btn-primary text-btn-text-primary text-xs font-bold px-6 py-3 border border-transparent hover:opacity-90 transition-all rounded-none shrink-0"
        >
          Contact Support Team
        </Link>
      </div>

    </div>
  );
}
