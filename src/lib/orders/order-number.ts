// Vienas užsakymo numerio formatas visur: puslapyje, el. laiške ir pranešimuose.
// Paimami paskutiniai 12 Stripe ID simbolių didžiosiomis raidėmis.
export function formatOrderNumber(stripeId: string): string {
  return stripeId.slice(-12).toUpperCase();
}
