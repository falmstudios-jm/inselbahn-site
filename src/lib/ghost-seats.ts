/**
 * Every booking gets exactly 1 ghost (reserve) seat for comfort.
 * Ghost seats use the physical reserve (17-18) and don't reduce
 * online passenger slots. 1 buffer seat per booking, always.
 */
export function calculateGhostSeats(): number {
  return 1;
}
