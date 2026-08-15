"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thank you! Your message has been sent to our support team.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="w-full mx-auto px-8 lg:px-16 py-12 max-w-6xl space-y-10 min-h-[85vh]">
      
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-text-light hover:text-text-secondary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Portal Home</span>
      </Link>

      {/* Header Banner */}
      <div className="border-b border-border-custom pb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-wide">Contact Us & Support</h1>
          <p className="text-sm text-text-secondary mt-1">Get in touch with the OrbitX Travel team for assistance with bookings, host verification, or inquiries.</p>
        </div>
      </div>

      {/* Top Grid 4 Contact Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-border-custom bg-bg-primary p-6 space-y-3 rounded-none text-left">
          <div className="w-10 h-10 bg-theme-primary/10 text-theme-primary flex items-center justify-center">
            <Phone className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary">24/7 Helpline</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Instant assistance for urgent booking modifications.
          </p>
          <p className="text-xs font-bold text-theme-primary">+880 (02) 8812-9900</p>
        </div>

        <div className="border border-border-custom bg-bg-primary p-6 space-y-3 rounded-none text-left">
          <div className="w-10 h-10 bg-theme-primary/10 text-theme-primary flex items-center justify-center">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Email Support</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Send inquiries or onboarding documents anytime.
          </p>
          <p className="text-xs font-bold text-theme-primary break-all">support@orbitxtravel.com</p>
        </div>

        <div className="border border-border-custom bg-bg-primary p-6 space-y-3 rounded-none text-left">
          <div className="w-10 h-10 bg-theme-primary/10 text-theme-primary flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Headquarters</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            OrbitX Travel Tower, Level 12<br />
            Gulshan Avenue, Dhaka-1212
          </p>
        </div>

        <div className="border border-border-custom bg-bg-primary p-6 space-y-3 rounded-none text-left">
          <div className="w-10 h-10 bg-theme-primary/10 text-theme-primary flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Operating Hours</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Online: 24/7 Active<br />
            Office: Sun - Thu (9am - 6pm)
          </p>
        </div>
      </div>

      {/* Contact Form Below Cards Grid */}
      <div className="border border-border-custom bg-bg-primary p-8 space-y-6 rounded-none mt-8">
        <div className="border-b border-border-custom pb-4 text-left">
          <h2 className="text-xl font-bold text-text-primary">Send Us a Direct Message</h2>
          <p className="text-xs text-text-secondary mt-1">Fill out the form below and a support agent will respond within 2 hours.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full py-3 px-4 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Your Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full py-3 px-4 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Subject / Concern</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Booking Voucher Question, Host Verification Status"
              required
              className="w-full py-3 px-4 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-text-secondary">Message Details</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your inquiry or reservation details here..."
              required
              className="w-full py-3 px-4 text-sm text-text-primary bg-bg-secondary border border-border-custom outline-none focus:border-theme-primary transition-all rounded-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-btn-primary text-btn-text-primary text-xs font-bold py-3.5 px-8 flex items-center space-x-2 border border-transparent hover:opacity-90 transition-all rounded-none cursor-pointer disabled:opacity-75"
          >
            <span>{isSubmitting ? "Sending Message..." : "Submit Inquiry"}</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
