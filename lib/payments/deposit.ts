export function isValidDepositPercent(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 100;
}

export function calculateDepositCents(priceCents: number, depositPercent: number) {
  if (!Number.isInteger(priceCents) || priceCents <= 0) return 0;
  if (!isValidDepositPercent(depositPercent)) return 0;

  const raw = Math.round((priceCents * depositPercent) / 100);
  const rounded = Math.round(raw / 100) * 100;
  return Math.min(priceCents, Math.max(100, rounded));
}

export function calculateBalanceCents(priceCents: number, depositCents: number) {
  return Math.max(0, priceCents - depositCents);
}

export const DEPOSIT_HOLD_MINUTES = 30;
