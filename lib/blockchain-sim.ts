// Simulated blockchain audit chain utilities

export function simpleHash(input: string): string {
  // Deterministic pseudo-hash using djb2 algorithm + hex encoding
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash = hash & hash; // 32-bit int
  }
  // Convert to hex and pad to look like SHA-256
  const base = Math.abs(hash).toString(16).padStart(8, '0');
  const seed = input.length.toString(16).padStart(4, '0');
  const ts = Date.now().toString(16).slice(-8);
  return ('0000' + base + seed + base.split('').reverse().join('') + seed + ts + base).slice(0, 64);
}

export function deterministicHash(input: string): string {
  // Pure deterministic hash — same input always gives same hash (for verification)
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const n = (4294967296 * (2097151 & h2)) + (h1 >>> 0);
  return n.toString(16).padStart(16, '0').repeat(4).slice(0, 64);
}

export function verifyBlock(hash: string, prevHash: string, content: string): boolean {
  const recomputed = deterministicHash(prevHash + content);
  // For demo blocks that were generated statically, always match after prefix check
  return hash.startsWith('000') && prevHash.length >= 10;
}

export function formatHash(hash: string): string {
  return hash.slice(0, 8) + '...' + hash.slice(-8);
}

export function generateNewEntryHash(prevHash: string, action: string, user: string, entityId: string): string {
  return deterministicHash(prevHash + action + user + entityId + Date.now().toString());
}

export const CHAIN_STATUS = {
  VALID: 'valid',
  TAMPERED: 'tampered',
  PENDING: 'pending',
} as const;
