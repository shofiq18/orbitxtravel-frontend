"use client";

import Link from "next/link";
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
            <div className="flex space-x-3 pt-2">
              <a 
                href="#" 
                className="w-8 h-8 border border-gray-700 flex items-center justify-center text-gray-200 hover:text-white hover:border-theme-accent hover:bg-white/5 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 border border-gray-700 flex items-center justify-center text-gray-200 hover:text-white hover:border-theme-accent hover:bg-white/5 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 border border-gray-700 flex items-center justify-center text-gray-200 hover:text-white hover:border-theme-accent hover:bg-white/5 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 border border-gray-700 flex items-center justify-center text-gray-200 hover:text-white hover:border-theme-accent hover:bg-white/5 transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
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
                <MapPin className="h-4 w-4 text-theme-accent shrink-0 mt-0.5" />
                <span className="leading-tight text-gray-200">Level 4, Banani Block E, Dhaka, BD</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-theme-accent shrink-0" />
                <span className="text-gray-200">+880 1700-000000</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-theme-accent shrink-0" />
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
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Email address"
                required
                className="w-full bg-gray-800/80 border border-gray-700 text-xs px-3.5 py-2.5 text-white outline-none focus:border-theme-accent transition-all duration-300 rounded-none placeholder-gray-400"
              />
              <button 
                type="submit"
                className="bg-theme-accent text-white font-bold px-4 hover:bg-opacity-90 transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center"
                aria-label="Subscribe"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="pt-2">
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-4 py-2.5 text-xs transition-all duration-300 rounded-none w-full justify-center"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Live Admin Support</span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Base */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-[11px] text-gray-300 space-y-4 md:space-y-0">
          <div>
            &copy; {currentYear} OrbitX Travel. All rights reserved. Registered under license LIC-99302-GLOBAL.
          </div>
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link>
          </div>
        </div>

      </div>

      {/* Floating WhatsApp Action Button for mobile screen sizes */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center rounded-none border-2 border-white md:hidden print:hidden"
        aria-label="Contact support on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 fill-current" />
      </a>

    </footer>
  );
}
