'use strict';

const createCipherMapper = (mapping) => 
  (input) => 
    input
      .split('')
      .map(symbol => mapping[symbol])
      .join('');

const createCipher = (alphabet, key) => {
  const mapping = {
    toCipher: {},
    fromCipher: {},
  };

  alphabet.split('').forEach((symbol, i) => {
    mapping.toCipher[symbol] = key[i];
    mapping.fromCipher[key[i]] = symbol;
  });

  return {
    encipher: createCipherMapper(mapping.toCipher),
    decipher: createCipherMapper(mapping.fromCipher),
  }
};

module.exports = {
  createCipher,
};
