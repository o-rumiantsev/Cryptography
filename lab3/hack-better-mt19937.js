'use strict';

const uuid = require('uuid');
const {
  createAcc,
  makeBet,
  playModes,
} = require('./utils');
const { MersenneTwister } = require('./mt19937');

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
 * @returns {MersenneTwister} PRNG instance
 */
const hackMt = async () => {
  const outputs = [];

  for (let i = 0; i < MersenneTwister.N; ++i) {
    const { realNumber } = await makeBet(ID, playModes.BETTER_MT, 1, 0);
    outputs.push(realNumber);
    if (i % 100 === 99) {
      console.log(`Made ${i + 1} bets`);
    }
  }
  
  return MersenneTwister.from(outputs);
};

const makeALotOfMoney = async (mt) => {
  let money = 1000 - MersenneTwister.N;
  let bet = money / 2;

  while (money < DESIRED_BANK) {
    const betNumber = mt.next().value;
    const response = await makeBet(ID, playModes.BETTER_MT, bet, betNumber);

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
  .catch(console.error);
