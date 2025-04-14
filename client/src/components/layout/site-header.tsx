import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="container flex justify-between items-center h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xl px-2 py-1 rounded">
              Pay
            </span>
            <span className="font-bold text-xl">Surity</span>
          </Link>

          <NavigationMenu className="hidden md:flex ml-6">
            <NavigationMenuList className="flex items-center gap-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10">Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-indigo-50 to-white p-6 no-underline outline-none focus:shadow-md"
                          to="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            PaySurity Platform
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            A comprehensive digital payment ecosystem with specialized solutions for merchants of all sizes.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ProductItem to="/digital-wallet-page" title="Digital Wallet">
                      Card-present transactions, online payments, and ACH services
                    </ProductItem>
                    <ProductItem to="/pos-systems-page" title="POS Systems">
                      Specialized POS solutions for different industries
                    </ProductItem>
                    <ProductItem to="/industry-solutions-page" title="Industry Solutions">
                      Tailored payment solutions for restaurant, legal, healthcare, and retail
                    </ProductItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10">Solutions</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[500px] md:grid-cols-2">
                    <ProductItem to="/industry-solutions-page#restaurant" title="Restaurant">
                      Table management, order processing, tip calculations
                    </ProductItem>
                    <ProductItem to="/industry-solutions-page#legal" title="Legal Practices">
                      Client billing, time tracking, case management
                    </ProductItem>
                    <ProductItem to="/industry-solutions-page#healthcare" title="Healthcare">
                      Insurance verification, HIPAA compliance, patient billing
                    </ProductItem>
                    <ProductItem to="/industry-solutions-page#retail" title="Retail">
                      Inventory management, customer loyalty, sales reporting
                    </ProductItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/pricing-page" className={navigationMenuTriggerStyle()}>
                  Pricing
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/blog-page" className={navigationMenuTriggerStyle()}>
                  Blog
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <select className="text-sm border border-gray-300 rounded-md py-1 px-2 bg-white">
            <option>English (US)</option>
            <option>Español</option>
            <option>Français</option>
          </select>
          <Link to="/auth">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/auth">
            <Button>Get started</Button>
          </Link>
        </div>

        {/* Mobile navigation toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3">
          <nav className="flex flex-col space-y-3">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-gray-900">
                <span className="text-sm font-medium">Products</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-2 mt-1 space-y-2">
                <Link to="/digital-wallet-page">
                  <div className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Digital Wallet
                  </div>
                </Link>
                <Link to="/pos-systems-page">
                  <div className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    POS Systems
                  </div>
                </Link>
                <Link to="/industry-solutions-page">
                  <div className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Industry Solutions
                  </div>
                </Link>
              </div>
            </details>

            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-gray-900">
                <span className="text-sm font-medium">Solutions</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-2 mt-1 space-y-2">
                <Link to="/industry-solutions-page#restaurant">
                  <div className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Restaurant
                  </div>
                </Link>
                <Link to="/industry-solutions-page#legal">
                  <div className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Legal Practices
                  </div>
                </Link>
                <Link to="/industry-solutions-page#healthcare">
                  <div className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Healthcare
                  </div>
                </Link>
                <Link to="/industry-solutions-page#retail">
                  <div className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Retail
                  </div>
                </Link>
              </div>
            </details>

            <Link to="/pricing-page">
              <div className="block rounded-lg px-2 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                Pricing
              </div>
            </Link>

            <Link to="/blog-page">
              <div className="block rounded-lg px-2 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                Blog
              </div>
            </Link>

            <div className="border-t border-gray-100 pt-3">
              <div className="mb-3">
                <select className="w-full text-sm border border-gray-300 rounded-md py-2 px-2 bg-white">
                  <option>English (US)</option>
                  <option>Español</option>
                  <option>Français</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/auth">
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/auth">
                  <Button className="w-full">Get started</Button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

interface ProductItemProps {
  title: string;
  to: string;
  children: React.ReactNode;
}

function ProductItem({ title, children, to }: ProductItemProps) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          )}
          to={to}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}