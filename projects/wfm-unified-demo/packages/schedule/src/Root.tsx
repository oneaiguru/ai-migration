import { StrictMode, useEffect } from 'react';
import App from './App';
import './index.css';

export interface ScheduleRootProps {
  /**
   * Optional basename provided by the shell router (e.g. "/schedule").
   * The component does not manage routing, but we expose the value as a
   * data-attribute for diagnostics and potential relative link handling.
   */
  basename?: string;
}

export function Root({ basename }: ScheduleRootProps = {}): JSX.Element {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const attributeName = 'data-schedule-basename';
    const normalized = basename
      ? basename.startsWith('/')
        ? basename
        : `/${basename}`
      : null;

    if (normalized) {
      document.documentElement.setAttribute(attributeName, normalized);
    } else {
      document.documentElement.removeAttribute(attributeName);
    }

    return () => {
      document.documentElement.removeAttribute(attributeName);
    };
  }, [basename]);

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export default Root;
