export function isValidVnPhone(phone: string): boolean {
  return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone.trim());
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  return trimmed.startsWith("+84") ? "0" + trimmed.slice(3) : trimmed;
}
