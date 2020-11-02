'use strict';

const { readFile } = require('../utils');
const { createCipher } = require('./cipher');
const { Population } = require('./genetics');

const SELECTION_PROBABILITY = 0.3;
const SELECTION_WINNERS_PERCENTAGE = 0.4;
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
  population.select(SELECTION_WINNERS_PERCENTAGE, SELECTION_PROBABILITY);
  population.crossover(CROSSOVER_PROBABILITY, CROSSOVER_COEFFICIENT, MUTATION_PROBABILITY);
  population.next();

  const [bestFit] = [...population.fitnesses.values()];
  const key = population.generation[0];
  console.log(`Generation ${i + 1}; Key: ${key}; Best fit: ${bestFit}`);
}

const key = population.generation[0];
const cipher = createCipher(ALPHABET, key);

console.log({
  key,
  output: cipher.decipher(INPUT)
});
