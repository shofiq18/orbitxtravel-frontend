"use client";

import Link from "next/link";
import { Globe, Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-bg-dark text-text-white border-t border-border-custom pt-16 pb-8 transition-colors duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6">
        
        {/* Grid Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-gray-800 pb-12">
          
          {/* Column 1: Brand details */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white font-bold text-2xl tracking-wide">
              <Globe className="h-6 w-6 text-theme-secondary" />
              <span>orbitX Travel</span>
            </Link>
            <p className="text-sm text-text-light leading-relaxed">
              Global Standard Multi-Vendor booking portal for verified hotels and tour packages. Travel premium, travel secure.
            </p>
          </div>

          {/* Column 2: Navigation links */}
          <div className="space-y-4">
            <h4 className="text-white text-base font-bold">Explore</h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li>
                <Link href="/" className="hover:text-theme-secondary transition-colors">Find Tour Packages</Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-theme-secondary transition-colors">Browse Verified Hotels</Link>
              </li>
              <li>
                <Link href="/become-host" className="hover:text-theme-secondary transition-colors">List Your Property</Link>
              </li>
              <li>
                <Link href="/become-host" className="hover:text-theme-secondary transition-colors">Host a Tour Guide</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-white text-base font-bold">Support Hub</h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-theme-secondary shrink-0" />
                <span>Level 4, Banani Block E, Dhaka, BD</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-theme-secondary shrink-0" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-theme-secondary shrink-0" />
                <span>support@orbitxtravel.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: WhatsApp Sticky Support Box */}
          <div className="space-y-4">
            <h4 className="text-white text-base font-bold">Direct Help</h4>
            <p className="text-sm text-text-light leading-relaxed">
              Have questions? Talk to our administrator directly on WhatsApp to coordinate details.
            </p>
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-5 py-2.5 text-sm transition-all rounded-none w-full justify-center"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Footer Base */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-xs text-text-light space-y-4 md:space-y-0">
          <div>
            &copy; {currentYear} orbitX Travel. All rights reserved. Registered under license LIC-99302-GLOBAL.
          </div>
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/cancellation" className="hover:underline">Cancellation Policy</Link>
          </div>
        </div>

      </div>

      {/* Floating WhatsApp Action Button for mobile screen sizes */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center rounded-none border-2 border-white md:hidden"
        aria-label="Contact support on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 fill-current" />
      </a>

    </footer>
  );
}
