/* Stable seeded pseudo-random generation. No consumer may use Math.random for
   battle-bearing outcomes. */

function xmur3(value) {
  let hash = 1779033703 ^ value.length;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

export function createSeededRng(seed) {
  const seedText = String(seed ?? 'commune-battle-seed');
  const seedHash = xmur3(seedText)();
  let state = seedHash >>> 0;
  let draws = 0;
  function next() {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    draws += 1;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
  return {
    seed: seedText,
    next,
    between(min, max) { return min + next() * (max - min); },
    integer(min, maxInclusive) { return Math.floor(this.between(min, maxInclusive + 1)); },
    chance(probability) { return next() < probability; },
    pick(values) { return values.length ? values[this.integer(0, values.length - 1)] : undefined; },
    shuffle(values) {
      const copy = [...values];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = this.integer(0, index);
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
      }
      return copy;
    },
    snapshot() { return { seed: seedText, state, draws }; },
  };
}

