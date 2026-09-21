export function formatPrice(price: number): string {
  return `₦${(price / 100).toLocaleString()}`;
}

export function generateReference(): string {
  return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateTotal(decoderPrice: number, packagePrice: number, installationPrice: number = 0): number {
  return decoderPrice + packagePrice + installationPrice;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return emailRegex.test(email);
}