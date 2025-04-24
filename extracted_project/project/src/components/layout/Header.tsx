import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mainNavItems } from '../../data/navigation';
import Container from '../ui/Container';
import { Menu, X, ChevronDown } from 'lucide-react';
import Logo from './Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (label: string) => {
    if (openDropdown === label) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(label);
    }
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <Container>
        <div className="flex items-center justify-between">
          <Logo variant={isScrolled ? 'dark' : 'light'} />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:space-x-8">
            {mainNavItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <button
                    className={`flex items-center text-${
                      isScrolled ? 'gray-800' : 'white'
                    } hover:text-cyan-500 font-medium transition-colors`}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    {item.label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`text-${
                      isScrolled ? 'gray-800' : 'white'
                    } hover:text-cyan-500 font-medium transition-colors`}
                  >
                    {item.label}
                  </button>
                )}

                {item.children && (
                  <div className="absolute left-0 mt-2 w-48 bg-white py-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        onClick={() => handleNavigation(child.href)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <button
              onClick={() => handleNavigation('/login')}
              className={`h-10 px-4 text-sm inline-flex items-center justify-center font-medium bg-transparent border-2 ${
                isScrolled
                  ? 'border-gray-300 text-gray-800 hover:bg-gray-100'
                  : 'border-white text-white hover:bg-white/10'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => handleNavigation('/signup')}
              className="h-10 px-4 text-sm inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            >
              Sign up
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-800"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              {mainNavItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        className="flex items-center justify-between w-full text-gray-800 font-medium"
                        onClick={() => toggleDropdown(item.label)}
                      >
                        {item.label}
                        <ChevronDown className={`h-4 w-4 transform transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdown === item.label && (
                        <div className="mt-2 pl-4 space-y-2">
                          {item.children.map((child) => (
                            <button
                              key={child.label}
                              onClick={() => handleNavigation(child.href)}
                              className="block w-full text-left text-gray-600 hover:text-cyan-500"
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className="text-gray-800 font-medium hover:text-cyan-500 w-full text-left"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </nav>
            <div className="mt-6 flex flex-col space-y-3">
              <button
                onClick={() => handleNavigation('/login')}
                className="h-10 px-4 text-sm inline-flex items-center justify-center font-medium bg-transparent border-2 border-gray-300 text-gray-800 hover:bg-gray-100 w-full"
              >
                Log in
              </button>
              <button
                onClick={() => handleNavigation('/signup')}
                className="h-10 px-4 text-sm inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700 w-full"
              >
                Sign up
              </button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Header;