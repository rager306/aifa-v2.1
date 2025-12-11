import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from '../rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limit records before each test
    const identifier = 'test@example.com';
    resetRateLimit(identifier);
  });

  it('allows requests within limit', () => {
    const identifier = 'test@example.com';

    for (let i = 0; i < 5; i++) {
      const allowed = checkRateLimit(identifier, 5);
      expect(allowed).toBe(true);
    }
  });

  it('blocks requests exceeding limit', () => {
    const identifier = 'test@example.com';

    // Use up all 5 attempts
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, 5);
    }

    // 6th attempt should be blocked
    const blocked = checkRateLimit(identifier, 5);
    expect(blocked).toBe(false);
  });

  it('resets after time window expires', () => {
    const identifier = 'test@example.com';

    // Use up limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, 5);
    }

    // Manually reset (simulating time passage)
    resetRateLimit(identifier);

    // Should allow again
    const allowed = checkRateLimit(identifier, 5);
    expect(allowed).toBe(true);
  });
});
