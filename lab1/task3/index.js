'use strict';

/**
 * Write a code to attack some simple substitution cipher.
 * To reduce the complexity of this one we will use only uppercase letters, 
 * so the keyspace is only 26! To get this one right automatically you will 
 * probably need to use some sort of genetic algorithm (which worked the best 
 * last year), simulated annealing or gradient descent. Seriously, write it 
 * right now, you will need it to decipher the next one as well. 
 * Bear in mind, there’s no spaces. 
 */

const { createCipher } = require('./cipher');
const { Population } = require('./genetics');

module.exports = {
  createCipher,
  Population,
};
