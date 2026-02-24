import NodeCache from 'node-cache';

const cache = new NodeCache({ checkperiod: 60 });

export const TTL = {
  SEARCH: 120,       // 2 min
  DETAILS: 600,      // 10 min
  CHARTS: 1800,      // 30 min
  GENRES: 3600,      // 1 hour
};

export function getCached(key) {
  return cache.get(key);
}

export function setCache(key, value, ttl) {
  cache.set(key, value, ttl);
}

export function cacheKey(prefix, ...parts) {
  return `${prefix}:${parts.join(':')}`;
}
