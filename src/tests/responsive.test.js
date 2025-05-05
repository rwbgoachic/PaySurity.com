import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Header, Footer } from '@paysurity/ui';

describe('Responsive Components', () => {
  it('Header should be responsive', () => {
    const { container } = render(<Header />);
    const header = container.firstChild;
    
    expect(header).toHaveClass('md:flex');
    expect(header).toHaveClass('lg:flex');
  });

  it('Footer should be responsive', () => {
    const { container } = render(<Footer />);
    const footer = container.firstChild;
    
    expect(footer).toHaveClass('md:grid-cols-2');
    expect(footer).toHaveClass('lg:grid-cols-4');
  });
});