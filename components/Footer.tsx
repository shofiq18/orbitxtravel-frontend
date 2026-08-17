"use client";

import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import { 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Send 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription mock
  };

  return (
    <footer className="w-full bg-[#0B0F19] text-gray-100 border-t border-gray-800/50 pt-16 pb-8 transition-colors duration-300">
      <div className="w-full mx-auto px-8 lg:px-16">
        
        {/* Grid Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-800/80 pb-12">
          
          {/* Column 1: Brand & Socials */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center space-x-2 text-white font-bold text-2xl tracking-wide">
              <Globe className="h-6 w-6 text-theme-accent animate-pulse" />
              <span>OrbitX Travel</span>
            </Link>
            <p className="text-xs text-gray-200 leading-relaxed max-w-sm">
              Global Standard Multi-Vendor booking portal for verified hotels and tour packages. Travel premium, travel secure.
            </p>
            <div className="flex items-center space-x-5 pt-2 text-white">
              <a 
                href="#" 
                className="hover:text-neutral-400 transition-all duration-200 transform hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="hover:text-neutral-400 transition-all duration-200 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-neutral-400 transition-all duration-200 transform hover:scale-110"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="hover:text-neutral-400 transition-all duration-200 transform hover:scale-110"
                aria-label="Pinterest"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="hover:text-neutral-400 transition-all duration-200 transform hover:scale-110"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 00-1-.08 6.34 6.34 0 106.34 6.34V8.72a8.16 8.16 0 004.92 1.63V6.9a4.85 4.85 0 01-1-.21z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="hover:text-neutral-400 transition-all duration-200 transform hover:scale-110"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-xs text-gray-100">
              <li>
                <Link href="/tours" className="hover:text-theme-accent transition-colors duration-200 block py-0.5">Find Tour Packages</Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-theme-accent transition-colors duration-200 block py-0.5">Browse Verified Hotels</Link>
              </li>
              <li>
                <Link href="/become-host" className="hover:text-theme-accent transition-colors duration-200 block py-0.5">List Your Property</Link>
              </li>
              <li>
                <Link href="/become-host" className="hover:text-theme-accent transition-colors duration-200 block py-0.5">Host a Tour Guide</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Support Hub</h4>
            <ul className="space-y-3.5 text-xs text-gray-200">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-white shrink-0 mt-0.5" />
                <span className="leading-tight text-gray-200">Level 4, Banani Block E, Dhaka, BD</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-white shrink-0" />
                <span className="text-gray-200">+880 1929-654718</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-white shrink-0" />
                <span className="text-gray-200">support@orbitxtravel.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Direct Chat */}
          <div className="space-y-5">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs text-gray-200 leading-relaxed">
              Subscribe to receive updates on premium travel deals and verified tours.
            </p>
            <form onSubmit={handleSubscribe} className="w-full max-w-sm">
              <div className="bg-white p-1.5 rounded-full flex items-center shadow-xl border border-white/20">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  required
                  className="w-full bg-transparent text-black placeholder-neutral-400 text-xs sm:text-sm px-4 py-2 outline-none font-medium"
                />
                <button 
                  type="submit"
                  className="bg-[#0061AA] hover:bg-[#004b85] text-white font-extrabold text-xs tracking-wider px-5 sm:px-6 py-2.5 rounded-full uppercase transition-all duration-300 shadow-md cursor-pointer shrink-0"
                >
                  SUBSCRIBE
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer Base */}
        <div className="pt-8 flex flex-col items-center justify-center space-y-3.5 text-center">
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-gray-300">
            <Link href="/help" className="hover:text-white transition-colors">Help Center & FAQ</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link>
          </div>
          <div className="text-[11px] text-gray-400 tracking-wide">
            &copy; {currentYear} OrbitX Travel. All rights reserved. Registered under license LIC-99302-GLOBAL.
          </div>
        </div>

      </div>

      {/* Floating Professional WhatsApp Widget Component */}
      <WhatsAppButton />

    </footer>
  );
}
