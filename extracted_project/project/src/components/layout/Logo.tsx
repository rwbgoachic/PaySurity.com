import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark';
}

const Logo = ({ variant = 'dark' }: LogoProps) => {
  const navigate = useNavigate();
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const iconColor = variant === 'light' ? 'text-cyan-400' : 'text-cyan-600';

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div 
      className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
      onClick={handleClick}
    >
      <div className={`mr-2 ${iconColor}`}>
        <CreditCard size={28} />
      </div>
      <div>
        <h1 className={`text-xl font-bold ${textColor}`}>PaySurity</h1>
      </div>
    </div>
  );
};

export default Logo;