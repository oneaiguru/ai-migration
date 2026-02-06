const NON_DIGIT = /\D+/g;

export const formatPhone = (value?: string): string => {
  if (!value) {
    return '—';
  }

  const digits = value.replace(NON_DIGIT, '');
  if (digits.length < 10) {
    return value;
  }

  const local = digits.slice(-10);
  const country = digits.slice(0, -10) || '+7';
  const area = local.slice(0, 3);
  const prefix = local.slice(3, 6);
  const line = local.slice(6, 8);
  const tail = local.slice(8, 10);

  const formatted = `${country} (${area}) ${prefix}-${line}-${tail}`;
  const extensionMatch = value.match(/(доб\.?\s?\d+)/i);
  if (extensionMatch) {
    return `${formatted} ${extensionMatch[1]}`;
  }

  return formatted;
};
