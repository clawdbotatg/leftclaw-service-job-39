// Preload-time polyfill for localStorage / sessionStorage during SSR/static export.
// Loaded via NODE_OPTIONS="--require ./polyfill-localstorage.cjs" when the build runs
// from packages/nextjs. Without this, any module that touches localStorage at import time
// (RainbowKit internals, some wagmi storage plugins, the SE2 block explorer if re-enabled)
// throws during static export and Next.js produces silent 404s.
const createStorage = () => {
  const store = new Map();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    key(i) {
      return Array.from(store.keys())[i] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
  };
};

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = createStorage();
}
if (typeof globalThis.sessionStorage === "undefined") {
  globalThis.sessionStorage = createStorage();
}
