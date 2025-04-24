import React from 'react';
import Container from './Container';

interface SectionProps {
  className?: string;
  children: React.ReactNode;
  id?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  withContainer?: boolean;
}

const Section = ({
  className = '',
  children,
  id,
  containerSize = 'lg',
  withContainer = true,
}: SectionProps) => {
  return (
    <section id={id} className={`py-12 md:py-16 lg:py-20 ${className}`}>
      {withContainer ? (
        <Container size={containerSize}>{children}</Container>
      ) : (
        children
      )}
    </section>
  );
};

export default Section;