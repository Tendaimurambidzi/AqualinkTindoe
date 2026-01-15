let sessionBytes = 0;

export function addBytesDownloaded(bytes: number) {
  if (!Number.isFinite(bytes)) return;
  sessionBytes += Math.max(0, Math.floor(bytes));
}

export function resetSessionBytes() {
  sessionBytes = 0;
}

export function getSessionMB() {
  return sessionBytes / (1024 * 1024);
}

export function overCap(mb: number) {
  if (!mb || mb <= 0) return false;
  return getSessionMB() >= mb;
}

