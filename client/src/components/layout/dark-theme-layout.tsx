import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface DarkThemeLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  hideFooter?: boolean;
}

export function DarkThemeLayout({
  children,
  className,
  hideNav = false,
  hideFooter = false,
}: DarkThemeLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {!hideNav && <DarkThemeNavbar />}
      <main className={cn("flex-1", className)}>{children}</main>
      {!hideFooter && <DarkThemeFooter />}
    </div>
  );
}

function DarkThemeNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-500">PaySurity</span>
            </a>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/industry-solutions">Industries</NavLink>
          <NavLink href="/digital-wallet">Digital Wallet</NavLink>
          <NavLink href="/pos-systems">POS Systems</NavLink>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link href="/auth?mode=login">
            <a className="rounded-md px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors">
              Log in
            </a>
          </Link>
          <Link href="/auth?mode=register">
            <a className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Get Started
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link href={href}>
      <a className="text-sm font-medium text-gray-300 hover:text-blue-500 transition-colors">
        {children}
      </a>
    </Link>
  );
}

function DarkThemeFooter() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold text-white">PaySurity</h3>
            <p className="text-sm text-gray-400">
              Modern payment infrastructure for businesses of all sizes
            </p>
            <div className="flex space-x-4">
              <FooterSocialLink href="#" aria-label="Twitter">
                <svg 
                  width="20" 
                  height="20" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <path d="M22.162 5.656a8.385 8.385 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.191 4.191 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.395 8.395 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.495 8.495 0 0 0 2.087-2.165"/>
                </svg>
              </FooterSocialLink>
              <FooterSocialLink href="#" aria-label="LinkedIn">
                <svg 
                  width="20" 
                  height="20" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z"/>
                </svg>
              </FooterSocialLink>
              <FooterSocialLink href="#" aria-label="Facebook">
                <svg 
                  width="20" 
                  height="20" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z"/>
                </svg>
              </FooterSocialLink>
            </div>
          </div>
          
          <FooterColumn title="Products">
            <FooterLink href="/products">All Products</FooterLink>
            <FooterLink href="/payments">Payment Processing</FooterLink>
            <FooterLink href="/digital-wallet">Digital Wallet</FooterLink>
            <FooterLink href="/pos-systems">POS Systems</FooterLink>
          </FooterColumn>
          
          <FooterColumn title="Company">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/contact">Contact Us</FooterLink>
          </FooterColumn>
          
          <FooterColumn title="Resources">
            <FooterLink href="/documentation">Documentation</FooterLink>
            <FooterLink href="/support">Support</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/api">API Reference</FooterLink>
          </FooterColumn>
          
          <FooterColumn title="Legal">
            <FooterLink href="/legal/terms">Terms of Service</FooterLink>
            <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/legal/compliance">Compliance</FooterLink>
            <FooterLink href="/legal/security">Security</FooterLink>
          </FooterColumn>
        </div>
        
        <div className="mt-10 border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} PaySurity, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  children: React.ReactNode;
}

function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-sm font-bold uppercase text-gray-200">{title}</h3>
      <div className="flex flex-col space-y-2">{children}</div>
    </div>
  );
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link href={href}>
      <a className="text-sm text-gray-400 hover:text-blue-500 transition-colors">
        {children}
      </a>
    </Link>
  );
}

interface FooterSocialLinkProps {
  href: string;
  children: React.ReactNode;
  'aria-label': string;
}

function FooterSocialLink({ href, children, 'aria-label': ariaLabel }: FooterSocialLinkProps) {
  return (
    <a 
      href={href} 
      className="hover:text-blue-500 transition-colors" 
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}