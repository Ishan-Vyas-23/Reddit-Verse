class HashMap {
  constructor(size = 64) {
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
  }

  _hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % this.size;
    }
    return hash;
  }

  set(key, value) {
    const idx = this._hash(key);
    const bucket = this.buckets[idx];
    const existing = bucket.find(([k]) => k === key);
    if (existing) {
      existing[1] = value;
    } else {
      bucket.push([key, value]);
    }
  }

  get(key) {
    const idx = this._hash(key);
    const bucket = this.buckets[idx];
    const found = bucket.find(([k]) => k === key);
    return found ? found[1] : null;
  }

  clear() {
    this.buckets = new Array(this.size).fill(null).map(() => []);
  }
}

module.exports = HashMap;
