export function invoiceNumberFor(reference: string) {
  return `INV-${reference}`;
}

export function gstComponentCents(amountCents: number) {
  return Math.round(amountCents / 11);
}
