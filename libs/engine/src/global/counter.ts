const COUNTER_STORE = new Map<string | symbol, number>();

export function increaseCounter(key: string | symbol) {
  const currentCount = COUNTER_STORE.get(key) || 0;
  COUNTER_STORE.set(key, currentCount + 1);
  return currentCount + 1;
}

export function decreaseCounter(key: string | symbol) {
  const currentCount = COUNTER_STORE.get(key) || 0;
  if (currentCount > 0) {
    COUNTER_STORE.set(key, currentCount - 1);
  }
  return currentCount - 1;
}

export function getCounter(key: string | symbol) {
  return COUNTER_STORE.get(key) || 0;
}
