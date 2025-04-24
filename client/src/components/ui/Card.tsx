import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

const CardTitle = ({ children, className = '' }: CardTitleProps) => {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
};

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

const CardDescription = ({ children, className = '' }: CardDescriptionProps) => {
  return <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>;
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

const CardContent = ({ children, className = '' }: CardContentProps) => {
  return <div className={`p-4 pt-0 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };