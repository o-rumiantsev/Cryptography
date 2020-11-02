'use strict';

const task3 = require('../task3');
const { TRIGRAMS, getTrigrams } = require('../utils');
const { createCipher } = require('./cipher');

class Population extends task3.Population {
  keys;
  keyIndex;

  constructor(size, alphabet, count, index) {
    super(size, alphabet, count);
    this.index = index;
  }

  updateKeys(keys) {
    this.keys = keys;
  }

  getFitness(chromosome, encipheredText) {
    this.keys[this.index] = chromosome;
    const cipher = createCipher(this.alphabet, this.keys);
    const decipheredText = cipher.decipher(encipheredText);    
    const trigrams = getTrigrams(decipheredText);
    return Object
      .entries(trigrams)
      .reduce(
        (sum, [trigram, frequency]) => 
          sum + frequency * Math.log2(TRIGRAMS[trigram] || 0),
        0
      );
  }
}

module.exports = {
  Population,
};
