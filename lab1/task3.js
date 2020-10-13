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

const http = require('http');

/**
 * Known LCG modulus
 */
const MODULUS = 2**32;

/**
 * Simple HTTP GET tool
 * 
 * @param {string} url 
 * @returns {Promise<any>} response
 */
const request = (url) => new Promise(resolve => {
  let response = '';
  http.get(url, res => {
    res.on('data', (data) => response += data)
      .on('end', () => resolve(JSON.parse(response)));
  });
});

/**
 * Just to check constants
 */
const randomLcg = (last, multiplier, increment, modulus) => {
  const result = (multiplier * last + increment) % modulus;
  if (result > 2**31) {
    return result - 2**32;
  } else if (result < -(2**31)) {
    return 2**32 + result;
  } else {
    return result;
  }
};

const createAcc = () => request('http://95.217.177.249/casino/createacc?id=1');
const makeBet = (b, n) => request(`http://95.217.177.249/casino/playLcg?id=412312312&bet=${b}&number=${n}`);

// (async () => {
//   let prev = 0;
//   let betNumber = 0;
//   let bet = 1;

//   while (true) {
//     betNumber = randomLcg(prev, multiplier, increment, modulus);
//     const data = await makeBet(bet, betNumber || 1);
//     console.log(betNumber);
//     console.log(data);
//     prev = data.realNumber || 0;
//     bet = 1000;
//   }
// })();

const states = [753183501, 1417138440, -1382694713];

/**
 * Get greatest common divider
 * using Euclidean algorithm
 * 
 * @param {number} a 
 * @param {number} b 
 * @returns {[number, number, number]} [g, x, y] such that a*x + b*y = g
 */
const egcd = (a, b) => {
  if (a === 0) {
    return [b, 0 ,1];
  } else {
    const [g, x, y] = egcd(b % a, a);
    return [g, y - Math.floor(b / a) * x, x];
  }
};

/**
 * Get modular inverse
 * 
 * @param {number} b 
 * @param {number} n 
 * @returns {number} x such that (x * a) % b == 1
 */
const modinv = (b, n) => {
  const [g, x] = egcd(b, n);
  if (g == 1) {
    return x % n;
  }
};

/**
 * 
 * @param {number[]} states random states
 * @param {number} modulus 
 * @returns {number} multiplier
 */
const crackMultiplier = (states, modulus) =>
  (states[2] - states[1]) * modinv(states[1] - states[0], modulus) % modulus;
  
/**
 * 
 * @param {number[]} states random states
 * @param {number} modulus 
 * @param {number} multiplier 
 * @returns {number} increment
 */
const crackIncrement = (states, modulus, multiplier) =>
  (states[1] - states[0] * multiplier) % modulus;

const multiplier = crackMultiplier(states, MODULUS);
const increment = crackIncrement(states, multiplier, MODULUS);
console.log({ multiplier, increment });