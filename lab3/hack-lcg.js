'use strict';

const uuid = require('uuid');
const {
  createAcc,
  makeBet,
  playModes,
} = require('./utils');

/**
 * Account ID
 */
const ID = uuid.v4();

/**
 * Desired amount of money on acc
 */
const DESIRED_BANK = 1000000;

/**
 * Known LCG modulus
 */
const MODULUS = 2 ** 32;

/**
 * Get positive modulus
 * 
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
const mod = (a, b) => ((a % b) + b) % b;

/**
 * Get greatest common divider
 * using Euclidean algorithm
 * 
 * @param {number} a 
 * @param {number} b 
 * @returns {[number, number, number]} [g, x, y] such that a*x + b*y = gcd(a, b)
 */
const egcd = (a, b) => {
  if (a === 0) {
    return [b, 0 ,1];
  } else {
    const [g, x, y] = egcd(mod(b, a), a);
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
    return mod(x, n);
  }
};

/**
 * 
 * @param {number[]} states random states
 * @param {number} modulus 
 * @returns {number} multiplier
 */
const crackMultiplier = (states, modulus) =>
  Number(
    mod(
      BigInt(states[2] - states[1]) * 
        BigInt(modinv(states[1] - states[0], modulus)),
      BigInt(modulus)
    )
  );
  
/**
 * 
 * @param {number[]} states random states
 * @param {number} modulus 
 * @param {number} multiplier 
 * @returns {number} increment
 */
const crackIncrement = (states, modulus, multiplier) =>
  mod(states[1] - states[0] * multiplier, modulus);

/**
 * Hack LCG randomizer
 * Get three consecutive states where s0 and s1 has modulus inverse
 * 
 * @returns {{ multiplier: number, increment: number }} 
 * constants for generating LCG numbers
 */
const hackLCG = async () => {
  const states = [];

  for (let i = 0; i < 5; ++i) {
    const { realNumber } = await makeBet(ID, playModes.LCG, 1, 0);
    states.push(realNumber);
  }

  while (!modinv(states[1] - states[0], MODULUS)) {
    states.shift();
  }

  if (states.length < 3) {
    throw new Error('Failed to get usefull states');
  }

  const multiplier = crackMultiplier(states, MODULUS);
  const increment = crackIncrement(states, MODULUS, multiplier);
  
  return { multiplier, increment, prev: states.pop() };
};

/**
 * Generate LCG number based on previous one
 * 
 * @param {number} prev
 * @param {number} multiplier
 * @param {number} increment
 * @param {number} modulus
 * @returns {number} next LCG pseudorandom number
 */
const generateLCGNumber = (prev, multiplier, increment, modulus) => {
  const result = (multiplier * prev + increment) % modulus;
  if (result > 2 ** 31) {
    return result - 2 ** 32;
  } else if (result < -(2 ** 31)) {
    return 2 ** 32 + result;
  } else {
    return result;
  }
};

const makeALotOfMoney = async ({ multiplier, increment, prev }) => {
  let money = 1000;
  let betNumber = generateLCGNumber(prev, multiplier, increment, MODULUS);
  let bet = money / 2;

  while (money < DESIRED_BANK) {
    const response = await makeBet(ID, playModes.LCG, bet, betNumber);
    
    if (!response.realNumber) {
      throw response;
    }

    money = response.account.money;
    console.log(
      `Bet Number: ${betNumber}, Real Number: ${response.realNumber}, Bet: ${bet}, Money: ${money}`
    );

    betNumber = generateLCGNumber(response.realNumber, multiplier, increment, MODULUS);
    bet = Math.floor(response.account.money / 2);
  }
};

createAcc(ID)
  .then(hackLCG)
  .then(makeALotOfMoney)
  .catch(console.error);
