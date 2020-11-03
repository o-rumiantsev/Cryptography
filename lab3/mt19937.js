'use strict';

const N = 624;

const uint32 = (x) => (new Uint32Array([x]))[0];

class MersenneTwister {
  index = 0;
  states = [];

  constructor(seed) {
    this.states[0] = uint32(seed);

    for (let i = 1; i < MersenneTwister.N; ++i) {
      const x = this.states[i - 1] ^ (this.states[i - 1] >>> 30);
      this.states[i] = uint32(
        ((((x & 0xffff0000) >>> 16) * 1812433253) << 16) +
        ((((x & 0x0000ffff) >>>  0) * 1812433253) <<  0) +
        i
      );
    }
  }

  static N = 624;

  static from(states) {
    const mt = new MersenneTwister(0);
    mt.states = states.map(MersenneTwister.untemper);
    return mt;
  }

  static temper(x) {
    x ^= (x >>> 11);
    x ^= (x << 7) & 0x9D2C5680;
    x ^= (x << 15) & 0xEFC60000;
    x ^= (x >>> 18);
    return uint32(x);
  }

  static untemper(x) {
    x ^= (x >>> 18);
    x ^= (x << 15) & 0xEFC60000;
    x ^= 
      ((x << 7) & 0x9D2C5680) ^
      ((x << 14) & 0x94284000) ^
      ((x << 21) & 0x14200000) ^
      ((x << 28) & 0x10000000);
    x ^= (x >>> 11) ^ (x >>> 22);
    return uint32(x);
  }

  next() {
    if (this.index === 0) {
      for (let i = 0; i < MersenneTwister.N; i++) {
        const x = uint32(
          (this.states[i] & (1 << 31)) + 
          (this.states[(i + 1) % MersenneTwister.N] & ((1 << 31) - 1))
        );
        this.states[i] = 
          (this.states[(i + 397) % MersenneTwister.N] ^ x >>> 1);
        this.states[i] = uint32(
          (x & 1) 
            ? (this.states[i] ^ 0x9908B0DF) 
            : this.states[i]
        );
      }
    }

    const value = MersenneTwister.temper(this.states[this.index]);
    this.index = (this.index + 1) % MersenneTwister.N;

    return {
      done: false,
      value,
    };
  }
}

module.exports = { MersenneTwister };
