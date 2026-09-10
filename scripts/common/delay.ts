// Returns a random integer between minMs and maxMs (inclusive).
export function randomDelay(minMs: number, maxMs: number) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

// Returns a promise that resolves after a specified delay in milliseconds.
export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}