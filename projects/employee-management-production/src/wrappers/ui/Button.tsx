import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const joinClassNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ');

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    fullWidth,
    className,
    type,
    ...rest
  }, ref) => {
    const composedClassName = joinClassNames(
      'em-button',
      `em-button--${variant}`,
      `em-button--${size}`,
      fullWidth ? 'em-button--full' : undefined,
      className,
    );

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={composedClassName}
        {...rest}
      />
    );
  },
);

Button.displayName = 'Button';

export default Button;
