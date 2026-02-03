import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FillBar } from '../../shared/FillBar';

describe('FillBar', () => {
  it('shows percentage text and aria-label', () => {
    render(<FillBar pct={0.8} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByLabelText('Заполнение: 80%')).toBeInTheDocument();
  });
});
