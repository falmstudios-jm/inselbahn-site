/**
 * Calculate ghost (reserve) seats for a booking.
 * Kids count as half an adult for space calculation (2 kids = 1 adult equivalent).
 * Always max 1 ghost seat per booking (vehicle has 3 departments of 2 benches).
 * Ghost seats use the physical reserve and don't reduce online passenger slots.
 */
export function calculateGhostSeats(adults: number, children: number = 0, childrenFree: number = 0): number {
  const totalKids = children + childrenFree;
  const effectiveSize = adults + Math.ceil(totalKids / 2);

  // Groups of 1-3: no ghost seat needed (fits on one bench)
  // Groups of 4+: 1 ghost seat for comfort buffer
  if (effectiveSize <= 3) return 0;
  return 1;
}
