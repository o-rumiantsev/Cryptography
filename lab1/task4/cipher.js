'use string';

const task3 = require('../task3');

const createCipherMapper = (ciphers, keys, type) => 
  (input) => 
    input
      .split('')
      .map((symbol, i) => ciphers[i % keys.length][type](symbol))
      .join('')

const createCipher = (alphabet, keys) => {
  const ciphers = keys.map(key => task3.createCipher(alphabet, key));
  return {
    encipher: createCipherMapper(ciphers, keys, 'encipher'),
    decipher: createCipherMapper(ciphers, keys, 'decipher'),
  };
};

module.exports = {
  createCipher,
};
