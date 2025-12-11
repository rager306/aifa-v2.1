import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Icons } from '../icons';

describe('Icons Component', () => {
  it('renders logo icon', () => {
    const { container } = render(<Icons.logo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders spinner with title for accessibility', () => {
    const { container } = render(<Icons.spinner />);
    const title = container.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('Loading spinner');
  });

  it('renders tailwind icon with title', () => {
    const { container } = render(<Icons.tailwind />);
    const title = container.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('Tailwind CSS');
  });

  it('renders json icon with title', () => {
    const { container } = render(<Icons.json />);
    const title = container.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('JSON');
  });

  it('renders ts icon with title', () => {
    const { container } = render(<Icons.ts />);
    const title = container.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('TypeScript');
  });

  it('renders css icon with title', () => {
    const { container } = render(<Icons.css />);
    const title = container.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('CSS');
  });

  it('renders bash icon with title', () => {
    const { container } = render(<Icons.bash />);
    const title = container.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('Bash');
  });
});
