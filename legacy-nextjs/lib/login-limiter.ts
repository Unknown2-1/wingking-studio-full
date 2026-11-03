// Defense-in-depth only. Serverless deployments additionally need shared WAF/rate limiting.
const state = new Map<string, { count: number; reset: number }>();
export function loginLimit(key: string, succeeded = false) {
  const now = Date.now();
  if (state.size > 3000) state.clear();
  if (succeeded) { state.delete(key); return false; }
  const item = state.get(key);
  if (!item || item.reset <= now) {
    state.set(key, { count: 1, reset: now + 15 * 60_000 });
    return false;
  }
  item.count += 1;
  return item.count > 5;
}
