export function calculateGhostSeats(groupSize: number): number {
  if (groupSize <= 3) return 0;
  if (groupSize <= 7) return 1;
  return 2;
}
