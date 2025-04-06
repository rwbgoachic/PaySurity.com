import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12 text-gray-600">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">PaySurity</h3>
            <p className="mb-4 text-sm">Financial infrastructure for businesses</p>
            <p className="text-sm text-gray-500">
              Comprehensive payment solutions for businesses of all sizes. Secure, scalable, and built for growth.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/digital-wallet" className="text-gray-600 hover:text-gray-900 transition-colors">Digital Wallet</Link></li>
              <li><Link to="/pos-systems" className="text-gray-600 hover:text-gray-900 transition-colors">POS Systems</Link></li>
              <li><Link to="/industry-solutions" className="text-gray-600 hover:text-gray-900 transition-colors">Industry Solutions</Link></li>
              <li><Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link></li>
              <li><Link to="/documentation" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="text-gray-600 hover:text-gray-900 transition-colors">Support</Link></li>
              <li><Link to="/partners" className="text-gray-600 hover:text-gray-900 transition-colors">Partners</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-gray-900 transition-colors">Careers</Link></li>
              <li><Link to="/customers" className="text-gray-600 hover:text-gray-900 transition-colors">Customers</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/compliance" className="text-gray-600 hover:text-gray-900 transition-colors">Compliance</Link></li>
              <li><Link to="/security" className="text-gray-600 hover:text-gray-900 transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <select className="text-sm border border-gray-300 rounded-md py-1 px-2 bg-white">
              <option>English (US)</option>
              <option>Español</option>
              <option>Français</option>
            </select>
            <p className="text-sm text-gray-500">© 2025 PaySurity, Inc. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}