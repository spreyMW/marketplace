import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white border-t-4 border-green-700">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-green-700 to-amber-600 text-white px-2 py-1 rounded text-lg font-bold">🌾</div>
              <h3 className="text-xl font-bold">Agriculture Hub</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted source for premium agricultural equipment and supplies. Quality equipment for modern farming.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-green-400">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="text-slate-400 hover:text-green-400 transition text-sm">
                Home
              </Link>
              <Link to="/products" className="text-slate-400 hover:text-green-400 transition text-sm">
                Products
              </Link>
              <Link to="/cart" className="text-slate-400 hover:text-green-400 transition text-sm">
                Cart
              </Link>
              <Link to="/track-order" className="text-slate-400 hover:text-green-400 transition text-sm">
                Track Order
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-green-400">Support</h4>
            <div className="space-y-2">
              <a href="#" className="text-slate-400 hover:text-green-400 transition text-sm">
                Help Center
              </a>
              <a href="#" className="text-slate-400 hover:text-green-400 transition text-sm">
                FAQ
              </a>
              <a href="#" className="text-slate-400 hover:text-green-400 transition text-sm">
                Shipping Info
              </a>
              <a href="#" className="text-slate-400 hover:text-green-400 transition text-sm">
                Returns Policy
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-green-400">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@agriculturehub.com" className="text-slate-400 hover:text-green-400 transition text-sm">
                  info@agriculturehub.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-slate-400 hover:text-green-400 transition text-sm">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-400 text-sm">123 Farm Road, Agriculture City</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © {currentYear} Agriculture Hub. All rights reserved.
          </p>

          {/* Social Media Links */}
          <div className="flex items-center space-x-4">
            <a href="#" className="text-slate-400 hover:text-green-400 transition" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-slate-400 hover:text-green-400 transition" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-slate-400 hover:text-green-400 transition" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-slate-400 hover:text-green-400 transition" aria-label="Instagram">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
