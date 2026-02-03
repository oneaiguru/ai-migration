import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RiskBadge } from '../../shared/RiskBadge';

describe('RiskBadge', () => {
  it('renders High label when risk >= 0.8', () => {
    render(<RiskBadge risk={0.85} />);
    expect(screen.getByText(/Высокий/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Риск переполнения/)).toBeInTheDocument();
  });

  it('renders only percent when showLabel=false', () => {
    render(<RiskBadge risk={0.42} showLabel={false} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });
});
