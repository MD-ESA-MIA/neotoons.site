interface CounterRecord {
  count: number;
  windowStart: number;
}

interface TimestampRecord {
  timestamps: number[];
}

export interface RateLimitCounterStore {
  increment(key: string, windowMs: number): { count: number; resetInMs: number };
}

export interface RateLimitSlidingWindowStore {
  pushAndCount(key: string, windowMs: number): { count: number; resetInMs: number };
}

class InMemoryCounterStore implements RateLimitCounterStore {
  private readonly state = new Map<string, CounterRecord>();

  increment(key: string, windowMs: number): { count: number; resetInMs: number } {
    const now = Date.now();
    const current = this.state.get(key);

    if (!current || now - current.windowStart > windowMs) {
      this.state.set(key, { count: 1, windowStart: now });
      return { count: 1, resetInMs: windowMs };
    }

    current.count += 1;
    this.state.set(key, current);
    return { count: current.count, resetInMs: Math.max(0, windowMs - (now - current.windowStart)) };
  }
}

class InMemorySlidingWindowStore implements RateLimitSlidingWindowStore {
  private readonly state = new Map<string, TimestampRecord>();

  pushAndCount(key: string, windowMs: number): { count: number; resetInMs: number } {
    const now = Date.now();
    const current = this.state.get(key) || { timestamps: [] };
    const timestamps = current.timestamps.filter((ts) => now - ts < windowMs);
    timestamps.push(now);
    this.state.set(key, { timestamps });

    const oldest = timestamps[0] || now;
    return {
      count: timestamps.length,
      resetInMs: Math.max(0, windowMs - (now - oldest)),
    };
  }
}

// Redis-ready adapter point: swap these with Redis-backed implementations without changing route logic.
export const counterRateLimitStore: RateLimitCounterStore = new InMemoryCounterStore();
export const slidingWindowRateLimitStore: RateLimitSlidingWindowStore = new InMemorySlidingWindowStore();
