'use strict';

const uuid = require('uuid');
const {
  createAcc,
  makeBet,
  playModes,
} = require('./utils');
const { mtrand } = require('./mt19937');

/**
 * Account ID
 */
const ID = uuid.v4();

/**
 * Desired amount of money on acc
 */
const DESIRED_BANK = 1000000;


/**
 * Hack MT19937 randomizer
 * 
 * @param {number} seed
 * @returns {number} seed
 * constants for generating LCG numbers
 */
const hackMt = async (seed) => {
  const { realNumber } = await makeBet(ID, playModes.MT, 1, 0);

  for (let i = -60; i < 60; ++i) {
    const gen = mtrand(seed + i);
    if (gen.next().value === realNumber) {
      return seed + i;
    }
  }
  
  throw new Error('Could not determine MT19937 seed');
};

const makeALotOfMoney = async (seed) => {
  let money = 1000;
  let bet = money / 2;

  const gen = mtrand(seed);
  gen.next();

  while (money < DESIRED_BANK) {
    const betNumber = gen.next().value;
    const response = await makeBet(ID, playModes.MT, bet, betNumber);
    
    if (!response.realNumber) {
      throw response;
    }

    money = response.account.money;
    console.log(
      `Bet Number: ${betNumber}, Real Number: ${response.realNumber}, Bet: ${bet}, Money: ${money}`
    );

    bet = Math.floor(response.account.money / 2);
  }
};

const startTime = Math.floor(Date.now() / 1000);

createAcc(ID)
  .then(() => hackMt(startTime))
  .then(makeALotOfMoney)
  .catch(console.error)