export interface DownloadPayload {
  filename: string;
  mimeType: string;
  content: Blob | string;
}

export const triggerBrowserDownload = (payload: DownloadPayload): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const blob = payload.content instanceof Blob
    ? payload.content
    : new Blob([payload.content], { type: payload.mimeType });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = payload.filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return url;
};
