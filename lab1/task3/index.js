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

const { readFile } = require('../utils');
const { createSubstitutionCipher } = require('./cipher');
const { Population } = require('./genetics');

const TOURNAMENT_WINNER_PROBABILITY = 0.95;
const TOURNAMENT_WINNERS_PERCENTAGE = 0.3;
const MUTATION_PROBABILITY = 0.3;
const CROSSOVER_PROBABILITY = 0.75;
const CROSSOVER_COEFFICIENT = 0.3;
const POPULATION_SIZE = 100;
const GENERATIONS_COUNT = 500;

const ALPHABET = Buffer.from(
  Array.from({ length: 26 }, (_, i) => 'A'.charCodeAt(0) + i)
).toString();

const INPUT = readFile(__dirname + '/task4-text.txt');

const population = new Population(POPULATION_SIZE, ALPHABET, ALPHABET.length);

for (let i = 0; i < GENERATIONS_COUNT; ++i) {
  population.tournament(INPUT);
  population.select(TOURNAMENT_WINNERS_PERCENTAGE, TOURNAMENT_WINNER_PROBABILITY);
  population.crossover(CROSSOVER_PROBABILITY, CROSSOVER_COEFFICIENT, MUTATION_PROBABILITY);
  population.next();

  const [bestFit] = [...population.fitnesses.values()];
  const key = population.generation[0];
  console.log(`Generation ${i + 1}; Key: ${key}; Best fit: ${bestFit}`);
}

const key = population.generation[0];
console.log(key);

const cipher = createSubstitutionCipher(ALPHABET, key);
console.log(cipher.decode(INPUT));