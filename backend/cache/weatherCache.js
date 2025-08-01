const cache = {};

function set(key, value, ttl) {
  const expires = Date.now() + ttl;
  cache[key] = { value, expires };
}

function get(key) {
  const item = cache[key];
  if (item && item.expires > Date.now()) {
    return item.value;
  } else {
    delete cache[key];
    return null;
  }
}

module.exports = { set, get };
