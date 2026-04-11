/**
 * Calculate ghost (reserve) seats for a booking.
 * Kids count as half an adult for space calculation (2 kids = 1 adult equivalent).
 * Ghost seats count WITHIN the online capacity (16), not on top of it.
 */
export function calculateGhostSeats(adults: number, children: number = 0, childrenFree: number = 0): number {
  // Effective group size: adults count as 1, kids count as 0.5 (rounded up)
  const totalKids = children + childrenFree;
  const effectiveSize = adults + Math.ceil(totalKids / 2);

  if (effectiveSize <= 3) return 0;
  if (effectiveSize <= 7) return 1;
  return 2;
}
