'use strict';

const createCipherMapper = (mapping) => 
  (input) => 
    input
      .split('')
      .map(symbol => mapping[symbol])
      .join('');

const createSubstitutionCipher = (alphabet, key) => {
  const mapping = {
    toCipher: {},
    fromCipher: {},
  };

  alphabet.split('').forEach((symbol, i) => {
    mapping.toCipher[symbol] = key[i];
    mapping.fromCipher[key[i]] = symbol;
  });

  return {
    encode: createCipherMapper(mapping.toCipher),
    decode: createCipherMapper(mapping.fromCipher),
  }
};

module.exports = {
  createSubstitutionCipher,
};
